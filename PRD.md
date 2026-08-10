# PRD — PalaBerdaya

**Produk:** Website pemasaran internasional produk olahan pala Desa Wonokerto + panel admin
**Pemilik program:** PPKO HIMFA UII — Desa Sehat Berbasis TOGA, Desa Wonokerto, Sleman
**Versi:** 1.0 · Draft
**Status:** Menunggu review tim

---

## 1. Latar belakang

Desa Wonokerto punya komoditas pala yang sudah diolah warga menjadi produk turunan (gummy pala, teh daging buah pala, dan seterusnya). Produk ini sudah ada, tapi jangkauannya masih lokal. Di sisi lain, program PPKO HIMFA UII "Desa Sehat Berbasis TOGA" butuh etalase yang bisa dipertanggungjawabkan ke penilai, mitra, dan dinas.

Dua kebutuhan itu selama ini dipisah: profil program di satu tempat, jualan di tempat lain. Website ini menyatukannya — karena justru asal-usul programnyalah yang membuat produknya layak dibeli pembeli luar negeri.

## 2. Tujuan

**Tujuan bisnis**
1. Mendapatkan inquiry pembelian dari buyer/distributor luar negeri.
2. Memperkenalkan program TOGA Berdaya PPKO HIMFA UII sebagai program yang berdampak dan terdokumentasi.
3. Memberi tim desa alat untuk mengelola katalog dan pesanan tanpa perlu ngoding.

**Tujuan pengguna**
- Buyer internasional: paham produk, standar mutu, kapasitas, dan cara memesan dalam < 3 menit.
- Penilai/mitra program: menemukan pilar program, capaian, dan bukti kegiatan tanpa mencari-cari.
- Pembeli lokal: bisa pesan cepat lewat WhatsApp.

## 3. Metrik keberhasilan

| Metrik | Target 3 bulan |
|---|---|
| Inquiry ekspor masuk (form + email) | ≥ 15 |
| Pesan WhatsApp dari tombol produk | ≥ 60 |
| Sesi dari luar Indonesia | ≥ 25% total sesi |
| Lighthouse Performance & Accessibility (mobile) | ≥ 90 |
| Produk dikelola lewat admin, bukan lewat kode | 100% |

## 4. Pengguna

**P1 — Buyer / distributor internasional.** Bahasa Inggris. Membuka dari desktop. Cari: spesifikasi produk, sertifikasi, MOQ, kapasitas produksi, kemasan, incoterm, kontak. Skeptis terhadap supplier baru — butuh bukti, bukan klaim.

**P2 — Penilai PPKO / mitra / dinas.** Bahasa Indonesia. Cari: pilar program, metode, target capaian, dokumentasi kegiatan, keberlanjutan.

**P3 — Pembeli ritel lokal.** Bahasa Indonesia, mobile. Cari: produk, harga, cara pesan. Jalur tercepat: WhatsApp.

**P4 — Admin (tim PPKO + pengurus TOGA Berdaya).** Literasi digital menengah. Harus bisa tambah produk, ubah stok, dan baca pesanan lewat HP.

## 5. Ruang lingkup

### Termasuk (MVP)
- Situs publik dwibahasa ID/EN, 6 halaman.
- Katalog produk dengan detail spesifikasi ekspor.
- Profil program: pilar, metode, capaian, ekosistem.
- Halaman lahan & penanam (traceability).
- Form inquiry ekspor + tombol pesan WhatsApp.
- Panel admin dengan autentikasi: CRUD produk, lahan, penanam, konten, dan inbox pesanan/inquiry.

### Tidak termasuk (fase berikutnya)
- Pembayaran online / checkout kartu.
- Perhitungan ongkir otomatis.
- Multi-vendor.
- Aplikasi mobile native.
- Blog/artikel penuh (cukup satu halaman dokumentasi kegiatan).

## 6. Peta situs

```
/                      Beranda
/produk                Katalog produk
/produk/[slug]         Detail produk
/program               Program TOGA Berdaya (pilar, metode, capaian)
/kebun                 Lahan & penanam (traceability)
/kontak                Kontak + form inquiry ekspor

/admin/login
/admin                 Dashboard
/admin/produk          CRUD produk
/admin/pesanan         Pesanan & inquiry
/admin/kebun           Lahan & penanam
/admin/konten          Teks halaman & statistik
```

## 7. Kebutuhan per halaman

### 7.1 Beranda

