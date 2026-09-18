-- ============================================================
-- UNIFIED DATABASE SCHEMA
-- mrevi portfolio + CMS + auth
-- Run this in Supabase Dashboard > SQL Editor
-- Safe to re-run: all DROP IF EXISTS included
-- ============================================================

-- ============================================================
-- SECTION 0: CLEANUP (drop everything safely in correct order)
-- ============================================================
-- Note: DROP TABLE ... CASCADE automatically drops associated
-- triggers and indexes, so we drop tables first, then functions.
-- We never DROP TRIGGER directly — it fails if the table doesn't
-- exist yet, even with IF EXISTS.
-- ============================================================

-- Tables (reverse dependency order — CASCADE handles triggers/indexes)
DROP TABLE IF EXISTS contacts         CASCADE;
DROP TABLE IF EXISTS api_key_usage    CASCADE;
DROP TABLE IF EXISTS api_keys         CASCADE;
DROP TABLE IF EXISTS passkeys         CASCADE;
DROP TABLE IF EXISTS sessions         CASCADE;
DROP TABLE IF EXISTS navigation_links CASCADE;
DROP TABLE IF EXISTS site_settings    CASCADE;
DROP TABLE IF EXISTS blog_posts       CASCADE;
DROP TABLE IF EXISTS tools            CASCADE;
DROP TABLE IF EXISTS journey      CASCADE;
DROP TABLE IF EXISTS projects         CASCADE;
DROP TABLE IF EXISTS users            CASCADE;

-- Functions (safe to drop after tables are gone)
DROP FUNCTION IF EXISTS public.handle_updated_at();
DROP FUNCTION IF EXISTS public.cleanup_expired_sessions();

-- ============================================================
-- SECTION 1: SUPABASE AUTH PROFILES (OPTIONAL)
-- ============================================================
-- This section is commented out by default because this project
-- uses a CUSTOM auth system (the `users` table below) and does
-- NOT rely on Supabase's built-in auth.users table.
--
-- Uncomment ONLY if you decide to switch to Supabase Auth.
-- Run it in Supabase Dashboard > SQL Editor — it will NOT work
-- through the JS client or a plain Postgres connection.
-- ============================================================

