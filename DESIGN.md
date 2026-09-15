# Design System — M. Revi Ramadhan Portfolio

Dokumen ini merangkum sistem desain yang dipakai di project ini. Sumber utama: `app/globals.css` (Tailwind v4 + shadcn tokens). Semua warna ditulis dalam **oklch** (format asli di CSS) dan **hex** (hasil konversi, untuk referensi cepat).

---

## 1. Karakter Visual (Ringkasan)

- **Monokrom dominan** — palet inti adalah hitam/putih/abu-abu (neutral). Tidak ada warna jenuh di token utama.
- **2 warna aksen**:
  - **Orange `#f46c38`** — dipakai di pill animasi (rotating role pills, `.pill-wrapper`).
  - **Biru `#1447e6`** — satu-satunya warna jenuh di token, dipakai `sidebar-primary` di dark mode.
- **Mode terang & gelap** — token terbalik (light: bg putih / fg hitam; dark: bg hitam / fg putih).
- **Font**: Inter (sans), Poppins (heading), Geist Mono (mono).
- **Radius dasar**: `0.625rem` (10px), dengan skala sm→4xl.

---

## 2. Warna Dominan

### Light Mode (`:root`)

| Token | oklch | Hex | Peran |
|---|---|---|---|
| `--background` | `1 0 0` | `#ffffff` | Latar utama — **putih** |
| `--foreground` | `0.145 0 0` | `#0a0a0a` | Teks utama — **hampir hitam** |
| `--primary` | `0.205 0 0` | `#171717` | Tombol/aksi utama — **hitam** |
| `--primary-foreground` | `0.985 0 0` | `#fafafa` | Teks di atas primary — putih |
| `--secondary` / `--muted` / `--accent` | `0.97 0 0` | `#f5f5f5` | Area sekunder — abu terang |
| `--muted-foreground` | `0.556 0 0` | `#737373` | Teks redup — abu medium |
| `--destructive` | `0.577 0.245 27.325` | `#e7000b` | Error/hapus — **merah** |
| `--border` / `--input` | `0.922 0 0` | `#e5e5e5` | Garis pemisah — abu terang |
| `--ring` | `0.708 0 0` | `#a1a1a1` | Fokus ring — abu |
| `--sidebar` | `0.985 0 0` | `#fafafa` | Latar sidebar — putih |
| `--sidebar-primary` | `0.205 0 0` | `#171717` | Item aktif sidebar — hitam |

### Dark Mode (`.dark`)

| Token | oklch | Hex | Peran |
|---|---|---|---|
| `--background` | `0.145 0 0` | `#0a0a0a` | Latar utama — **hampir hitam** |
| `--foreground` | `0.985 0 0` | `#fafafa` | Teks utama — putih |
| `--primary` | `0.922 0 0` | `#e5e5e5` | Tombol utama — **putih** (inversi) |
| `--primary-foreground` | `0.205 0 0` | `#171717` | Teks di atas primary — hitam |
| `--secondary` / `--muted` / `--accent` | `0.269 0 0` | `#262626` | Area sekunder — abu gelap |
| `--muted-foreground` | `0.708 0 0` | `#a1a1a1` | Teks redup — abu medium |
| `--destructive` | `0.704 0.191 22.216` | `#ff6467` | Error/hapus — **merah muda** |
| `--border` | `1 0 0 / 10%` | `#ffffff1a` | Garis — putih 10% |
| `--input` | `1 0 0 / 15%` | `#ffffff26` | Input border — putih 15% |
| `--ring` | `0.556 0 0` | `#737373` | Fokus ring — abu |
| `--sidebar` | `0.205 0 0` | `#171717` | Latar sidebar — abu gelap |
| `--sidebar-primary` | `0.488 0.243 264.376` | `#1447e6` | Item aktif sidebar — **BIRU** ⭐ |

> ⭐ **Catatan**: `sidebar-primary` di dark mode adalah satu-satunya token jenuh di seluruh sistem — biru `#1447e6`. Ini aksen paling mencolok di mode gelap.

---

## 3. Warna Aksen Khusus

| Warna | Hex | Lokasi | Penggunaan |
|---|---|---|---|
| **Orange** | `#f46c38` | `.pill-wrapper` di `globals.css` | Background pill animasi (rotating role) — teks putih `#ffffff` |
| **Biru** | `#1447e6` | `--sidebar-primary` (dark) | Item aktif sidebar di dark mode |

Kedua warna ini **hardcoded** (bukan token) — orange di CSS class, biru hanya di dark mode. Kalau mau konsisten, bisa dijadikan token (`--accent-brand`, `--sidebar-primary` sudah ada).

