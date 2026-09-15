import Database from 'bun:sqlite';

const db = new Database('C:/Users/revy/.local/share/mimocode/mimocode.db');

// Search user messages for rule/decision keywords
const keywords = ['always', 'never', 'remember', 'rule', 'decision', 'decided', 'tradeoff', 'reason', 'repeat', 'again', 'every time', 'workflow'];

console.log("=== USER MESSAGES WITH RULE/DECISION KEYWORDS ===");
for (const kw of keywords) {
  const rows = db.query(
    `SELECT m.id, m.session_id, substr(json_extract(m.data, '$.content'), 1, 300) as content_preview 
     FROM message m 
     WHERE json_extract(m.data, '$.role') = 'user' 
     AND json_extract(m.data, '$.content') LIKE '%${kw}%'`
  ).all();
  if (rows.length > 0) {
    console.log(`\n--- Keyword: "${kw}" (${rows.length} results) ---`);
    rows.forEach(r => {
      console.log(`  Session: ${r.session_id}`);
      console.log(`  Content: ${r.content_preview}`);
      console.log('');
    });
  }
}

// Search for error patterns
console.log("\n=== ERROR PATTERNS IN TRAJECTORY ===");
const errorRows = db.query(
  `SELECT m.id, m.session_id, substr(json_extract(m.data, '$.content'), 1, 300) as content_preview 
   FROM message m 
   WHERE json_extract(m.data, '$.role') = 'assistant' 
   AND (json_extract(m.data, '$.content') LIKE '%error%' OR json_extract(m.data, '$.content') LIKE '%Error%' OR json_extract(m.data, '$.content') LIKE '%failed%')`
).all();
console.log(`Found ${errorRows.length} assistant messages with error patterns`);
errorRows.slice(0, 5).forEach(r => {
  console.log(`  Session: ${r.session_id}`);
  console.log(`  Content: ${r.content_preview.substring(0, 150)}`);
  console.log('');
});

// Get all non-checkpoint-writer sessions for this project
console.log("\n=== ALL PROJECT SESSIONS (excluding checkpoint-writers) ===");
const projectSessions = db.query(
  `SELECT id, title, time_created, directory FROM session 
   WHERE (directory LIKE '%mrevi%' OR directory LIKE '%revy%') 
   AND title NOT LIKE '%checkpoint-writer%' 
   ORDER BY time_created DESC`
).all();
projectSessions.forEach(s => {
  console.log(`${s.id} | ${s.title} | ${new Date(s.time_created).toISOString().slice(0,19)} | ${s.directory}`);
});