-- DROP TRIGGER IF EXISTS on_auth_user_created  ON auth.users;
-- DROP TRIGGER IF EXISTS on_profiles_updated_at ON profiles;
-- DROP FUNCTION IF EXISTS public.handle_new_user();
-- DROP TABLE IF EXISTS profiles CASCADE;
--
-- CREATE TABLE profiles (
--   id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
--   full_name   TEXT    DEFAULT '',
--   role        TEXT    DEFAULT 'user' CHECK (role IN ('user', 'admin')),
--   avatar_url  TEXT    DEFAULT '',
--   created_at  TIMESTAMPTZ DEFAULT NOW(),
--   updated_at  TIMESTAMPTZ DEFAULT NOW()
-- );
-- CREATE INDEX idx_profiles_role       ON profiles(role);
-- CREATE INDEX idx_profiles_created_at ON profiles(created_at DESC);
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "p_select_own"   ON profiles FOR SELECT USING (auth.uid() = id);
-- CREATE POLICY "p_update_own"   ON profiles FOR UPDATE USING (auth.uid() = id);
-- CREATE POLICY "p_insert_own"   ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
-- CREATE POLICY "p_admin_select" ON profiles FOR SELECT USING (coalesce(auth.jwt()->'app_metadata'->>'role','') = 'admin');
-- CREATE POLICY "p_admin_update" ON profiles FOR UPDATE USING (coalesce(auth.jwt()->'app_metadata'->>'role','') = 'admin');
-- CREATE POLICY "p_admin_delete" ON profiles FOR DELETE USING (coalesce(auth.jwt()->'app_metadata'->>'role','') = 'admin');
-- CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$
-- BEGIN
--   INSERT INTO public.profiles (id, full_name, role, avatar_url)
--   VALUES (NEW.id,
--     coalesce(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
--     'user', coalesce(NEW.raw_user_meta_data->>'avatar_url', ''));
--   RETURN NEW;
-- END; $$ LANGUAGE plpgsql SECURITY DEFINER;
-- CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- SECTION 2: CUSTOM AUTH USERS
-- Standalone user table (not dependent on Supabase Auth).
-- Used by the custom credentials / OAuth / passkey login flow.
-- ============================================================

CREATE TABLE users (
  id            UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  name          TEXT    DEFAULT '',
  email         TEXT    UNIQUE NOT NULL,
  password_hash TEXT,
  role          TEXT    DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar_url    TEXT    DEFAULT '',
  provider      TEXT    DEFAULT 'credentials' CHECK (provider IN ('credentials', 'google', 'github')),
  bio           TEXT    DEFAULT '',
  website       TEXT    DEFAULT '',
  dob           DATE    DEFAULT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 5e. API Keys
CREATE TABLE api_keys (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name         TEXT        NOT NULL,
  key_hash     TEXT        UNIQUE NOT NULL,
  key_prefix   TEXT        NOT NULL,
  rate_limit   INTEGER     DEFAULT 100,
  is_active    BOOLEAN     DEFAULT true,
  expires_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_service_role" ON api_keys FOR ALL USING (true) WITH CHECK (true);

-- 5f. API Key Usage
CREATE TABLE api_key_usage (
  id      UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  used_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_key_usage_user_time ON api_key_usage(user_id, used_at DESC);

ALTER TABLE api_key_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_service_role" ON api_key_usage FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX idx_users_email ON users(email);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_service_role" ON users FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- SECTION 3: SESSIONS
-- ============================================================

CREATE TABLE sessions (
  id           UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token        TEXT    UNIQUE NOT NULL,
  expires_at   TIMESTAMPTZ NOT NULL,
  user_agent   TEXT    DEFAULT '',
  ip_address   TEXT    DEFAULT '',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_token   ON sessions(token);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_service_role" ON sessions FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- SECTION 4: PASSKEYS (WebAuthn)
-- ============================================================

CREATE TABLE passkeys (
  id            UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  credential_id TEXT    UNIQUE NOT NULL,
  public_key    TEXT    NOT NULL,
  counter       INTEGER DEFAULT 0,
  device_type   TEXT,
  name          TEXT    DEFAULT 'Passkey',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  last_used_at  TIMESTAMPTZ
);

CREATE INDEX idx_passkeys_user_id       ON passkeys(user_id);
CREATE INDEX idx_passkeys_credential_id ON passkeys(credential_id);

ALTER TABLE passkeys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_service_role" ON passkeys FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- SECTION 5: CONTENT TABLES
-- ============================================================

-- 5a. Projects
CREATE TABLE projects (
  id          UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT    NOT NULL,
  subtitle    TEXT    DEFAULT '',
  href        TEXT    DEFAULT '',
  image       TEXT    DEFAULT '',
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 5b. Experiences
CREATE TABLE journey (
  id          UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  company     TEXT    NOT NULL,
  description TEXT    DEFAULT '',
  period      TEXT    DEFAULT '',
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 5c. Tools
CREATE TABLE tools (
  id          UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT    NOT NULL,
  category    TEXT    DEFAULT '',
  href        TEXT    DEFAULT '',
  icon        TEXT    DEFAULT '',
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 5d. Blog Posts
CREATE TABLE blog_posts (
  id          UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT    NOT NULL,
  excerpt     TEXT    DEFAULT '',
  content     TEXT    DEFAULT '',
  slug        TEXT    UNIQUE NOT NULL,
  date        TEXT    DEFAULT '',
  read_time   TEXT    DEFAULT '5min read',
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 6: SITE SETTINGS
-- Key-value store for all configurable site content.
-- ============================================================

CREATE TABLE site_settings (
  id         UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  key        TEXT    UNIQUE NOT NULL,
  value      TEXT    DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 7: NAVIGATION LINKS
-- Admin-editable nav link display labels (hrefs stay fixed).
-- ============================================================

CREATE TABLE navigation_links (
  id          UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  href        TEXT    UNIQUE NOT NULL,
  label       TEXT    NOT NULL,
  icon        TEXT    DEFAULT '',
  sort_order  INTEGER DEFAULT 0,
  is_visible  BOOLEAN DEFAULT true,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE contacts (
  id         UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT    NOT NULL,
  email      TEXT    NOT NULL,
  budget     TEXT    DEFAULT '',
  message    TEXT    NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 8: SHARED TRIGGER FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Utility: cleanup expired sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Attach triggers
CREATE TRIGGER on_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_journey_updated_at
  BEFORE UPDATE ON journey
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_tools_updated_at
  BEFORE UPDATE ON tools
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_navigation_links_updated_at
  BEFORE UPDATE ON navigation_links
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- SECTION 9: DEFAULT DATA
-- ============================================================

-- 9a. Site Settings defaults
-- NOTE: content keys default to empty strings on purpose — the site renders
-- honest fallbacks (or hides the block) instead of fictional template data.
-- Fill real values in via the admin CMS (SettingsTab).
INSERT INTO site_settings (key, value) VALUES

  -- Profile / Sidebar Card
  ('profile_name',   'M. Revi Ramadhan'),
  ('profile_title',  'Software Engineer'),
  ('profile_bio',    ''),
  ('profile_avatar', 'https://res.cloudinary.com/dr95izqlg/image/upload/v1777198819/i85y5yann4nxdy38vpge.jpg'),

  -- Rotating role pills inside the profile card
  ('profile_roles',  'Developer'),

  -- Social links (empty = icon hidden, never fake links)
  ('social_facebook',  ''),
  ('social_twitter',   ''),
  ('social_instagram', ''),
  ('social_email',     ''),
  ('social_github',    ''),
  ('social_linkedin',  ''),

  -- Hero Section (empty lines fall back to a single "DEVELOPER" heading)
  ('hero_title_1',     ''),
  ('hero_title_2',     ''),
  ('hero_description', 'Passionate about creating intuitive and engaging user experiences. Specialize in transforming ideas into beautifully crafted products.'),

  -- Stats (empty = block hidden; fill with real numbers via the CMS)
  ('stat_1_num',   ''),
  ('stat_1_label', ''),
  ('stat_2_num',   ''),
  ('stat_2_label', ''),
  ('stat_3_num',   ''),
  ('stat_3_label', ''),

  -- Skill Cards (the two cards below hero; empty text = card hidden)
  ('skill_card_1_text', ''),
  ('skill_card_1_href', '/journey'),
  ('skill_card_1_type', 'accent'),    -- bg-accent (dark/orange card)

  ('skill_card_2_text', ''),
  ('skill_card_2_href', '/projects'),
  ('skill_card_2_type', 'primary'),   -- bg-primary card

  -- Section titles (the two-line headings)
  ('section_projects_line1',    'RECENT'),
  ('section_projects_line2',    'PROJECTS'),
  ('section_experience_line1',  'EXPERIENCE'),
  ('section_experience_line2',  'HISTORY'),
  ('section_tools_line1',       'PREMIUM'),
  ('section_tools_line2',       'TOOLS'),
  ('section_blog_line1',        'DESIGN'),
  ('section_blog_line2',        'THOUGHTS'),
  ('section_contact_line1',     'LET''S WORK'),
  ('section_contact_line2',     'TOGETHER'),

  -- Footer (empty = falls back to "© <year> revy.my.id")
  ('footer_text',      ''),
  ('footer_credit_1_label', ''),
  ('footer_credit_1_href',  ''),
  ('footer_credit_2_label', ''),
  ('footer_credit_2_href',  ''),

  -- Contact / Email
  ('contact_email', '')

ON CONFLICT (key) DO NOTHING;

-- 9b. Navigation Links defaults
INSERT INTO navigation_links (href, label, icon, sort_order) VALUES
  ('/',        'Home',     'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10', 1),
  ('/projects','Projects', 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z', 2),
  ('/journey', 'Journey',  'M2 7h20v14H2z M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16', 3),
  ('/tools',   'Tools',    'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z', 4),
  ('/blog',    'Thoughts', 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z', 5)
ON CONFLICT (href) DO NOTHING;

-- 9c. Projects
-- No seed rows: projects are real work and must be added via the admin CMS
-- (ProjectsTab). The Framer template demo projects (NajmAI, Damas, Majd)
-- were removed — they were not real projects.

-- 9d. Experiences
-- No seed rows: the fictional companies (PixelForge Studios, BlueWave
-- Innovators, TrendCraft Solutions) were template placeholder data and
-- have been removed. Add real entries via the admin CMS (ExperiencesTab).

-- 9e. Tools
-- Real tools only (no affiliate links). Icons: devicon CDN / official sites.
INSERT INTO tools (name, category, href, icon, sort_order) VALUES
  ('Figma',         'Design Tool',       'https://www.figma.com/',           'https://framerusercontent.com/images/SvTAZZonMqViqF7fP6GK7CWmL84.png', 2),
  ('Lemon Squeezy', 'Payments Provider', 'https://www.lemonsqueezy.com/',    'https://framerusercontent.com/images/U1s9zT0tOtXbjdWvMrIgPFH0TyM.png', 3),
  ('ChatGPT',       'AI Assistant',      'https://chat.openai.com/',         'https://framerusercontent.com/images/MViiiLyIvL8tvy7d1XtOsM32o.png',  4),
  ('Notion',        'Productivity Tool', 'https://www.notion.so/',           'https://framerusercontent.com/images/iP5FTKjb84EsPLiEwbrAY7NEy44.png', 5),
  ('Nextjs',        'React framework',   'https://nextjs.org/',              'https://framerusercontent.com/images/MnQFYNLxlgT4EvY2ctcJfHAXZA.png',  6)
ON CONFLICT DO NOTHING;

-- 9f. Blog Posts
-- Only the real API-documentation post is seeded. The three stock 2022
-- design articles were template placeholder content and have been removed.
INSERT INTO blog_posts (title, excerpt, content, slug, date, read_time, sort_order) VALUES
  ('API Documentation', 'Learn how to use the M. Revi Ramadhan Developer API to retrieve portfolio data programmatically.', '<h2>Developer API Documentation</h2><p>Welcome to the developer API for M. Revi Ramadhan''s portfolio. You can retrieve real-time data about projects, experiences, tools, blog posts, and site settings using your API key.</p><h3>Authentication</h3><p>All requests must include your API key in the <code>x-api-key</code> HTTP header.</p><pre><code>x-api-key: mr_your_api_key_here</code></pre><h3>Endpoints</h3><p>The base URL for the API is <code>http://localhost:3001</code> (in development) or the production API URL.</p><h4>1. Get Full Portfolio Data</h4><pre><code>GET /api/portfolio</code></pre><p>Returns all projects, experiences, tools, blog posts, and site settings.</p><h4>2. Get Projects</h4><pre><code>GET /api/projects</code></pre><h4>3. Get Journey / Experiences</h4><pre><code>GET /api/experiences</code></pre><h4>4. Get Tools</h4><pre><code>GET /api/tools</code></pre><h4>5. Get Blog Posts</h4><pre><code>GET /api/blog</code></pre><h3>Playground (Code Execution)</h3><p>You can also use the <code>/api/playground</code> endpoint (POST) to run sandboxed code in Go, Rust, or PHP. Note that these containers do not have outbound network access.</p>', 'api-documentation', 'Jul 29, 2026', '5min read', 1)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SECTION 10: MIGRATION HELPERS (for incremental updates)
-- Run only the ALTER statements that are relevant to your DB
-- if you already have an older schema. They are safe to run
-- because they all use IF NOT EXISTS / IF EXISTS guards.
-- ============================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS bio     TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS website TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS dob     DATE DEFAULT NULL;

ALTER TABLE sessions ADD COLUMN IF NOT EXISTS user_agent  TEXT DEFAULT '';
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS ip_address  TEXT DEFAULT '';

-- ============================================================
-- DONE
-- Optional: set your first admin (replace email below)
-- UPDATE users SET role = 'admin' WHERE email = 'you@example.com';
-- ============================================================
