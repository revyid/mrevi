-- Page Settings table — per-page status and role-based access control
create table if not exists page_settings (
  id uuid primary key default gen_random_uuid(),
  path text not null unique,           -- e.g. "/", "/blog", "/projects"
  label text not null,                 -- Display name e.g. "Home", "Blog"
  status text not null default 'live', -- live | maintenance | coming_soon | hidden
  access_role text not null default 'public', -- public | user | admin
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table page_settings enable row level security;
create policy "Service role full access" on page_settings using (true) with check (true);

-- Seed default pages
insert into page_settings (path, label, status, access_role) values
  ('/', 'Home', 'live', 'public'),
  ('/blog', 'Blog', 'live', 'public'),
  ('/projects', 'Projects', 'live', 'public'),
  ('/experience', 'Experience', 'live', 'public'),
  ('/tools', 'Tools', 'live', 'public'),
  ('/contact', 'Contact', 'live', 'public'),
  ('/profile', 'Profile', 'live', 'user'),
  ('/admin', 'Admin', 'live', 'admin'),
  ('/login', 'Login', 'live', 'public'),
  ('/register', 'Register', 'live', 'public')
on conflict (path) do nothing;
