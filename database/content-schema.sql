-- ============================================================
-- CONTENT MANAGEMENT SCHEMA
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- Drop tables lama
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS journey CASCADE;
DROP TABLE IF EXISTS tools CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;
DROP TABLE IF EXISTS site_settings CASCADE;

-- ============================================================
-- 1. PROJECTS
-- ============================================================
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT DEFAULT '',
  href TEXT DEFAULT '',
  image TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. EXPERIENCES
-- ============================================================
CREATE TABLE journey (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company TEXT NOT NULL,
  description TEXT DEFAULT '',
  period TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. TOOLS
-- ============================================================
CREATE TABLE tools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT DEFAULT '',
  href TEXT DEFAULT '',
  icon TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. BLOG POSTS
-- ============================================================
CREATE TABLE blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT DEFAULT '',
  content TEXT DEFAULT '',
  slug TEXT UNIQUE NOT NULL,
  date TEXT DEFAULT '',
  read_time TEXT DEFAULT '5min read',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. SITE SETTINGS (profile, hero, etc)
-- ============================================================
CREATE TABLE site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
-- NOTE: content keys default to empty strings on purpose — the site renders
-- honest fallbacks (or hides the block) instead of fictional template data.
-- Fill real values in via the admin CMS (SettingsTab).
INSERT INTO site_settings (key, value) VALUES
  ('profile_name', 'M. Revi Ramadhan'),
  ('profile_title', 'Software Engineer'),
  ('profile_bio', ''),
  ('profile_avatar', 'https://res.cloudinary.com/dr95izqlg/image/upload/v1777198819/i85y5yann4nxdy38vpge.jpg'),
  ('hero_title_1', ''),
  ('hero_title_2', ''),
  ('hero_description', 'Passionate about creating intuitive and engaging user experiences. Specialize in transforming ideas into beautifully crafted products.'),
  ('stat_1_num', ''),
  ('stat_1_label', ''),
  ('stat_2_num', ''),
  ('stat_2_label', ''),
  ('stat_3_num', ''),
  ('stat_3_label', '')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER on_journey_updated_at BEFORE UPDATE ON journey FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER on_tools_updated_at BEFORE UPDATE ON tools FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER on_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER on_site_settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ============================================================
-- INSERT DEFAULT DATA
-- No seed rows for projects/journey/blog: those must be real
-- content managed via the admin CMS. The Framer template demo
-- projects (NajmAI, Damas, Majd), fictional companies (PixelForge
-- Studios, BlueWave Innovators, TrendCraft Solutions) and stock
-- 2022 blog articles were removed.
-- ============================================================

-- Tools (real tools only, no affiliate links)
INSERT INTO tools (name, category, href, icon, sort_order) VALUES
  ('Figma', 'Design Tool', 'https://www.figma.com/', 'https://framerusercontent.com/images/SvTAZZonMqViqF7fP6GK7CWmL84.png', 2),
  ('Lemon Squeezy', 'Payments Provider', 'https://www.lemonsqueezy.com/', 'https://framerusercontent.com/images/U1s9zT0tOtXbjdWvMrIgPFH0TyM.png', 3),
  ('ChatGPT', 'AI Assistant', 'https://chat.openai.com/', 'https://framerusercontent.com/images/MViiiLyIvL8tvy7d1XtOsM32o.png', 4),
  ('Notion', 'Productivity Tool', 'https://www.notion.so/', 'https://framerusercontent.com/images/iP5FTKjb84EsPLiEwbrAY7NEy44.png', 5),
  ('Nextjs', 'React framework', 'https://nextjs.org/', 'https://framerusercontent.com/images/MnQFYNLxlgT4EvY2ctcJfHAXZA.png', 6);
