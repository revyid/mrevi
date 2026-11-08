#!/usr/bin/env node
// Seed the translations table from messages/en.json + messages/id.json.
// Run AFTER database/migrations/007_translations.sql:
//   node scripts/seed-translations.mjs
// Uses NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (from env or .env.local).
import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// Minimal .env.local loader so `node scripts/...` works without extra tooling.
for (const file of [".env.local", ".env"]) {
  const p = join(root, file);
  if (!existsSync(p)) continue;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (!m || line.trimStart().startsWith("#")) continue;
    const val = (m[2] ?? "").replace(/^(['"])(.*)\1$/, "$2");
    if (!(m[1] in process.env)) process.env[m[1]] = val;
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const hashText = (s) => createHash("sha256").update(s).digest("hex");

function flatten(obj, prefix = "", out = {}) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object") flatten(v, key, out);
    else out[key] = String(v);
  }
  return out;
}

const en = flatten(JSON.parse(readFileSync(join(root, "messages/en.json"), "utf8")));
const id = flatten(JSON.parse(readFileSync(join(root, "messages/id.json"), "utf8")));

const db = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const rows = [];
for (const [key, text] of Object.entries(en)) {
  rows.push({
    key, locale: "en", text,
    source_hash: hashText(text), source_locale: "en", is_machine: false,
  });
}
for (const [key, text] of Object.entries(id)) {
  const enText = en[key];
  rows.push({
    key, locale: "id", text,
    source_hash: enText ? hashText(enText) : null,
    source_locale: "en", is_machine: false,
  });
}

const { error } = await db
  .from("translations")
  .upsert(rows, { onConflict: "key,locale" });

if (error) {
  console.error("Seed failed:", error.message);
  process.exit(1);
}
console.log(`Seeded ${rows.length} rows (${Object.keys(en).length} en keys).`);
