-- ============================================================
-- Realtime auto-logout (SSO)
-- Jalankan di Supabase SQL Editor.
--
-- Kalau muncul error "already a member of publication":
--   itu artinya sudah aktif, tidak masalah, lanjut.
-- Kalau error "relation ... does not exist":
--   kamu buka project Supabase yang salah (tabel sessions
--   tidak ada di sana).
-- ============================================================

-- 1. Aktifkan Realtime untuk tabel sessions
ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;

-- 2. Policy anon SELECT (client realtime butuh baca)
DROP POLICY IF EXISTS "anon_read_sessions" ON public.sessions;
CREATE POLICY "anon_read_sessions"
  ON public.sessions
  FOR SELECT
  TO anon
  USING (true);

-- 3. Verifikasi
SELECT schemaname, tablename, pubname
FROM pg_publication_tables
WHERE tablename = 'sessions';
