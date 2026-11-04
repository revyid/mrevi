-- 006_rls_hardening.sql
-- Run in the Supabase SQL Editor.
-- Removes every public-schema policy except the intentional authenticated_read_sessions
-- and enables RLS/FORCE RLS on every public table.
BEGIN;

DO $$
DECLARE p RECORD;
BEGIN
  FOR p IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND policyname <> 'authenticated_read_sessions'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', p.policyname, p.schemaname, p.tablename);
  END LOOP;
END $$;

DO $$
DECLARE t RECORD;
BEGIN
  FOR t IN
    SELECT schemaname, tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', t.schemaname, t.tablename);
    EXECUTE format('ALTER TABLE %I.%I FORCE ROW LEVEL SECURITY', t.schemaname, t.tablename);
  END LOOP;
END $$;

-- Fail closed if any non-intentional public policy remains.
DO $$
DECLARE remaining integer;
BEGIN
  SELECT count(*) INTO remaining
  FROM pg_policies
  WHERE schemaname = 'public'
    AND policyname <> 'authenticated_read_sessions';

  IF remaining <> 0 THEN
    RAISE EXCEPTION 'RLS hardening incomplete: % unexpected public policies remain', remaining;
  END IF;
END $$;

COMMIT;
