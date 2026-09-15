-- ============================================================
-- CUSTOM AUTH DATABASE SCHEMA
-- Jalankan di Supabase Dashboard > SQL Editor
-- ============================================================

-- Drop tables lama jika ada
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================
-- 1. TABEL USERS
-- ============================================================
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT DEFAULT '',
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar_url TEXT DEFAULT '',
  provider TEXT DEFAULT 'credentials' CHECK (provider IN ('credentials', 'google', 'github')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk email lookup cepat
CREATE INDEX idx_users_email ON users(email);

-- ============================================================
-- 2. TABEL SESSIONS
-- ============================================================
CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk token lookup
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);

-- ============================================================
-- 3. AUTO CLEANUP expired sessions (optional)
-- ============================================================
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 4. TRIGGER: Auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ============================================================
-- 5. DISABLE RLS (karena pakai service_role_key di backend)
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations via service_role
CREATE POLICY "Allow all for service_role" ON users
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all for service_role" ON sessions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 6. INSERT admin pertama (ganti email & password hash)
-- ============================================================
-- Password: admin123 (hash bcrypt)
-- INSERT INTO users (name, email, password_hash, role)
-- VALUES ('Admin', 'admin@email.com', '$2a$10$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 'admin');
