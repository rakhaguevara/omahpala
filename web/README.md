# Omah Pala — web

Implementasi React (Vite + TypeScript) dari `PRD.md` dan `design.md` di root proyek ini.
Baca dua file itu dulu kalau ada yang terasa janggal di sini — mereka sumber kebenaran, bukan file ini.

## Menjalankan

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # cek tipe (tsc -b) + build produksi ke dist/
npm run preview  # jalankan hasil build
```

Login admin demo: buka `/admin/login`

| Peran | Email | Password |
|---|---|---|
| admin (akses penuh) | `admin@omahpala.id` | `omahpala2025` |
| pengurus (produk & pesanan saja) | `pengurus@omahpala.id` | `togaberdaya` |

## Keputusan yang diambil di sesi ini

Dua hal ini disepakati langsung dengan pemilik proyek sebelum eksekusi, menyimpang dari draf PRD awal:

1. **Nama brand: "Omah Pala"** (bukan "PalaBerdaya"). String ini dipusatkan di
   `src/i18n/locales/{id,en}.json` → `common.brand`, jadi kalau berubah lagi tinggal ganti di situ,
   bukan cari-ganti di puluhan file.
2. **Stack: React (Vite) murni, bukan Next.js.** PRD §10 aslinya menetapkan Next.js 15 App Router
   untuk SSR/SEO + API routes admin. Karena diminta "React JS saja", proyek ini pakai:

   | Lapisan | PRD asli | Realisasi di sini |
   |---|---|---|
   | Framework | Next.js 15 App Router | **Vite + React 19 + TypeScript** (CSR murni) |
   | Routing | App Router | **react-router-dom v7** |
   | Animasi | Motion (framer-motion) | **framer-motion** — sama, tokens easing/durasi persis design.md §6 |
   | i18n | next-intl / built-in | **react-i18next** + deteksi bahasa browser |
   | SEO/meta | generateMetadata server-side | **react-helmet-async** (client-side, lihat batasan di bawah) |
   | Database | PostgreSQL + Prisma | **localStorage** (lihat di bawah) |
   | Auth | Auth.js | **Mock auth** — kredensial hardcoded, sesi di localStorage |
   | Media upload | UploadThing/Cloudinary | **Base64 data URL** disimpan langsung di localStorage |
   | Email | Resend | **Tidak ada** — form inquiry hanya menyimpan lokal |

## Tahap 1 PRD, dijalankan sesuai rencana PRD sendiri

PRD §11 Tahap 1 memang menyebut "data masih statis" — jadi pendekatan di sini bukan penyimpangan
dari situ, cuma dijalankan lewat React murni alih-alih Next.js. Yang dibangun penuh (bukan skeleton):

- **Situs publik dwibahasa ID/EN** — 6 halaman: Beranda, Katalog, Detail Produk, Program, Kebun, Kontak.
- **Panel admin fungsional** — CRUD produk (termasuk unggah gambar), CRUD lahan & penanam, inbox
  inquiry dengan status + catatan internal + ekspor CSV, editor konten hero/CTA tanpa deploy ulang.
- **Semua pola motion di design.md §6**: appear-on-scroll, stagger, marquee, counter, tab panel,
  parallax hero (maks 12%), dan `prefers-reduced-motion` dihormati di semua komponen motion.
- **Sistem desain design.md §2–5** dipetakan langsung ke Tailwind v4 `@theme` — warna, radius (4 nilai
  saja), skala tipografi Geist/Instrument Sans, spacing kelipatan 10.

### Kenapa localStorage, bukan database sungguhan

Panel admin **terlihat dan terasa fungsional** — tambah produk, ubah status inquiry, edit lahan, semua
tersimpan dan langsung terlihat di situs publik. Tapi ini disimpan di `localStorage` browser, per
perangkat:

- **Tidak lintas perangkat.** Produk yang ditambahkan admin dari laptop tidak muncul di HP admin lain.
- **Tidak persisten kalau localStorage dibersihkan** (mode incognito, "clear browsing data", dst).
- **Bukan aman untuk kredensial.** Login admin di `src/lib/auth.ts` hardcoded di kode client — siapa pun
  yang buka DevTools bisa baca password demo. **Jangan pernah pakai kredensial asli di sini.**
- Setiap tempat ini berlaku ditandai komentar `// Data contoh` atau `// TIDAK aman untuk produksi` di
  kode (`src/data/*.ts`, `src/lib/storage.ts`, `src/lib/auth.ts`).