---

## 4. Chart Colors

Gradasi abu untuk chart (sama di light & dark):

| Token | oklch | Hex |
|---|---|---|
| `--chart-1` | `0.87 0 0` | `#d4d4d4` |
| `--chart-2` | `0.556 0 0` | `#737373` |
| `--chart-3` | `0.439 0 0` | `#525252` |
| `--chart-4` | `0.371 0 0` | `#404040` |
| `--chart-5` | `0.269 0 0` | `#262626` |

---

## 5. Tipografi

| Variabel | Font | Penggunaan |
|---|---|---|
| `--font-sans` | **Inter** | Teks utama |
| `--font-heading` | **Poppins** | Judul/heading |
| `--font-mono` | **Geist Mono** | Kode/mono |

---

## 6. Radius

| Token | Nilai |
|---|---|
| `--radius` (dasar) | `0.625rem` (10px) |
| `--radius-sm` | `0.375rem` (6px) |
| `--radius-md` | `0.5rem` (8px) |
| `--radius-lg` | `0.625rem` (10px) |
| `--radius-xl` | `0.875rem` (14px) |
| `--radius-2xl` | `1.125rem` (18px) |
| `--radius-3xl` | `1.375rem` (22px) |
| `--radius-4xl` | `1.625rem` (26px) |

---

## 7. Warna di TSX (Hardcoded)

Selain token di CSS, ada warna hardcoded langsung di komponen. Ini yang dominan:

### Aksen Orange `#f46c38` — paling sering dipakai di TSX
| Lokasi | Penggunaan |
|---|---|
| `app/[locale]/page.tsx:69` | Icon arrow (fill) |
| `app/[locale]/projects/page.tsx:47` | Icon arrow (fill) |
| `app/[locale]/journey/page.tsx:47` | Icon arrow (fill) |
| `components/contact-form.tsx:50` | Icon (stroke) |
| `components/og/og-card.tsx:41` | Teks aksen di OG image |
| `components/admin/tabs/ThemeTab.tsx` | Preset "Default Dark" & "Warm Light" (theme_accent) |

### Halaman statis (coming-soon, not-found, maintenance) — inline style dark
| Warna | Hex | Penggunaan |
|---|---|---|
| Background | `#0a0a0a` | Latar halaman |
| Teks utama | `#fafafa` | Teks utama |
| Teks redup | `#555` / `#666` | Teks sekunder |
| Border | `#282828` / `#444` | Border elemen |
| Teks faded | `rgba(250,250,250,0.12)` | Efek teks besar transparan |
| Dot kuning | `#eab308` | Dot status di maintenance (satu-satunya kuning) |

### OG Image (`components/og/`)
| Warna | Hex | Penggunaan |
|---|---|---|
| Background | `#0a0a0a` | Latar OG card |
| Teks | `#fafafa` | Teks utama |
| Aksen | `#f46c38` | Teks aksen |
| Teks redup | `#a1a1aa` / `#71717a` | Teks sekunder |

### Google Auth (`components/auth/AuthForm.tsx`)
Warna brand Google (logo): `#4285F4`, `#34A853`, `#FBBC05`, `#EA4335` — hanya untuk logo, bukan bagian dari sistem.

### Theme Presets Admin (`components/admin/tabs/ThemeTab.tsx`)
5 preset tema yang bisa dipilih user di admin (disimpan ke DB, diterapkan via `ThemeProvider`):

| Preset | Background | Primary | Accent | Karakter |
|---|---|---|---|---|
| Default Dark | `#0a0a0a` | `#ebebeb` | `#f46c38` | Monokrom + orange |
| Blue Dark | `#080c14` | `#4a9eff` | `#4a9eff` | Biru |
| Green Dark | `#080e0a` | `#4ade80` | `#4ade80` | Hijau |
| Purple Dark | `#0a0810` | `#a855f7` | `#a855f7` | Ungu |
| Warm Light | `#fdf8f2` | `#c2410c` | `#f46c38` | Krem + orange |

> `ThemeProvider.tsx` mengubah token CSS runtime via `hexToOklch()` — jadi preset ini menimpa token di `globals.css`.

### DotMatrix Color Presets (`lib/dotmatrix-core.tsx`)
8 preset warna untuk efek dot matrix (loader/background):

| Preset | Warna |
|---|---|
| `solid-theme` | Pakai token `--color-dot-on` |
| `solid-mint` | `#34d399` |
| `grad-sunset` | `#ff5f6d → #ffc371 → #ffe29a` |
| `grad-ocean` | `#00c6ff → #0072ff → #4facfe` |
| `grad-neon` | `#b4ff39 → #39ffb6 → #00d4ff` |
| `grad-aurora` | `#ff3cac → #784ba0 → #2b86c5` |
| `grad-fire` | `#ff512f → #dd2476 → #ffb347` |
| `grad-prism` | `#12c2e9 → #c471ed → #f64f59` |

