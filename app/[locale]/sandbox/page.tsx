'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Square, Loader2, RotateCcw, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getOrCreateApiKeyAction } from '@/app/actions/auth';

type LogFn = (line: string) => void;

function makeCon(log: LogFn) {
  return {
    log: (...a: unknown[]) => log(a.map(x => typeof x === 'object' ? JSON.stringify(x, null, 2) : String(x)).join(' ')),
    warn: (...a: unknown[]) => log('Warning: ' + a.join(' ')),
    error: (...a: unknown[]) => log('Error: ' + a.join(' ')),
  };
}

function withTimeout<T>(promise: Promise<T>, ms: number, label = 'Operation'): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, rej) => setTimeout(() => rej(new Error(`${label} timed out after ${ms / 1000}s`)), ms))
  ]);
}

function makeSandboxedFetch(log: LogFn, apiBase: string, apiKey: string) {
  return async (url: string, opts?: RequestInit) => {
    const t0 = performance.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      // Ensure the URL points to our API or is absolute
      let targetUrl = url;
      if (url.startsWith('/api/') || url.startsWith('api/')) {
        const cleanPath = url.startsWith('/') ? url : `/${url}`;
        targetUrl = `${apiBase}${cleanPath}`;
      }

      // Add x-api-key header if not present
      const headers = new Headers(opts?.headers || {});
      if (!headers.has('x-api-key') && apiKey) {
        headers.set('x-api-key', apiKey);
      }

      const res = await window.fetch(targetUrl, { ...opts, headers, signal: controller.signal });
      const ms = Math.round(performance.now() - t0);
      log(`> ${opts?.method || 'GET'} ${targetUrl}`);
      log(`< HTTP/1.1 ${res.status} ${res.statusText}`);
      const ct = res.headers.get('content-type');
      if (ct) log(`< content-type: ${ct}`);
      log(`< time: ${ms}ms`);
      log('');
      const cloned = res.clone();
      try {
        const body = await cloned.json();
        log(JSON.stringify(body, null, 2));
      } catch {
        log(await res.text());
      }
      return res;
    } catch (e: unknown) {
      const msg = e instanceof Error ? (e.name === 'AbortError' ? 'request timed out' : e.message) : String(e);
      log(`Error: ${msg}`);
      throw e instanceof Error ? e : new Error(msg);
    } finally {
      clearTimeout(timer);
    }
  };
}

async function runJS(code: string, log: LogFn, apiBase: string, apiKey: string): Promise<void> {
  const fn = new Function('fetch', 'console', `return (async()=>{\n${code}\n})()`);
  await withTimeout(Promise.resolve(fn(makeSandboxedFetch(log, apiBase, apiKey), makeCon(log))), 20000, 'Script');
}

let pyodideInst: any = null;
let pyodidePromise: Promise<any> | null = null;

async function getPyodide(): Promise<any> {
  if (pyodideInst) return pyodideInst;
  if (pyodidePromise) return pyodidePromise;
  pyodidePromise = (async () => {
    try {
      if (!(window as any).loadPyodide) {
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';
        document.head.appendChild(s);
        await new Promise<void>((res, rej) => {
          s.onload = () => res();
          s.onerror = () => rej(new Error('Could not load Python runtime'));
        });
      }
      const py = await (window as any).loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/' });
      await py.loadPackage('micropip');
      await py.runPythonAsync(`import micropip
await micropip.install(["requests", "pyodide-http"])
import pyodide_http
pyodide_http.patch_all()`);
      pyodideInst = py;
      return py;
    } catch (e) {
      pyodidePromise = null;
      throw e;
    }
  })();
  return pyodidePromise;
}

async function runPython(code: string, log: LogFn): Promise<void> {
  log('# Loading Python runtime (Pyodide / WebAssembly)...\n');
  const py = await getPyodide();
  log('# Runtime ready — running your code.\n');
  const filterNoise = (l: string) => !l.includes('InsecureRequestWarning') && !l.includes('warnings.warn') && !l.includes('urllib3');
  py.setStdout({ batched: (t: string) => t.split('\n').filter(Boolean).filter(filterNoise).forEach(l => log(l)) });
  py.setStderr({ batched: (t: string) => t.split('\n').filter(Boolean).filter(filterNoise).forEach(l => log('Error: ' + l)) });
  await withTimeout(py.runPythonAsync(code), 25000, 'Python script');
}