Ini murni konsekuensi dari "React JS saja" tanpa server. Kalau mau persisten sungguhan, jalur
tercepat dari sini (tanpa nulis backend dari nol) adalah **Supabase**: ganti isi `src/lib/storage.ts`
dan `src/lib/auth.ts` dengan panggilan ke Supabase client (Postgres + Auth + Storage sekaligus), tanpa
perlu ubah struktur halaman/komponen karena semua akses data sudah lewat hook `useCollection` /
`useEntities.ts` di satu tempat.

### Batasan SEO dibanding rencana PRD §9

- **Tidak ada SSR.** `<title>`/`<meta>` dipasang lewat `react-helmet-async` saat React sudah jalan di
  browser — crawler yang tidak eksekusi JS (sebagian bot lama) akan melihat halaman kosong sesaat.
  Googlebot modern render JS jadi ini biasanya cukup, tapi bukan seaman SSR/SSG Next.js.
- **`hreflang` ID/EN** ditulis ke satu URL yang sama (situs ini tidak punya rute `/en/...` terpisah,
  bahasa berganti lewat toggle di navbar + localStorage) — secara teknis kurang tepat untuk SEO
  internasional dua bahasa yang serius. Next.js dengan rute `/id` `/en` terpisah akan lebih benar.
  - **Sitemap statis** (`public/sitemap.xml`) ditulis tangan dari `src/data/products.ts` — produk baru
  lewat admin **tidak otomatis masuk sitemap**. Perlu skrip generate-saat-build kalau produk sering
  berubah.
- JSON-LD `Organization` (Beranda) dan `Product` (detail produk) sudah ada sesuai PRD §9.

## Yang belum ada / perlu ditindaklanjuti sebelum rilis sungguhan

Urutan berdasar dampak, bukan berdasar tahap PRD:

1. **Backend nyata** — pilih Supabase (cepat) atau Postgres+Prisma+API terpisah (sesuai PRD §10 asli)
   untuk produk, lahan, penanam, inquiry, dan sesi admin. Tanpa ini panel admin cuma demo.
2. **Auth sungguhan** — hash password, sesi HTTP-only cookie atau token JWT tervalidasi server, bukan
   objek polos di localStorage.
3. **Notifikasi inquiry** — sambungkan form kontak ke Resend (atau layanan sejenis) untuk email admin +
   auto-reply, sesuai PRD C-03/C-04. Saat ini inquiry hanya tersimpan lokal, admin harus rajin cek
   `/admin/pesanan`.
4. **Storage gambar** — ganti base64-di-localStorage dengan UploadThing/Cloudinary/Supabase Storage
   sebelum ada banyak produk (data URL besar akan memperlambat & bisa melebihi kuota localStorage ~5–10 MB).
5. **Rate limiting form** sisi server — honeypot + jeda 30 detik di `Contact.tsx` hanya proteksi kosmetik
   sisi klien, gampang dilewati oleh bot yang tidak menjalankan JS sama sekali (mereka langsung POST).
6. **Isi konten asli** — semua foto pakai `picsum.photos` (placeholder), semua harga/MOQ/sertifikasi di
   `src/data/products.ts` contoh belaka dan HARUS diverifikasi tim sebelum live (PRD §12 risiko: jangan
   tampilkan sertifikasi yang belum terbit).
7. **5 pertanyaan terbuka PRD §13** masih belum terjawab kecuali #1 (nama brand). Perlu jawaban tim
   untuk: harga publik vs "request quotation" saja, penerima notifikasi inquiry, legalitas usaha
   (NIB/PIRT) yang boleh dicantumkan, bahasa target selain Inggris.

## Struktur

Mengikuti design.md §10, dengan tambahan `pages/` dan `lib/` khas Vite/React Router:

```
src/
  components/
    ui/        Button, Chip, Badge, Field (Input/Textarea/Select), Container, Section, Icons
    motion/    Reveal, Stagger, Marquee, CountUp, TabPanel — semua respect prefers-reduced-motion
    layout/    Navbar, Footer, PublicLayout, AdminLayout, Seo, LanguageSwitch
    blocks/    Hero, IntroBlock, PillarTabs, ProductCard/Grid, StatBand, WhyPala, CtaBand, EcosystemDiagram
    admin/     RequireAuth, ImageUploader
  pages/
    public/    Home, Catalog, ProductDetail, Program, Kebun, Contact, NotFound
    admin/     Login, Dashboard, ProductsAdmin, OrdersAdmin, KebunAdmin, ContentAdmin
  data/        Seed data (Product, Plot, Farmer, Program, PageContent) — lihat komentar "Data contoh"
  lib/         storage.ts (localStorage), useCollection/useEntities (hook reaktif), auth.ts (mock),
               motion.ts (token easing/durasi design.md §6), utils.ts, useLocale.ts
  i18n/        react-i18next config + locales/{id,en}.json
  types/       Model data — cermin PRD §8
```
