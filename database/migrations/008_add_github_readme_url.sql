-- 008: separate GitHub README import column for public profiles.
-- Run this in Supabase SQL Editor (shared project with mrevi/store/api).
ALTER TABLE users ADD COLUMN IF NOT EXISTS github_readme_url TEXT DEFAULT '';
