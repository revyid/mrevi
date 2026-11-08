// Minimal GitHub-style markdown -> sanitized HTML (no new dependencies).
// Supports inline HTML blocks like GitHub profile READMEs (div/picture/img/a)
// via sanitize-html with a README-style allowlist: scripts, event handlers,
// forms, styles and everything else unsafe is stripped before markdown runs.

import sanitizeHtml from "sanitize-html";

// GitHub README allowlist (subset): layout tags + media + links.
const BIO_TAGS = [
  "div", "p", "br", "hr",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "picture", "source", "img",
  "a", "strong", "em", "b", "i", "s", "code", "pre",
  "blockquote", "ul", "ol", "li",
  "table", "thead", "tbody", "tr", "th", "td",
  "sub", "sup",
];

const BIO_SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: BIO_TAGS,
  allowedAttributes: {
    "*": ["align", "class", "id"],
    a: ["href", "rel", "title"],
    img: ["src", "srcset", "alt", "width", "height"],
    source: ["src", "srcset", "media", "type"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
  },
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inline(text: string): string {
  const code: string[] = [];
  let t = text.replace(/`([^`]+)`/g, (_m, c) => {
    code.push(`<code>${c}</code>`);
    return `\u0001${code.length - 1}\u0001`;
  });
  t = t.replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  t = t.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  t = t.replace(/\u0001(\d+)\u0001/g, (_m, i) => code[Number(i)]);
  return t;
}

export interface MarkdownOptions {
  /** Base URL for relative images (e.g. GitHub raw base). */
  imgBase?: string;
  /** Base URL for relative links. Falls back to imgBase. */
  linkBase?: string;
}

export function renderMarkdown(src: string, opts?: MarkdownOptions): string {
  // 1) Sanitize raw input (HTML passthrough, dangerous bits removed).
  const clean = sanitizeHtml(src ?? "", BIO_SANITIZE_OPTIONS);
  // 2) Resolve relative asset URLs (GitHub READMEs link images as "assets/x.svg").
  const resolveBase = (html: string, opts?: MarkdownOptions): string => {
    if (!opts?.imgBase && !opts?.linkBase) return html;
    const abs = (v: string, base?: string) => {
      if (!base || /^(https?:|mailto:|\/|#)/.test(v)) return v;
      return base.replace(/\/?$/, "/") + v.replace(/^\.\//, "");
    };
    let out = html.replace(/(src|href)="([^"]+)"/g, (_m, a, v) =>
      `${a}="${abs(v, a === "src" ? opts?.imgBase : opts?.linkBase || opts?.imgBase)}"`);
    out = out.replace(/srcset="([^"]+)"/g, (_m, v) =>
      `srcset="${v.split(",").map((part: string) => {
        const [u, ...rest] = part.trim().split(/\s+/);
        return [abs(u, opts?.imgBase), ...rest].join(" ");
      }).join(", ")}"`);
    return out;
  };
  // 3) Protect tags from markdown transforms; markdown rules run on text only.
  const tags: string[] = [];
  const protectedSrc = clean.replace(/<[^>]*>/g, (tag) => {
    tags.push(tag);
    return `\u0002${tags.length - 1}\u0002`;
  });
  const restore = (t: string) =>
    t.replace(/\u0002(\d+)\u0002/g, (_m, i) => tags[Number(i)]);

  const lines = protectedSrc.split("\n");
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    // Pure HTML line (e.g. a <picture> block): emit untouched, no <p> wrapper.
    if (/^(\u0002\d+\u0002\s*)+$/.test(line.trim())) {
      out.push(restore(line.trim()));
      i++;
      continue;
    }
    const h = line.match(/^(#{1,3})\s+(.*)$/);
    if (h) { out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`); i++; continue; }
    if (/^&gt;\s?/.test(line)) {
      const q: string[] = [];
      while (i < lines.length && /^&gt;\s?/.test(lines[i])) { q.push(inline(lines[i].replace(/^&gt;\s?/, ""))); i++; }
      out.push(`<blockquote>${q.join("<br>")}</blockquote>`);
      continue;
    }
    if (/^-\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^-\s+/.test(lines[i])) { items.push(`<li>${inline(lines[i].replace(/^-\s+/, ""))}</li>`); i++; }
      out.push(`<ul>${items.join("")}</ul>`);
      continue;
    }
    const p: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,3})\s+/.test(lines[i]) && !/^&gt;\s?/.test(lines[i]) && !/^-\s+/.test(lines[i]) && !/^(\u0002\d+\u0002\s*)+$/.test(lines[i].trim())) {
      p.push(inline(lines[i])); i++;
    }
    if (p.length) out.push(`<p>${p.join("<br>")}</p>`);
  }
  return resolveBase(restore(out.join("\n")), opts);
}
