# AGENTS.md — M. Revi Ramadhan Portfolio

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project Overview

Portfolio + CMS untuk M. Revi Ramadhan (revy.my.id). Next.js App Router, Supabase (PostgreSQL), Tailwind v4, shadcn/ui, next-intl (i18n en/id).

## Stack

- **Framework**: Next.js (App Router, `app/[locale]/` untuk i18n)
- **Database**: Supabase (PostgreSQL) — akses via `lib/db.ts` (service_role, bypass RLS) & `lib/supabase-client.ts` (browser)
- **Auth**: Custom auth (tabel `users` + `sessions` + `passkeys` WebAuthn) — BUKAN Supabase Auth
- **Styling**: Tailwind v4 — konfigurasi di `app/globals.css` (`@theme inline`), TIDAK ada tailwind.config.js
- **UI**: shadcn/ui (`components/ui/`), `components.json`
- **i18n**: next-intl (`i18n/`, `messages/en.json`, `messages/id.json`)

## Struktur Penting

| Path | Isi |
|---|---|
| `app/[locale]/` | Halaman publik (home, projects, journey, tools, blog, contact, profile, admin) |
| `app/actions/` | Server actions (admin.ts, auth.ts, biz.ts, content.ts) |
| `app/api/` | Route handlers (assets, upload, sessions, nav-seed, debug, curl-proxy) |
| `components/` | Komponen UI (AppShell, ProfileCard, admin/, auth/, og/, ui/) |
| `lib/` | Utilitas (db.ts, auth.ts, api-client.ts, dotmatrix-*) |
| `database/` | Semua SQL schema + seed + migrations (Supabase SQL Editor) |
| `types/database.types.ts` | TypeScript types dari Supabase |
| `DESIGN.md` | **BACA SEBELUM MENGUBAH UI** — warna, tipografi, layout, token |

## Aturan Kunci

1. **Design**: Baca `DESIGN.md` dulu sebelum menyentuh UI. Sistem monokrom + aksen orange `#f46c38`. Jangan hardcode warna baru — tambah token di `globals.css`.
2. **Database**: Semua SQL ada di `database/`. Jangan buat file SQL baru di root. `unified-schema.sql` = schema lengkap; `migrations/` = perubahan inkremental.
3. **Auth**: Custom auth (bukan Supabase Auth). Jangan pindah ke Supabase Auth tanpa persetujuan.
4. **i18n**: Semua teks user-facing lewat next-intl (`getTranslations`). Jangan hardcode string di komponen.
5. **Server vs Client**: Server actions & DB akses hanya di server. Komponen interaktif pakai `"use client"`.
6. **Next.js versi ini beda**: Cek `node_modules/next/dist/docs/` sebelum pakai API Next.js yang tidak familiar.