// Minimal GitHub-style markdown -> sanitized HTML (no dependencies).
// ALL HTML is escaped first, so the only tags in the output are the ones
// generated below. Links are restricted to http/https.

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

export function renderMarkdown(src: string): string {
  const lines = escapeHtml(src ?? "").split("\n");
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
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
    while (i < lines.length && lines[i].trim() && !/^(#{1,3})\s+/.test(lines[i]) && !/^&gt;\s?/.test(lines[i]) && !/^-\s+/.test(lines[i])) {
      p.push(inline(lines[i])); i++;
    }
    out.push(`<p>${p.join("<br>")}</p>`);
  }
  return out.join("\n");
}
