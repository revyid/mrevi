-- ============================================================
-- MIGRATION: Add user profile fields, session tracking, passkeys
-- Jalankan di Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Tambah kolom di tabel users
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS website TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS dob DATE DEFAULT NULL;

-- 2. Tambah kolom device tracking di tabel sessions
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS user_agent TEXT DEFAULT '';
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS ip_address TEXT DEFAULT '';

-- 3. Buat tabel passkeys (WebAuthn)
CREATE TABLE IF NOT EXISTS passkeys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  credential_id TEXT UNIQUE NOT NULL,
  public_key TEXT NOT NULL,
  counter INTEGER DEFAULT 0,
  device_type TEXT,
  name TEXT DEFAULT 'Passkey',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_passkeys_user_id ON passkeys(user_id);
CREATE INDEX IF NOT EXISTS idx_passkeys_credential_id ON passkeys(credential_id);

-- RLS for passkeys
ALTER TABLE passkeys ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations via service_role
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Allow all for service_role' AND tablename = 'passkeys'
  ) THEN
    CREATE POLICY "Allow all for service_role" ON passkeys
      FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;
