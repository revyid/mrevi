-- ============================================================
-- CONTENT MANAGEMENT SCHEMA
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- Drop tables lama
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS experiences CASCADE;
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
CREATE TABLE experiences (
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
INSERT INTO site_settings (key, value) VALUES
  ('profile_name', 'M. Revi Ramadhan'),
  ('profile_title', 'Software Engineer'),
  ('profile_bio', 'Based in Indonesia with 12+ years of experience in software engineering. Have completed 46+ projects for clients worldwide.'),
  ('profile_avatar', 'https://res.cloudinary.com/dr95izqlg/image/upload/v1777198819/i85y5yann4nxdy38vpge.jpg'),
  ('hero_title_1', 'SOFTWARE'),
  ('hero_title_2', 'ENGINEER'),
  ('hero_description', 'Passionate about creating intuitive and engaging user experiences. Specialize in transforming ideas into beautifully crafted products.'),
  ('stat_1_num', '+12'),
  ('stat_1_label', 'YEARS OF\nEXPERIENCE'),
  ('stat_2_num', '+46'),
  ('stat_2_label', 'PROJECTS\nCOMPLETED'),
  ('stat_3_num', '+20'),
  ('stat_3_label', 'WORLDWIDE\nCLIENTS')
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
CREATE TRIGGER on_experiences_updated_at BEFORE UPDATE ON experiences FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER on_tools_updated_at BEFORE UPDATE ON tools FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER on_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER on_site_settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ============================================================
-- INSERT DEFAULT DATA
-- ============================================================

-- Projects
INSERT INTO projects (title, subtitle, href, image, sort_order) VALUES
  ('NajmAI', 'SaaS Framer Template', 'https://framer.link/iij2V3q?duplicateType=siteTemplate', 'https://framerusercontent.com/images/4mYEXU91rLBNKIW9k6hZh16l7Q.jpeg?width=2400&height=1800', 1),
  ('Damas', 'Free Framer Template', 'https://framer.link/KhRj2A5?duplicateType=siteTemplate', 'https://framerusercontent.com/images/5Ra4AFZmEJOkMGLAEjkRXt2oqF4.png?width=2400&height=1800', 2),
  ('Majd', 'Free Portfolio Template', 'https://framer.link/BQAw2Te?duplicateType=siteTemplate', 'https://framerusercontent.com/images/PhIxX38mhdPQ9JAYHuioKv54qpc.png?width=520&height=540', 3);

-- Experiences
INSERT INTO experiences (company, description, period, sort_order) VALUES
  ('PixelForge Studios', 'Led the design team in creating user-centric mobile and web applications, improving the user experience and increasing user engagement.', 'Jan 2020 - Present', 1),
  ('BlueWave Innovators', 'Developed and implemented design strategies for new product lines, collaborated closely with engineers and product managers.', 'Jun 2017 - Dec 2019', 2),
  ('TrendCraft Solutions', 'Designed user interfaces for e-commerce platforms, focusing on enhancing usability and visual appeal.', 'Mar 2015 - May 2017', 3);

-- Tools
INSERT INTO tools (name, category, href, icon, sort_order) VALUES
  ('Framer', 'Website Builder', 'https://framer.com?via=mejed_k', 'https://framerusercontent.com/images/ay9QMj9AVG8gxBjilndTmDdmeQ.png', 1),
  ('Figma', 'Design Tool', 'https://www.figma.com/', 'https://framerusercontent.com/images/SvTAZZonMqViqF7fP6GK7CWmL84.png', 2),
  ('Lemon Squeezy', 'Payments Provider', 'https://www.lemonsqueezy.com/', 'https://framerusercontent.com/images/U1s9zT0tOtXbjdWvMrIgPFH0TyM.png', 3),
  ('ChatGPT', 'AI Assistant', 'https://chat.openai.com/', 'https://framerusercontent.com/images/MViiiLyIvL8tvy7d1XtOsM32o.png', 4),
  ('Notion', 'Productivity Tool', 'https://www.notion.so/', 'https://framerusercontent.com/images/iP5FTKjb84EsPLiEwbrAY7NEy44.png', 5),
  ('Nextjs', 'React framework', 'https://nextjs.org/', 'https://framerusercontent.com/images/MnQFYNLxlgT4EvY2ctcJfHAXZA.png', 6);

-- Blog Posts
INSERT INTO blog_posts (title, excerpt, slug, date, read_time, sort_order) VALUES
  ('Starting and Growing a Career in Web Design', 'As the internet continues to develop and grow exponentially, jobs related to the industry do too, particularly those that relate to web design and development.', 'starting-a-career-in-web-design', 'Apr 8, 2022', '6min read', 1),
  ('Create a Landing Page That Performs Great', 'Whether you work in marketing, sales, or product design, you understand the importance of a quality landing page.', 'create-a-landing-page-that-performs-great', 'Mar 15, 2022', '6min read', 2),
  ('How Can Designers Prepare for the Future?', 'Whether you work in marketing, sales, or product design, you understand the importance of a quality landing page.', 'how-can-designers-prepare-for-the-future', 'Feb 28, 2022', '6min read', 3);
