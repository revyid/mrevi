import Database from 'bun:sqlite';

const db = new Database('C:/Users/revy/.local/share/mimocode/mimocode.db');

// Check the actual structure of message data
console.log("=== SAMPLE USER MESSAGES ===");
const sampleMessages = db.query(
  `SELECT id, session_id, data FROM message 
   WHERE json_extract(data, '$.role') = 'user' 
   LIMIT 5`
).all();
sampleMessages.forEach(m => {
  console.log(`Session: ${m.session_id}`);
  console.log(`Data: ${m.data.substring(0, 500)}`);
  console.log('');
});

// Check all messages for the main project sessions
const projectSessionIds = [
  'ses_063f6b214ffenarHhXjoO6pyw1',
  'ses_065f84987ffeNsKTHnDqGGPQIv',
  'ses_06cbd0635ffeczvHVWd3s4BwD8',
  'ses_08758c4c8ffej5Gey1CCt0Qfgf'
];

console.log("\n=== MESSAGES FOR PROJECT SESSIONS ===");
for (const sid of projectSessionIds) {
  const msgs = db.query(
    `SELECT id, agent_id, json_extract(data, '$.role') as role, substr(data, 1, 400) as data_preview 
     FROM message 
     WHERE session_id = ? 
     ORDER BY time_created`
  ).all(sid);
  console.log(`\nSession ${sid}: ${msgs.length} messages`);
  msgs.forEach(m => {
    console.log(`  ${m.role} | agent: ${m.agent_id || 'main'} | ${m.data_preview.substring(0, 150)}`);
  });
}
