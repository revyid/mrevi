import Database from 'bun:sqlite';

const db = new Database('C:/Users/revy/.local/share/mimocode/mimocode.db');

// Search for user text content with more specific keywords
console.log("=== USER TEXT CONTENT WITH SPECIFIC KEYWORDS ===");

// Search for specific rule/decision patterns in user messages
const searchTerms = [
  'jangan', 'selalu', 'harus', 'ga boleh', 'gaboleh', 'gak boleh',
  'klo', 'kalo', 'kalau', 'kayak', 'kaya', 'ga usah', 'gak usah',
  'susah', 'njir', 'bug', 'error', 'fix', 'perbaiki'
];

for (const term of searchTerms) {
  const rows = db.query(
    `SELECT p.session_id, substr(json_extract(p.data, '$.text'), 1, 400) as text_preview
     FROM part p
     JOIN message m ON p.message_id = m.id
     WHERE json_extract(m.data, '$.role') = 'user'
     AND json_extract(p.data, '$.type') = 'text'
     AND json_extract(p.data, '$.text') LIKE '%${term}%'
     AND p.session_id IN ('ses_065f84987ffeNsKTHnDqGGPQIv', 'ses_06cbd0635ffeczvHVWd3s4BwD8', 'ses_08758c4c8ffej5Gey1CCt0Qfgf')
     LIMIT 5`
  ).all();
  if (rows.length > 0) {
    console.log(`\n--- Term: "${term}" (${rows.length} results) ---`);
    rows.forEach(r => {
      console.log(`  Session: ${r.session_id}`);
      console.log(`  Text: ${r.text_preview}`);
      console.log('');
    });
  }
}

// Get unique project sessions
console.log("\n=== PROJECT SESSIONS ===");
const projectSessions = db.query(
  `SELECT DISTINCT session_id FROM part 
   WHERE session_id IN ('ses_065f84987ffeNsKTHnDqGGPQIv', 'ses_06cbd0635ffeczvHVWd3s4BwD8', 'ses_08758c4c8ffej5Gey1CCt0Qfgf')`
).all();
console.log(projectSessions.map(s => s.session_id).join(', '));
