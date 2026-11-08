-- 007_translations.sql
-- Run in the Supabase SQL Editor BEFORE running scripts/seed-translations.mjs.
-- DB-driven UI translations (seeded from messages/en.json + messages/id.json).
-- Access is via lib/db.ts (service_role, bypasses RLS) only — no policies,
-- matching the other content tables (see 006_rls_hardening.sql).

CREATE TABLE IF NOT EXISTS translations (
  key          TEXT NOT NULL,
  locale       TEXT NOT NULL,
  text         TEXT NOT NULL,
  source_hash  TEXT,
  source_locale TEXT NOT NULL DEFAULT 'en',
  is_machine   BOOLEAN NOT NULL DEFAULT false,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (key, locale)
);

CREATE INDEX IF NOT EXISTS translations_locale_idx ON translations (locale);

ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations FORCE ROW LEVEL SECURITY;
-- No policies: service_role bypasses RLS; anon/authenticated get nothing.

DROP TRIGGER IF EXISTS on_translations_updated_at ON translations;
CREATE TRIGGER on_translations_updated_at
  BEFORE UPDATE ON translations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
