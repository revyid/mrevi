import Database from 'bun:sqlite';

const db = new Database('C:/Users/revy/.local/share/mimocode/mimocode.db');

// Check how user content is stored - look at part table for user messages
console.log("=== SAMPLE PARTS FOR USER MESSAGES ===");
const sampleParts = db.query(
  `SELECT p.id, p.session_id, p.message_id, json_extract(p.data, '$.type') as type, substr(json_extract(p.data, '$.text'), 1, 300) as text_preview
   FROM part p
   WHERE p.message_id IN (
     SELECT id FROM message 
     WHERE json_extract(data, '$.role') = 'user'
     AND session_id IN ('ses_065f84987ffeNsKTHnDqGGPQIv', 'ses_06cbd0635ffeczvHVWd3s4BwD8')
   )
   LIMIT 20`
).all();
sampleParts.forEach(p => {
  console.log(`Session: ${p.session_id} | Type: ${p.type} | Text: ${p.text_preview}`);
  console.log('');
});

// Search for user text content with keywords
console.log("\n=== USER TEXT CONTENT WITH KEYWORDS ===");
const keywords = ['always', 'never', 'remember', 'rule', 'jangan', 'selalu', 'harus'];
for (const kw of keywords) {
  const rows = db.query(
    `SELECT p.session_id, substr(json_extract(p.data, '$.text'), 1, 300) as text_preview
     FROM part p
     JOIN message m ON p.message_id = m.id
     WHERE json_extract(m.data, '$.role') = 'user'
     AND json_extract(p.data, '$.type') = 'text'
     AND json_extract(p.data, '$.text') LIKE '%${kw}%'`
  ).all();
  if (rows.length > 0) {
    console.log(`\n--- Keyword: "${kw}" (${rows.length} results) ---`);
    rows.slice(0, 3).forEach(r => {
      console.log(`  Session: ${r.session_id}`);
      console.log(`  Text: ${r.text_preview}`);
      console.log('');
    });
  }
}
