// Fetch a GitHub repo's README.md and render it — user only supplies the repo
// link (e.g. https://github.com/revyid/revyid), no paste, no broken images:
// relative image/link URLs inside the README are resolved to absolute GitHub
// raw/blob URLs. Results are cached 1h via Next fetch cache; any failure
// returns null so the caller silently falls back (never a broken render).

import { renderMarkdown } from "./markdown";

const GITHUB_REPO_RE = /^https?:\/\/github\.com\/([\w.-]+)\/([\w.-]+?)(?:[?#].*)?\/?$/;

export function parseGithubRepo(url: string): { owner: string; repo: string } | null {
  const m = (url || "").trim().match(GITHUB_REPO_RE);
  if (!m) return null;
  return { owner: m[1], repo: m[2] };
}

async function getDefaultBranch(owner: string, repo: string): Promise<string> {
  try {
    const r = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: { accept: "application/vnd.github+json" },
      next: { revalidate: 3600 },
    });
    if (!r.ok) return "main";
    const j = (await r.json()) as { default_branch?: string };
    return j.default_branch || "main";
  } catch {
    return "main";
  }
}

/** Returns { html } render-ready README HTML with absolute asset URLs, or null. */
export async function fetchGithubReadmeHtml(website: string): Promise<string | null> {
  const parsed = parseGithubRepo(website);
  if (!parsed) return null;
  const { owner, repo } = parsed;
  const branches = [await getDefaultBranch(owner, repo), "main", "master"];
  const tried = new Set<string>();
  for (const branch of branches) {
    if (tried.has(branch)) continue;
    tried.add(branch);
    const rawBase = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/`;
    let md: string | null = null;
    for (const name of ["README.md", "readme.md", "README"]) {
      try {
        const r = await fetch(`${rawBase}${name}`, { next: { revalidate: 3600 } });
        if (r.ok) { md = await r.text(); break; }
      } catch { /* try next */ }
    }
    if (md) {
      const linkBase = `https://github.com/${owner}/${repo}/blob/${branch}/`;
      return renderMarkdown(md, { imgBase: rawBase, linkBase });
    }
  }
  return null;
}
