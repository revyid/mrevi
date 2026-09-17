# M. Revi Ramadhan — Portfolio & CMS

Portfolio pribadi + CMS untuk [revy.my.id](https://revy.my.id). Dibangun dengan Next.js App Router, Supabase (PostgreSQL), Tailwind v4, shadcn/ui, dan next-intl (i18n en/id).

## Stack

- **Framework**: Next.js (App Router, `app/[locale]/` untuk i18n)
- **Database**: Supabase (PostgreSQL) — `lib/db.ts` (service_role) & `lib/supabase-client.ts` (browser)
- **Auth**: Custom auth — tabel `users` + `sessions` + `passkeys` (WebAuthn), bukan Supabase Auth
- **Styling**: Tailwind v4 (konfigurasi di `app/globals.css`, tanpa tailwind.config.js)
- **UI**: shadcn/ui (`components/ui/`)
- **i18n**: next-intl (`i18n/`, `messages/en.json`, `messages/id.json`)

## Getting Started

```bash
bun install
bun dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Struktur

| Path | Isi |
|---|---|
| `app/[locale]/` | Halaman publik (home, projects, journey, tools, blog, contact, profile, admin) |
| `app/actions/` | Server actions (admin, auth, biz, content) |
| `app/api/` | Route handlers (assets, upload, sessions, nav-seed, debug, curl-proxy) |
| `components/` | Komponen UI (AppShell, ProfileCard, admin/, auth/, og/, ui/) |
| `lib/` | Utilitas (db, auth, api-client, dotmatrix-*) |
| `database/` | SQL schema + seed + migrations (jalankan di Supabase SQL Editor) |
| `types/database.types.ts` | TypeScript types dari Supabase |

## Setup Database

1. Buat project di [Supabase](https://supabase.com)
2. Jalankan `database/unified-schema.sql` di SQL Editor (schema lengkap, aman di-re-run)
3. Untuk perubahan inkremental, jalankan file di `database/migrations/`
4. Copy `.env.example` ke `.env.local` lalu isi nilai aslinya (daftar env vars ada di file itu): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `JWT_SECRET`

## Dokumentasi

- **`DESIGN.md`** — sistem desain: warna (monokrom + aksen orange `#f46c38`), tipografi, layout. Baca sebelum mengubah UI.
- **`AGENTS.md`** — panduan untuk AI agents / kontributor.
- **`API-DOCS-README.md`** — dokumentasi API (mrevi-api).

## Deploy

Deploy di [Vercel](https://vercel.com) — project ini sudah terhubung dengan Vercel.