-- Custom Pages table
create table if not exists custom_pages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content text not null default '',
  is_visible boolean not null default true,
  sort_order bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table custom_pages enable row level security;
create policy "Public read visible pages" on custom_pages for select using (is_visible = true);
create policy "Service role full access" on custom_pages using (true) with check (true);
