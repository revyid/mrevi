-- 006_rls_hardening.sql
-- Run in the Supabase SQL Editor. It removes legacy anon-writable policies and enables RLS on every public table.
BEGIN;

DROP POLICY IF EXISTS "allow_all_service_role" ON public.api_keys;
DROP POLICY IF EXISTS "allow_all_service_role" ON public.api_key_usage;
DROP POLICY IF EXISTS "allow_all_service_role" ON public.users;
DROP POLICY IF EXISTS "allow_all_service_role" ON public.sessions;
DROP POLICY IF EXISTS "allow_all_service_role" ON public.passkeys;
DROP POLICY IF EXISTS "Allow all for service_role" ON public.users;
DROP POLICY IF EXISTS "Allow all for service_role" ON public.sessions;
DROP POLICY IF EXISTS "allow_all_service_role" ON public.api_key_usage;

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT schemaname, tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', r.schemaname, r.tablename);
    EXECUTE format('ALTER TABLE %I.%I FORCE ROW LEVEL SECURITY', r.schemaname, r.tablename);
  END LOOP;
END $$;

COMMIT;
