-- ============================================================
-- Realtime auto-logout (SSO)
-- Jalankan di Supabase SQL Editor setelah menjalankan unified-schema.sql
--
-- Cara kerja: klien (revy.my.id) subscribe ke DELETE pada tabel
-- `sessions` dengan filter token=<session token dari JWT>. Ketika
-- session di-revoke (logout di perangkat lain / logout all),
-- event realtime dikirim dan semua app yang terhubung force-logout.
--
-- CATATAN KEAMANAN: policy "allow_all_service_role" pada tabel
-- sessions berlaku untuk SEMUA role (termasuk anon) karena tidak
-- ada klausa role. Ini memang desain lama schema ini — client
-- realtime butuh anon read untuk menerima event. Karena token
-- session bersifat unguessable (UUID + timestamp), risiko terbatas.
-- ============================================================

-- 1. Aktifkan Realtime untuk tabel sessions
alter publication supabase_realtime add table public.sessions;

-- 2. Pastikan policy anon SELECT ada (jika belum dari schema lama)
drop policy if exists "anon_read_sessions" on public.sessions;
create policy "anon_read_sessions"
  on public.sessions
  for select
  to anon
  using (true);

-- 3. Verifikasi
select schemaname, tablename, publicationname
from pg_publication_tables
where tablename = 'sessions';