| ID | Kebutuhan | Prioritas |
|---|---|---|
| H-01 | Hero gambar penuh dengan overlay gelap, judul program, subjudul, CTA utama | Must |
| H-02 | Kartu melayang berisi potret program + 2 angka capaian, di atas hero | Must |
| H-03 | Navbar melayang (floating pill), sticky, menyusut saat scroll | Must |
| H-04 | Blok pengantar program: eyebrow, judul tengah, 3 gambar kegiatan, 3 poin fokus | Must |
| H-05 | Bagian pilar program dengan chip tab yang bisa diklik | Must |
| H-06 | Bagian produk unggulan: 2–3 kartu produk + tombol ke katalog | Must |
| H-07 | Band statistik capaian (4 angka, animasi hitung naik saat masuk viewport) | Should |
| H-08 | Blok "Mengapa Pala": 2 kolom, teks berpoin + foto petani | Should |
| H-09 | Diagram ekosistem TOGA (grafis melingkar) | Could |
| H-10 | CTA penutup di atas gambar hutan | Must |
| H-11 | Footer: logo, langganan email, kolom navigasi, alamat, kontak, sosial | Must |

### 7.2 Katalog & detail produk

| ID | Kebutuhan | Prioritas |
|---|---|---|
| P-01 | Grid kartu produk: foto, nama, kategori, badge sertifikasi, harga (opsional), tombol pesan | Must |
| P-02 | Filter kategori (pangan / minuman / non-pangan) | Should |
| P-03 | Detail produk: galeri foto, deskripsi, komposisi, berat bersih, kemasan, masa simpan, sertifikasi | Must |
| P-04 | Blok spesifikasi ekspor: MOQ, kapasitas bulanan, kode HS, opsi incoterm, pelabuhan asal | Must |
| P-05 | Traceability: produk ini berasal dari lahan X, ditanam oleh Y — tertaut ke `/kebun` | Must |
| P-06 | Dua CTA: "Pesan via WhatsApp" (lokal) dan "Request quotation" (ekspor, buka form) | Must |
| P-07 | Produk terkait di bawah | Could |

### 7.3 Program

| ID | Kebutuhan | Prioritas |
|---|---|---|
| PR-01 | Lima pilar program dalam tab: skrining & edukasi, budidaya & standardisasi, produksi herbal, TOGA corner & ekonomi, monitoring & keberlanjutan | Must |
| PR-02 | Tiap pilar: gambar, deskripsi, daftar poin bercentang | Must |
| PR-03 | Target capaian program dengan angka | Must |
| PR-04 | Roadmap/linimasa program | Should |
| PR-05 | Galeri dokumentasi kegiatan | Should |

### 7.4 Kebun (lahan & penanam)

| ID | Kebutuhan | Prioritas |
|---|---|---|
| K-01 | Daftar lahan: kode petak, nama, luas, komoditas, status | Must |
| K-02 | Daftar penanam: nama, peran, lahan yang digarap | Must |
| K-03 | Relasi dua arah: klik lahan → tampil penanam + produk hasilnya | Should |
| K-04 | Peta lokasi kebun (embed) | Could |

### 7.5 Kontak

| ID | Kebutuhan | Prioritas |
|---|---|---|
| C-01 | Form inquiry: nama, perusahaan, negara, email, produk diminati, estimasi volume, pesan | Must |
| C-02 | Validasi sisi klien + server, proteksi spam (honeypot + rate limit) | Must |
| C-03 | Kirim notifikasi email ke admin + simpan ke database | Must |
| C-04 | Auto-reply ke pengirim dalam bahasa yang dipilih | Should |
| C-05 | Kontak langsung: WhatsApp, email, Instagram, alamat | Must |

### 7.6 Panel admin

| ID | Kebutuhan | Prioritas |
|---|---|---|
| A-01 | Login email + password, sesi aman, logout | Must |
| A-02 | Dua peran: `admin` (semua akses) dan `pengurus` (produk & pesanan saja) | Should |
| A-03 | Dashboard: jumlah inquiry baru, pesanan bulan ini, produk stok rendah | Must |
| A-04 | CRUD produk termasuk unggah gambar dan toggle "tampilkan di beranda" | Must |
| A-05 | Inbox inquiry: baca, tandai status (baru / diproses / selesai), catatan internal | Must |
| A-06 | CRUD lahan & penanam | Must |
| A-07 | Edit teks hero, statistik, dan konten pilar tanpa deploy ulang | Should |
| A-08 | Ekspor daftar inquiry ke CSV | Could |
| A-09 | Responsif penuh — admin harus bisa dipakai dari HP | Must |

## 8. Model data