---

## 8. Penggunaan Tailwind Class (Dominan)

Hasil scan seluruh `.tsx`/`.ts` — class warna yang paling sering dipakai:

| Class | Jumlah | Peran |
|---|---|---|
| `text-muted-foreground` | 190 | **Paling dominan** — teks sekunder |
| `bg-muted` | 44 | Latar area redup |
| `bg-secondary` | 37 | Latar area sekunder |
| `text-foreground` | 35 | Teks utama |
| `bg-white` | 31 | Latar putih (light mode) |
| `border-border` | 30 | Border |
| `bg-destructive` | 26 | Tombol error/hapus |
| `text-white` | 23 | Teks putih |
| `text-primary` | 20 | Teks aksen utama |
| `bg-primary` | 14 | Tombol utama |
| `text-accent-foreground` | 14 | Teks di atas accent |
| `bg-accent` | 10 | Latar accent |
| `text-red` / `text-green` | 10 / 8 | Status (error/sukses) |

> Pola: sistem sangat bergantung pada `muted`/`secondary` untuk hierarki visual — bukan pada warna jenuh. Warna jenuh (red/green/blue) hanya untuk status & logo.

---

## 8. Layout & Struktur Halaman

### App Shell (`components/AppShell.tsx`)

| Aspek | Nilai |
|---|---|
| Padding global | `pt-24 px-5 md:px-10 lg:px-16` |
| Container utama | `max-w-[1200px] mx-auto p-6` |
| Grid desktop | `lg:grid-cols-[280px_1fr] gap-8` — sidebar 280px + konten |
| Sidebar (ProfileCard) | Sticky di desktop: `lg:sticky lg:top-24 lg:h-[calc(100vh-6rem)] lg:overflow-y-auto` |
| Mobile | Sidebar stacked di atas, `max-w-sm mx-auto` |
| Halaman tanpa sidebar | `/admin`, `/login`, `/register`, `/profile` — `max-w-6xl mx-auto` |

### Home Page (`app/[locale]/page.tsx`)

| Section | Layout |
|---|---|
| Jarak antar section | `space-y-16 lg:space-y-24` |
| Hero | Center di mobile, kiri di desktop (`text-center lg:text-left`), `pt-8 pb-4` |
| Section title | 2 baris uppercase: baris 1 solid, baris 2 faded (`rgba(182,180,189,0.2)`); `text-4xl → lg:text-[90px]`, `leading-[0.95] tracking-tight font-heading` |
| Stats | `grid grid-cols-3 gap-4 max-w-xl` |
| Skill cards | `grid sm:grid-cols-2 gap-4`, `rounded-2xl px-6 py-6`, gradient bg + dekorasi SVG |
| Projects / Experience / Blog | List `divide-y divide-border` — row: icon arrow + thumbnail + teks |
| Tools | `grid grid-cols-1 sm:grid-cols-2 gap-4` — icon 40px + nama + kategori |
| Templates | `grid sm:grid-cols-2 lg:grid-cols-3 gap-4` — card border + emoji |
| Contact | `max-w-xl mx-auto lg:mx-0` |
| Footer | `py-8 text-center border-t border-border` |

### Pola Umum

- **List rows** (projects/experience/blog): `flex items-center gap-6 py-5/6`, hover `bg-white/[0.02]` + arrow icon muncul (opacity 40→100)
- **Hover effect**: `group-hover:text-primary`, `group-hover:scale-105` (thumbnail), `transition-all`
- **Typography scale**: judul pakai `font-heading` (Poppins) + uppercase + `tracking-tight`; body pakai `text-muted-foreground`
- **Responsive**: mobile-first, breakpoint `sm`/`md`/`lg`; teks pakai `text-[14px] sm:text-[16px]` pattern

---

## 9. Aturan Pakai (Ringkas)

1. **Kontras utama** = foreground vs background. Jangan pakai warna jenuh untuk elemen besar — sistem ini monokrom.
2. **Aksen orange** `#f46c38` hanya untuk pill/elemen kecil yang butuh perhatian.
3. **Aksen biru** `#1447e6` hanya muncul di sidebar dark — jangan dipakai di tempat lain tanpa alasan.
4. **Destructive** merah untuk error/hapus saja.
5. Semua warna baru sebaiknya ditambahkan sebagai token di `globals.css`, bukan hardcoded di komponen.