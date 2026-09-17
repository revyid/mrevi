-- ============================================================
-- 005 — Realtime sessions hardening
-- Jalankan di Supabase SQL Editor.
--
-- ID: Menutup policy SELECT terbuka untuk anon pada tabel sessions.
-- Sebelumnya (database/realtime-sessions.sql) policy "anon_read_sessions"
-- memakai USING (true), sehingga SIAPA PUN dengan anon key bisa membaca
-- seluruh isi tabel sessions (token, user_id, ip, user-agent).
--
-- EN: Replaces the open anon SELECT policy on the sessions table with an
-- authenticated-only policy. Previously (database/realtime-sessions.sql)
-- the "anon_read_sessions" policy used USING (true), so ANYONE holding the
-- public anon key could read every row of the sessions table (tokens,
-- user ids, IPs, user agents).
--
-- TRADEOFF / KONDISI:
-- - Realtime auto-logout (SSO) tetap berjalan selama klien subscribe
--   memakai sesi yang sudah login (authenticated), bukan anon.
-- - Jika ada klien realtime yang masih subscribe secara anonim, stream-nya
--   akan berhenti menerima event — itu memang tujuan hardening ini.
-- - Service role tetap punya akses penuh (policy "allow_all_service_role"
--   di unified-schema.sql), jadi server-side tidak terpengaruh.
--
-- Aman di-re-run (idempotent).
-- ============================================================

-- Hapus policy anon yang terbuka / Drop the open anon policy
DROP POLICY IF EXISTS "anon_read_sessions" ON public.sessions;

-- Policy baru: hanya authenticated yang boleh SELECT / New policy:
-- only authenticated users may SELECT (needed for realtime SSO logout).
DROP POLICY IF EXISTS "authenticated_read_sessions" ON public.sessions;
CREATE POLICY "authenticated_read_sessions"
  ON public.sessions
  FOR SELECT
  TO authenticated
  USING (true);

-- (Opsional) Verifikasi / (Optional) Verify
-- SELECT policyname, roles, cmd FROM pg_policies WHERE tablename = 'sessions';