```
Product
  id, slug, name_id, name_en, category, description_id, description_en,
  composition, net_weight, packaging, shelf_life, price_idr, price_usd,
  moq, monthly_capacity, hs_code, certifications[], images[],
  plot_id → Plot, is_featured, is_active, created_at

Plot (Lahan)
  id, code, name, area_m2, commodities[], status, farmer_id → Farmer

Farmer (Penanam)
  id, name, role, photo, joined_at

Inquiry
  id, name, company, country, email, phone, product_id, volume,
  message, locale, status, internal_note, created_at

PageContent
  key, locale, value        // teks hero, statistik, dsb.

User
  id, email, password_hash, role, created_at
```

## 9. Kebutuhan non-fungsional

- **Bahasa.** EN sebagai default untuk pengunjung luar negeri (deteksi `Accept-Language`), ID untuk pengunjung Indonesia. Pengalih bahasa selalu terlihat di navbar. Semua konten publik wajib punya dua versi.
- **Performa.** LCP < 2,5 detik pada 4G. Gambar lewat `next/image` format AVIF/WebP. Halaman publik dirender statis dengan revalidasi.
- **SEO.** Metadata per halaman, `hreflang` ID/EN, Open Graph, sitemap, structured data `Product` dan `Organization`.
- **Aksesibilitas.** WCAG 2.1 AA. Kontras minimum terpenuhi, fokus keyboard terlihat, `prefers-reduced-motion` dihormati, semua gambar bermakna punya alt.
- **Keamanan.** Password di-hash, rute admin dilindungi middleware, unggahan dibatasi tipe dan ukuran, form dibatasi laju permintaan.
- **Browser.** Dua versi terakhir Chrome, Safari, Firefox, Edge. Mobile 360px ke atas.

## 10. Stack teknis

| Lapisan | Pilihan | Alasan |
|---|---|---|
| Framework | Next.js 15 (App Router) + TypeScript | Butuh SSR/SSG untuk SEO internasional dan API route untuk admin |
| Styling | Tailwind CSS v4 + token CSS variable | Token dari `design.md` dipetakan langsung |
| Animasi | Motion (framer-motion) | Menggantikan animasi Framer, easing tetap sama |
| Database | PostgreSQL + Prisma | Relasi produk↔lahan↔penanam butuh join |
| Auth | Auth.js (credentials) | Cukup untuk 2 peran, tanpa vendor lock |
| Media | UploadThing atau Cloudinary | Admin unggah dari HP tanpa urus storage |
| Email | Resend | Notifikasi inquiry + auto-reply |
| Hosting | Vercel + Neon | Gratis pada skala ini, deploy dari Git |

## 11. Tahapan

| Tahap | Isi | Perkiraan |
|---|---|---|
| 0 | Setup repo, token desain, komponen dasar (button, card, section, navbar, footer) | 3 hari |
| 1 | Beranda + katalog + detail produk, data masih statis | 5 hari |
| 2 | Halaman program, kebun, kontak + form inquiry berfungsi | 4 hari |
| 3 | Database, auth, panel admin CRUD | 6 hari |
| 4 | i18n EN/ID, SEO, aksesibilitas, uji performa | 3 hari |
| 5 | Isi konten asli, foto produk, uji terima tim, rilis | 3 hari |

## 12. Asumsi & risiko

**Asumsi**
- Foto produk dan foto kegiatan disediakan tim dengan resolusi memadai.
- Data sertifikasi (PIRT/halal/SNI) sudah ada atau sedang diurus dan boleh ditampilkan.
- Deskripsi produk versi Inggris disiapkan tim atau diterjemahkan sebagai bagian tahap 5.

**Risiko**
- *Klaim ekspor tanpa dokumen pendukung.* Jangan tampilkan sertifikasi yang belum terbit — buyer akan memverifikasi. Tandai sebagai "dalam proses" bila memang begitu.
- *Konten dua bahasa terbengkalai.* Admin wajib memaksa pengisian kedua bahasa sebelum produk bisa diaktifkan.
- *Angka capaian program berubah.* Simpan sebagai `PageContent`, bukan hardcode.

## 13. Pertanyaan terbuka

1. Nama brand final untuk dagang: **PalaBerdaya**, **Omah Pala**, atau keduanya (Omah Pala sebagai brand produk, TOGA Berdaya sebagai nama program)?
2. Apakah harga ditampilkan publik, atau hanya "request quotation" untuk pasar ekspor?
3. Siapa penerima notifikasi inquiry — email tim atau email desa?
4. Sudah ada legalitas usaha (NIB/PIRT) yang bisa dicantumkan?
5. Bahasa target selain Inggris? (Arab dan Mandarin sering relevan untuk rempah.)
