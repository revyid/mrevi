-- ============================================================
-- SUPABASE FULL RESET - Jalankan SEMUA ini di SQL Editor
-- Ini akan replace semua policy dan fix infinite recursion
-- ============================================================

-- STEP 1: Matikan RLS dulu supaya bisa bersih-bersih
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- STEP 2: Drop SEMUA policy yang ada
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON profiles';
  END LOOP;
END $$;

-- STEP 3: Drop trigger dan function lama
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_profiles_updated_at ON profiles;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_updated_at();

-- STEP 4: Drop table lama
DROP TABLE IF EXISTS profiles;

-- STEP 5: Buat table baru
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT DEFAULT '',
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 6: Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- STEP 7: Buat policy BARU yang TIDAK recursive
-- Policy: user bisa baca profil sendiri
CREATE POLICY "p_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: user bisa update profil sendiri
CREATE POLICY "p_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy: user bisa insert profil sendiri (untuk trigger)
CREATE POLICY "p_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy: admin bisa baca semua (cek dari JWT, bukan dari table)
CREATE POLICY "p_admin_select" ON profiles
  FOR SELECT USING (
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
  );

-- Policy: admin bisa update semua
CREATE POLICY "p_admin_update" ON profiles
  FOR UPDATE USING (
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
  );

-- Policy: admin bisa delete
CREATE POLICY "p_admin_delete" ON profiles
  FOR DELETE USING (
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
  );

-- STEP 8: Trigger function - insert profile saat user register
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, avatar_url)
  VALUES (
    NEW.id,
    coalesce(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''),
    'user',
    coalesce(NEW.raw_user_meta_data ->> 'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- STEP 9: Trigger - auto update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- STEP 10: Insert profile untuk user yang sudah ada tapi belum punya profile
INSERT INTO profiles (id, full_name, role, avatar_url)
SELECT
  id,
  coalesce(raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'name', ''),
  'user',
  coalesce(raw_user_meta_data ->> 'avatar_url', '')
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SELESAI! Sekarang set admin:
-- Ganti 'email-kamu@domain.com' dengan email kamu
-- ============================================================
-- UPDATE auth.users SET app_metadata = app_metadata || '{"role":"admin"}'::jsonb
-- WHERE email = 'email-kamu@domain.com';

-- Cek hasil
SELECT p.*, u.email FROM profiles p
JOIN auth.users u ON p.id = u.id;
