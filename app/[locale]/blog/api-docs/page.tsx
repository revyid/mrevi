import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";

const BASE_URL = "https://revy.my.id";

export const metadata: Metadata = {
  title: "API Documentation — M. Revi Ramadhan",
  description: "API documentation for GitHub API proxy and code playground endpoints.",
  openGraph: {
    type: "website",
    url: `${BASE_URL}/en/blog/api-docs`,
    title: "API Documentation — M. Revi Ramadhan",
    description: "API documentation for GitHub API proxy and code playground.",
  },
  alternates: { canonical: `${BASE_URL}/en/blog/api-docs` },
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.revy.my.id";

export default async function ApiDocsPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 space-y-12">
      <section>
        <Link href="/blog">
          <button className="text-sm text-muted-foreground hover:text-foreground mb-6 flex items-center gap-2">
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5 M12 19l-7-7 7-7" />
            </svg>
            Back to Blog
          </button>
        </Link>

        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight font-heading mb-4">
          API Documentation
        </h1>
        <p className="text-lg text-muted-foreground">
          Free GitHub API proxy + code playground. No GitHub token needed — just your API key.
        </p>
      </section>

      {/* Auth */}
      <section className="space-y-4">
        <h2 className="text-3xl font-bold font-heading">Authentication</h2>
        <p className="text-muted-foreground">
          All endpoints require an API key. Include it in the request header:
        </p>
        <div className="bg-secondary/50 rounded-lg p-4 font-mono text-sm">
          <pre className="overflow-x-auto">{"x-api-key: your_api_key_here"}</pre>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <p className="text-sm text-blue-200">
            <strong>How to get an API Key:</strong>
          </p>
          <ol className="text-sm text-blue-200/80 mt-2 list-decimal list-inside space-y-1">
            <li>Login at <Link href="/profile" className="underline">revy.my.id/profile</Link></li>
            <li>Scroll to &quot;API Authentication&quot; section</li>
            <li>Your API key is auto-generated on first visit</li>
            <li>Copy and store it securely — full key is only shown once</li>
          </ol>
        </div>
      </section>

      {/* Base URL */}
      <section className="space-y-4">
        <h2 className="text-3xl font-bold font-heading">Base URL</h2>
        <div className="bg-secondary/50 rounded-lg p-4 font-mono text-sm">
          <pre>{API_BASE_URL}</pre>
        </div>
      </section>

      {/* GitHub API Proxy */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold font-heading">GitHub API Proxy</h2>
        <p className="text-muted-foreground">
          Access GitHub API for free using the proxy. Supports user info, repos, search, orgs, gists, and rate limit.
        </p>

        <div className="border border-border rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded text-sm font-mono">GET</span>
            <code className="text-lg font-mono">/api/github</code>
          </div>
          <p className="text-muted-foreground">
            Pass <code className="bg-secondary px-1.5 py-0.5 rounded">path</code> param to target a GitHub API endpoint.
          </p>

          {/* Params table */}
          <div className="space-y-2">
            <h4 className="font-semibold">Parameters</h4>
            <div className="bg-secondary/50 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-2 font-semibold">Param</th>
                    <th className="text-left px-4 py-2 font-semibold">Required</th>
                    <th className="text-left px-4 py-2 font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/50">
                    <td className="px-4 py-2 font-mono">path</td>
                    <td className="px-4 py-2">Yes</td>
                    <td className="px-4 py-2 text-muted-foreground">GitHub API path (see examples below)</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="px-4 py-2 font-mono">q</td>
                    <td className="px-4 py-2">No</td>
                    <td className="px-4 py-2 text-muted-foreground">Search query (for search endpoints)</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="px-4 py-2 font-mono">sort</td>
                    <td className="px-4 py-2">No</td>
                    <td className="px-4 py-2 text-muted-foreground">Sort field (stars, updated, created, etc.)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-mono">per_page</td>
                    <td className="px-4 py-2">No</td>
                    <td className="px-4 py-2 text-muted-foreground">Results per page (default: 30, max: 100)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Examples */}
          <div className="space-y-4">
            <h4 className="font-semibold">Allowed Paths &amp; Examples</h4>

            <div className="space-y-3">
              {/* Authenticated user */}
              <div className="bg-secondary/30 rounded-lg p-4">
                <p className="font-mono text-sm mb-2"><code>user</code> — Authenticated user info</p>
                <div className="bg-secondary/50 rounded p-3 font-mono text-xs overflow-x-auto">
                  <pre>{`GET ${API_BASE_URL}/api/github?path=user

curl -H "x-api-key: YOUR_KEY" \\
  "${API_BASE_URL}/api/github?path=user"`}</pre>
                </div>
              </div>

              {/* Public user */}
              <div className="bg-secondary/30 rounded-lg p-4">
                <p className="font-mono text-sm mb-2"><code>users/{'{username}'}</code> — Public user profile</p>
                <div className="bg-secondary/50 rounded p-3 font-mono text-xs overflow-x-auto">
                  <pre>{`GET ${API_BASE_URL}/api/github?path=user/revyfachryza

curl -H "x-api-key: YOUR_KEY" \\
  "${API_BASE_URL}/api/github?path=user/revyfachryza"`}</pre>
                </div>
              </div>

              {/* Repos */}
              <div className="bg-secondary/30 rounded-lg p-4">
                <p className="font-mono text-sm mb-2"><code>user/repos</code> — Authenticated user&apos;s repos</p>
                <div className="bg-secondary/50 rounded p-3 font-mono text-xs overflow-x-auto">
                  <pre>{`GET ${API_BASE_URL}/api/github?path=user/repos&per_page=10

curl -H "x-api-key: YOUR_KEY" \\
  "${API_BASE_URL}/api/github?path=user/repos&per_page=10"`}</pre>
                </div>
              </div>

              {/* User repos */}
              <div className="bg-secondary/30 rounded-lg p-4">
                <p className="font-mono text-sm mb-2"><code>users/{'{username}'}/repos</code> — User&apos;s public repos</p>
                <div className="bg-secondary/50 rounded p-3 font-mono text-xs overflow-x-auto">
                  <pre>{`GET ${API_BASE_URL}/api/github?path=user/revyfachryza/repos&sort=updated&per_page=5`}</pre>
                </div>
              </div>

              {/* Search repos */}
              <div className="bg-secondary/30 rounded-lg p-4">
                <p className="font-mono text-sm mb-2"><code>search/repositories</code> — Search repositories</p>
                <div className="bg-secondary/50 rounded p-3 font-mono text-xs overflow-x-auto">
                  <pre>{`GET ${API_BASE_URL}/api/github?path=search/repositories&q=nextjs+typescript&sort=stars&per_page=10

curl -H "x-api-key: YOUR_KEY" \\
  "${API_BASE_URL}/api/github?path=search/repositories&q=nextjs&sort=stars"`}</pre>
                </div>
              </div>

              {/* Search users */}
              <div className="bg-secondary/30 rounded-lg p-4">
                <p className="font-mono text-sm mb-2"><code>search/users</code> — Search users</p>
                <div className="bg-secondary/50 rounded p-3 font-mono text-xs overflow-x-auto">
                  <pre>{`GET ${API_BASE_URL}/api/github?path=search/users&q=revy`}</pre>
                </div>
              </div>

              {/* Orgs */}
              <div className="bg-secondary/30 rounded-lg p-4">
                <p className="font-mono text-sm mb-2"><code>user/orgs</code> — Authenticated user&apos;s organizations</p>
                <div className="bg-secondary/50 rounded p-3 font-mono text-xs overflow-x-auto">
                  <pre>{`GET ${API_BASE_URL}/api/github?path=user/orgs`}</pre>
                </div>
              </div>

              {/* Gists */}
              <div className="bg-secondary/30 rounded-lg p-4">
                <p className="font-mono text-sm mb-2"><code>users/{'{username}'}/gists</code> — User&apos;s gists</p>
                <div className="bg-secondary/50 rounded p-3 font-mono text-xs overflow-x-auto">
                  <pre>{`GET ${API_BASE_URL}/api/github?path=user/revyfachryza/gists&per_page=5`}</pre>
                </div>
              </div>

              {/* Rate limit */}
              <div className="bg-secondary/30 rounded-lg p-4">
                <p className="font-mono text-sm mb-2"><code>rate_limit</code> — Check API rate limit status</p>
                <div className="bg-secondary/50 rounded p-3 font-mono text-xs overflow-x-auto">
                  <pre>{`GET ${API_BASE_URL}/api/github?path=rate_limit`}</pre>
                </div>
              </div>
            </div>
          </div>

          {/* Response */}
          <div className="space-y-2">
            <h4 className="font-semibold">Response Format</h4>
            <div className="bg-secondary/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre>
{`{
  "status": "ok",
  "data": { ... },
  "meta": {
    "path": "user/repos",
    "authenticated": true,
    "rateLimit": "59",
    "rateLimitReset": "1711929600"
  }
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Playground */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold font-heading">Code Playground</h2>
        <p className="text-muted-foreground">
          Execute code in Go, Rust, or PHP via sandboxed containers. No outbound network from sandbox.
        </p>

        <div className="border border-border rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded text-sm font-mono">POST</span>
            <code className="text-lg font-mono">/api/playground</code>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">Supported Languages</h4>
            <div className="flex gap-2">
              <span className="bg-secondary/50 px-3 py-1 rounded text-sm font-mono">go</span>
              <span className="bg-secondary/50 px-3 py-1 rounded text-sm font-mono">rust</span>
              <span className="bg-secondary/50 px-3 py-1 rounded text-sm font-mono">php</span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">Request Body</h4>
            <div className="bg-secondary/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre>
{`{
  "lang": "go",
  "code": "package main\\nimport \\"fmt\\"\\nfunc main() { fmt.Println(\\"Hello!\\") }"
}`}
              </pre>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">Example</h4>
            <div className="bg-secondary/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre>
{`curl -X POST ${API_BASE_URL}/api/playground \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: your_api_key_here" \\
  -d '{"lang":"go","code":"package main\\nimport \\"fmt\\"\\nfunc main() { fmt.Println(\\"Hello from Go!\\") }"}'`}
              </pre>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">Response</h4>
            <div className="bg-secondary/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre>
{`{
  "error": false,
  "output": "Hello from Go!"
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Sandbox Features */}
      <section className="space-y-4">
        <h2 className="text-3xl font-bold font-heading">Sandbox Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-2">JavaScript</h3>
            <p className="text-sm text-muted-foreground">Runs natively in your browser with real fetch and response.</p>
          </div>
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Python</h3>
            <p className="text-sm text-muted-foreground">Real CPython via Pyodide (WebAssembly); requests patched to use browser network.</p>
          </div>
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-2">TypeScript</h3>
            <p className="text-sm text-muted-foreground">Transpiles to JS via official TS compiler, then runs natively.</p>
          </div>
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-2">cURL</h3>
            <p className="text-sm text-muted-foreground">Parses curl commands and executes via server proxy — no CORS restrictions.</p>
          </div>
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Go / Rust / PHP</h3>
            <p className="text-sm text-muted-foreground">Compiles &amp; runs via glot.io (server-side). No outbound network from sandbox.</p>
          </div>
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Code Persistence</h3>
            <p className="text-sm text-muted-foreground">Your code stays until you hit Reset. Switching languages preserves your edits.</p>
          </div>
        </div>
      </section>

      {/* Errors */}
      <section className="space-y-4">
        <h2 className="text-3xl font-bold font-heading">Error Responses</h2>
        <div className="space-y-3">
          <div className="border border-border rounded-lg p-4">
            <code className="text-red-400 text-sm">401 Unauthorized</code>
            <div className="bg-secondary/50 rounded p-3 font-mono text-sm mt-2 overflow-x-auto">
              <pre>{'{ "error": "API key required" }\n{ "error": "Invalid API key" }\n{ "error": "API key is inactive" }\n{ "error": "API key expired" }'}</pre>
            </div>
          </div>
          <div className="border border-border rounded-lg p-4">
            <code className="text-red-400 text-sm">403 Forbidden</code>
            <div className="bg-secondary/50 rounded p-3 font-mono text-sm mt-2 overflow-x-auto">
            </div>
          </div>
          <div className="border border-border rounded-lg p-4">
            <code className="text-red-400 text-sm">429 Too Many Requests</code>
            <div className="bg-secondary/50 rounded p-3 font-mono text-sm mt-2">
              <pre>{'{ "error": "Rate limit exceeded" }'}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* Rate Limits */}
      <section className="space-y-4">
        <h2 className="text-3xl font-bold font-heading">Rate Limits</h2>
        <p className="text-muted-foreground">
          Rate limits are enforced per API key on an hourly basis. The response includes GitHub&apos;s rate limit info in <code className="bg-secondary px-1.5 py-0.5 rounded">meta.rateLimit</code>.
        </p>
      </section>

      {/* Support */}
      <section className="space-y-4">
        <h2 className="text-3xl font-bold font-heading">Support</h2>
        <p className="text-muted-foreground">
          Questions? Contact me through the{" "}
          <Link href="/contact" className="text-accent hover:underline">
            contact form
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
