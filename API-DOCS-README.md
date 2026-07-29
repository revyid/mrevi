# API Documentation

## Overview

Dokumentasi lengkap untuk semua endpoint yang tersedia di **mrevi-api**.

**Base URL:** `https://api.revy.my.id` (atau sesuai konfigurasi `NEXT_PUBLIC_API_URL`)

## Akses Dokumentasi

Dokumentasi API dapat diakses melalui:
- **Web:** [https://revy.my.id/blog/api-docs](https://revy.my.id/blog/api-docs)
- **File:** `D:\web\mrevi\app\[locale]\blog\api-docs\page.tsx`

## Setup Database

Untuk menambahkan post API documentation ke blog, jalankan SQL seed:

```bash
psql -h your_host -U your_user -d your_database -f api-docs-seed.sql
```

Atau melalui Supabase SQL Editor, copy-paste isi dari `api-docs-seed.sql`.

## Endpoint yang Tersedia

### 1. `/api/portfolio`
- **Method:** GET
- **Deskripsi:** Fetch semua data portfolio (projects, experiences, tools, blog_posts, settings)
- **Auth:** Required (x-api-key header)

### 2. `/api/projects`
- **Method:** GET
- **Deskripsi:** Fetch semua projects
- **Auth:** Required (x-api-key header)

### 3. `/api/blog`
- **Method:** GET
- **Deskripsi:** Fetch semua blog posts
- **Auth:** Required (x-api-key header)

### 4. `/api/experiences`
- **Method:** GET
- **Deskripsi:** Fetch semua journey entries
- **Auth:** Required (x-api-key header)

### 5. `/api/tools`
- **Method:** GET
- **Deskripsi:** Fetch semua tools/technologies
- **Auth:** Required (x-api-key header)

## Authentication

Semua endpoint memerlukan API key di header:

```
x-api-key: your_api_key_here
```

API key di-hash menggunakan SHA-256 sebelum disimpan di database.

### Cara Generate API Key

#### Via UI (Recommended)
1. Login ke https://revy.my.id
2. Buka Profile page (`/profile`)
3. Scroll ke section "API Authentication"
4. API key otomatis di-generate saat pertama kali dibuka
5. Copy API key dan simpan dengan aman
6. Jika hilang, klik "Regenerate Key" untuk create new one

#### Via SQL (Manual)
```sql
INSERT INTO api_keys (
  user_id,
  key_hash,
  name,
  rate_limit,
  is_active
) VALUES (
  'user-uuid-here',
  encode(digest('your-secret-key', 'sha256'), 'hex'),
  'My API Key',
  100, -- requests per hour
  true
);
```

## Rate Limiting

- Rate limit diterapkan per API key
- Default: configurable per key (cek tabel `api_keys`)
- Window: 1 jam
- Response jika exceed: `429 Too Many Requests`

## CORS

Semua endpoint support CORS dengan konfigurasi:
- **Origin:** Dynamic (based on request)
- **Methods:** GET, OPTIONS
- **Headers:** Content-Type, x-api-key

## Error Responses

### 401 Unauthorized
```json
{ "error": "API key required" }
{ "error": "Invalid API key" }
{ "error": "API key is inactive" }
{ "error": "API key expired" }
```

### 429 Too Many Requests
```json
{ "error": "Rate limit exceeded" }
```

### 500 Internal Server Error
```json
{ "error": "Internal Server Error" }
```

## Struktur Project

### mrevi-api (D:\web\mrevi-api)
```
app/
  api/
    portfolio/route.ts    # Endpoint /api/portfolio
    projects/route.ts     # Endpoint /api/projects
    blog/route.ts         # Endpoint /api/blog
    experiences/route.ts  # Endpoint /api/experiences
    tools/route.ts        # Endpoint /api/tools
lib/
  auth.ts                 # Authentication & validation logic
```

### mrevi (D:\web\mrevi)
```
app/
  [locale]/
    blog/
      api-docs/
        page.tsx          # API Documentation page
api-docs-seed.sql         # SQL seed untuk blog post
```

## Development

### mrevi-api
```bash
cd D:\web\mrevi-api
npm run dev
```

### mrevi
```bash
cd D:\web\mrevi
npm run dev
```

## Notes

- **mrevi** tidak memiliki endpoint `/api/portfolio`, `/api/projects`, dll. Semua endpoint ada di **mrevi-api**.
- Dokumentasi ditaruh di blog mrevi (`/blog/api-docs`) untuk kemudahan akses dan maintenance.
- API key management dilakukan melalui tabel `api_keys` dan `api_key_usage` di Supabase.

## Support

Ada pertanyaan? Contact melalui [contact form](https://revy.my.id/contact).