let tsCompiler: any = null;
async function getTsCompiler(): Promise<any> {
  if (tsCompiler) return tsCompiler;
  if (!(window as any).ts) {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/typescript@5.4.5/lib/typescript.min.js';
    document.head.appendChild(s);
    await new Promise<void>((res, rej) => {
      s.onload = () => res();
      s.onerror = () => rej(new Error('Failed to load TypeScript compiler'));
    });
  }
  tsCompiler = (window as any).ts;
  return tsCompiler;
}

async function runTypeScript(code: string, log: LogFn, apiBase: string, apiKey: string): Promise<void> {
  log('# Transpiling TypeScript to JavaScript...\n');
  const ts = await getTsCompiler();
  const js = ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, strict: true } }).outputText;
  log('# Running transpiled code...\n');
  await runJS(js, log, apiBase, apiKey);
}

async function runCurl(code: string, log: LogFn, apiBase: string, apiKey: string): Promise<void> {
  try {
    const { parseCurlCommand } = await import('@/lib/curl-parser');
    const options = parseCurlCommand(code);
    
    // Rewrite relative API paths to the new API project
    if (options.url.startsWith('/api/') || options.url.startsWith('api/')) {
      const cleanPath = options.url.startsWith('/') ? options.url : `/${options.url}`;
      options.url = `${apiBase}${cleanPath}`;
    }
    
    // Attach API key header if missing
    if (!options.headers['x-api-key'] && apiKey) {
      options.headers['x-api-key'] = apiKey;
    }

    log(`> ${code.replace(/\n\s*/g, ' ').trim()}`);
    log('');

    const response = await fetch('/api/curl-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error);

    log(`< HTTP/1.1 ${data.status} ${data.statusText}`);
    for (const [k, v] of Object.entries(data.headers || {})) {
      log(`< ${k}: ${v}`);
    }
    if (data.duration) log(`< time: ${data.duration}ms`);
    log('');
    if (typeof data.body === 'object') {
      log(JSON.stringify(data.body, null, 2));
    } else {
      log(String(data.body));
    }
  } catch (e: any) {
    log(`Error: ${e.message}`);
  }
}

async function runGlot(lang: 'go' | 'rust' | 'php', code: string, log: LogFn, apiBase: string, apiKey: string): Promise<void> {
  log(`# Sending ${lang} code to /api/playground on ${apiBase}...\n`);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(`${apiBase}/api/playground`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({ lang, code }),
      signal: controller.signal,
    });
    const data = await res.json().catch(() => ({ error: true, output: 'Invalid JSON response from server.' }));
    if (data.error) {
      const stage = data.stage ? `[${data.stage}] ` : '';
      log(`Error: ${stage}${data.output}`);
    } else {
      log(data.output);
    }
  } catch (e: unknown) {
    if (e instanceof Error && e.name === 'AbortError') {
      log('Error: Request timed out. The sandbox may be busy — try again.');
    } else {
      log(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
  } finally {
    clearTimeout(timer);
  }
}

type Lang = 'JavaScript' | 'Python' | 'TypeScript' | 'cURL' | 'Go' | 'Rust' | 'PHP';
const LANGS: Lang[] = ['JavaScript', 'Python', 'TypeScript', 'cURL', 'Go', 'Rust', 'PHP'];

const EXAMPLES = [
  { id: 'gh-user', label: 'GitHub User', path: 'api/github?path=user' },
  { id: 'gh-user-info', label: 'User Info', path: 'api/github?path=user/revyfachryza' },
  { id: 'gh-repos', label: 'My Repos', path: 'api/github?path=user/repos&per_page=10' },
  { id: 'gh-search-repo', label: 'Search Repos', path: 'api/github?path=search/repositories&q=nextjs' },
  { id: 'gh-rate', label: 'Rate Limit', path: 'api/github?path=rate_limit' },
  { id: 'gh-orgs', label: 'My Orgs', path: 'api/github?path=user/orgs' },
  { id: 'playground', label: 'Playground', path: 'api/playground' },
];

const LANG_INFO: Record<Lang, string> = {
  JavaScript: 'Runs natively in your browser — real fetch, real response.',
  Python: 'Real CPython via Pyodide (WebAssembly); requests patched to use browser network.',
  TypeScript: 'Transpiles to JS via official TS compiler, then runs natively.',
  cURL: 'Parses curl commands and executes via server proxy — no CORS restrictions.',
  Go: 'Compiles & runs via glot.io (server-side). No outbound network from sandbox.',
  Rust: 'Compiles & runs via glot.io (server-side). No outbound network from sandbox.',
  PHP: 'Runs via glot.io (server-side). No outbound network from sandbox.',
};

function sdkCode(lang: Lang, p: string, apiBase: string, apiKey: string): string {
  const k = apiKey || 'your_api_key_here';

  if (lang === 'Go') {
    return `package main

import "fmt"

func main() {
    fmt.Println("Hello from Go!")
    fmt.Println("Sandbox: glot.io (no outbound network)")
}`;
  }
  if (lang === 'Rust') {
    return `fn main() {
    println!("Hello from Rust!");
    println!("Sandbox: glot.io (no outbound network)");
}`;
  }
  if (lang === 'PHP') {
    return `<?php
echo "Hello from PHP!\\n";
echo "Sandbox: glot.io (no outbound network)\\n";`;
  }

  const url = `${apiBase}/${p}`;
  switch (lang) {
    case 'JavaScript': 
      return `const API_KEY = '${k}';\nconst URL = '${url}';\n\nasync function getData() {\n  const res = await fetch(URL, {\n    headers: { 'x-api-key': API_KEY }\n  });\n  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);\n  return res.json();\n}\n\nconst data = await getData();\nconsole.log(data);`;
    case 'Python': 
      return `import requests\n\nAPI_KEY = "${k}"\nURL = "${url}"\n\nres = requests.get(\n    URL,\n    headers={"x-api-key": API_KEY},\n    timeout=10,\n)\nres.raise_for_status()\nprint(res.status_code)\nprint(res.json())`;
    case 'TypeScript': 
      return `interface ApiResponse {\n  status: string;\n  data: any;\n}\n\nconst API_KEY: string = '${k}';\nconst URL: string = '${url}';\n\nasync function getData(): Promise<ApiResponse> {\n  const res = await fetch(URL, {\n    headers: { 'x-api-key': API_KEY }\n  });\n  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);\n  return res.json() as Promise<ApiResponse>;\n}\n\nconst data: ApiResponse = await getData();\nconsole.log(data);`;
    case 'cURL': 
      return `curl -s -H "x-api-key: ${k}" \\\n  "${url}"`;
    default:
      return '';
  }
}

export default function SandboxPage() {
  const [lang, setLang] = useState<Lang>('JavaScript');
  const [example, setExample] = useState(EXAMPLES[0]);
  const [apiKey, setApiKey] = useState<string>('');
  const [apiBase, setApiBase] = useState<string>('http://localhost:3001');
  const [code, setCode] = useState('');
  const [lines, setLines] = useState<string[]>([]);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      setApiBase(url);

      // Try fetching API key from server action
      getOrCreateApiKeyAction().then(res => {
        if (res.success && res.id) {
          const stored = localStorage.getItem(`mrevi_api_key_${res.id}`);
          if (stored) {
            setApiKey(stored);
          }
        }
      });
    }
  }, []);

  useEffect(() => {
    if (!running && !code) {
      setCode(sdkCode(lang, example.path, apiBase, apiKey));
    }
  }, [lang, example, apiBase, apiKey, running, code]);

  const run = async () => {
    setRunning(true);
    setLines([]);
    try {
      if (lang === 'JavaScript') await runJS(code, addLine, apiBase, apiKey);
      else if (lang === 'Python') await runPython(code, addLine);
      else if (lang === 'TypeScript') await runTypeScript(code, addLine, apiBase, apiKey);
      else if (lang === 'cURL') await runCurl(code, addLine, apiBase, apiKey);
      else if (lang === 'Go') await runGlot('go', code, addLine, apiBase, apiKey);
      else if (lang === 'Rust') await runGlot('rust', code, addLine, apiBase, apiKey);
      else if (lang === 'PHP') await runGlot('php', code, addLine, apiBase, apiKey);
    } catch (e: unknown) {
      addLine(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
    setRunning(false);
  };

  const addLine = (line: string) => {
    setLines(prev => [...prev, line]);
  };

  const reset = () => {
    setCode(sdkCode(lang, example.path, apiBase, apiKey));
    setLines([]);
  };

  return (
    <div className="space-y-12 w-full py-8">
      <div>
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[90px] font-bold uppercase leading-[0.95] tracking-tight font-heading">
          <span className="block">API</span>
          <span className="block text-muted-foreground/20">SANDBOX</span>
        </h1>
        <p className="text-muted-foreground text-lg mt-4 max-w-2xl">
          {LANG_INFO[lang]} Test the GitHub API proxy using your key or the default public key.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-2 max-w-xl">
          <div className="flex-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">API Key</label>
            <input 
              type="text" 
              value={apiKey} 
              onChange={e => setApiKey(e.target.value)} 
              placeholder="Enter your API key"
              className="w-full bg-white/[0.03] border border-white/10 rounded-lg p-2.5 font-mono text-sm outline-none focus:border-primary/50 text-foreground"
            />
          </div>
          <div className="w-full sm:w-64">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">API Base URL</label>
            <input 
              type="text" 
              value={apiBase} 
              onChange={e => setApiBase(e.target.value)} 
              placeholder="http://localhost:3001"
              className="w-full bg-white/[0.03] border border-white/10 rounded-lg p-2.5 font-mono text-sm outline-none focus:border-primary/50 text-foreground"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1 bg-white/[0.03] border border-white/10 rounded-lg p-1">
            {LANGS.map(l => (
              <button 
                key={l} 
                onClick={() => setLang(l)} 
                disabled={running}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${lang === l ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {l}
              </button>
            ))}
          </div>
          <div className="flex gap-1 bg-white/[0.03] border border-white/10 rounded-lg p-1">
            {EXAMPLES.map(ex => (
              <button 
                key={ex.id} 
                onClick={() => setExample(ex)} 
                disabled={running}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${example.id === ex.id ? 'bg-white/[0.05] text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative h-[550px] rounded-xl border border-white/10 overflow-hidden flex flex-col md:flex-row bg-black">
        {/* Editor */}
        <div className="flex-1 min-h-[250px] flex flex-col border-b md:border-b-0 md:border-r border-white/10">
          <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.02] border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-xs text-muted-foreground/50 font-mono ml-2">{lang.toLowerCase()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={reset} disabled={running} className="h-8 px-2.5">
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
              <Button size="sm" onClick={run} disabled={running} className="h-8 px-4 font-semibold">
                {running ? <Square className="w-3.5 h-3.5 mr-2 animate-pulse" /> : <Play className="w-3.5 h-3.5 mr-2" />}
                {running ? 'Running' : 'Run'}
              </Button>
            </div>
          </div>
          <textarea 
            value={code} 
            onChange={e => setCode(e.target.value)} 
            spellCheck={false} 
            disabled={running}
            className="flex-1 w-full p-4 bg-transparent text-white font-mono text-sm leading-relaxed resize-none outline-none disabled:opacity-60" 
          />
        </div>

        {/* Console */}
        <div className="flex-1 min-h-[250px] flex flex-col">
          <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.02] border-b border-white/10 shrink-0">
            <span className="text-xs text-muted-foreground/60 font-mono">console</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 bg-neutral-950 font-mono text-sm">
            {lines.length === 0 ? (
              <div className="text-muted-foreground/30">Output appears here...</div>
            ) : (
              <pre className="whitespace-pre-wrap break-all select-text">
                {lines.map((l, i) => {
                  let cls = 'text-neutral-300';
                  if (l.startsWith('>')) cls = 'text-primary';
                  else if (l.startsWith('< HTTP')) cls = /\s2\d\d\s/.test(l) ? 'text-green-400' : 'text-red-400';
                  else if (l.startsWith('<')) cls = 'text-neutral-500';
                  else if (l.toLowerCase().includes('error') || l.toLowerCase().includes('fail')) cls = 'text-red-400';
                  return <div key={i} className={cls}>{l}</div>;
                })}
              </pre>
            )}
          </div>
        </div>

        {running && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center pointer-events-none z-10">
            <div className="flex items-center gap-2 px-5 py-3 bg-neutral-900 rounded-xl shadow-2xl border border-white/10">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm font-semibold text-white">
                {lang === 'Python' ? 'Loading Python...' : lang === 'TypeScript' ? 'Transpiling...' : (lang === 'Go' || lang === 'Rust' || lang === 'PHP') ? 'Compiling & running...' : 'Running...'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
