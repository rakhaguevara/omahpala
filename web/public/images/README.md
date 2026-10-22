# Gambar situs

Semua gambar publik (bukan foto yang diupload lewat panel admin — itu disimpan sebagai base64 di
localStorage, lihat `src/components/admin/ImageUploader.tsx`) ada di folder ini, dikelompokkan per
halaman. Path-nya diatur terpusat lewat `src/lib/images.ts` — itu satu-satunya file kode yang tahu
nama file di sini, supaya ganti gambar cukup di folder ini, bukan berburu di banyak file data/komponen.

## Struktur folder

| Folder | Dipakai di | Isi |
|---|---|---|
| `home/` | Beranda (`Hero`, `IntroBlock`, `WhyPala`, `CtaBand`, `EcosystemDiagram`) | Foto hero, 3 foto pengantar, foto petani, foto hutan CTA, 3 foto ekosistem (KWT/SPI/TOGA Corner) |
| `products/` | Katalog, detail produk, kartu produk di Beranda | 2 foto per produk — nama file `<slug-produk>-1.webp` / `-2.webp` (slug dari `src/data/products.ts`) |
| `program/` | Halaman Program, kartu pilar di Beranda | 1 foto per pilar (`screening`/`cultivation`/`production`/`economy`/`monitoring`) + 6 foto galeri |
| `kebun/` | Halaman Kebun & detail lahan | Foto petani (`farmer-<id>.webp`) & foto lahan (`plot-<id>.webp`) — id dari `src/data/farmers.ts` / `plots.ts` |
| `articles/` | Artikel/Kabar | 1 foto per artikel — nama file `<slug-artikel>.webp` (slug dari `src/data/articles.ts`) |
| `polo/` | Halaman Polo Games (`PageBanner`) | Foto banner hero (peta harta karun) |
| `contact/` | Halaman Kontak | Foto banner hero |
| `shared/` | Footer (semua halaman), meta `og:image` default | Foto latar footer, gambar share default |

## Status saat ini

**Foto dokumentasi asli program TOGA BERDAYA** (diambil dari Google Drive dokumentasi PPK Ormawa HIMFA UII, minggu ke-1 sampai ke-4 bulan ke-1 s.d. ke-4) sudah menggantikan foto Unsplash di:
`home/` (hero, cta-forest, why-farmer, intro-2, intro-3, ecosystem-kwt/spi/toga-corner), `program/` (screening, cultivation, production,
economy, monitoring, gallery-1..6), `articles/` (3 foto), `contact/hero`, `kebun/plot-p-01..05`, `shared/footer-bg`, `shared/og-default`.
Semuanya dipotong dan dikonversi ke `.webp` (kualitas ~82).

**Masih foto contoh / belum diganti** (tidak ada padanannya di dokumentasi, atau butuh keputusan pemilik):
- `products/*` — foto produk (kecuali yang sudah berupa `.png` buatan sendiri) masih Unsplash; butuh foto kemasan produk asli.
- `kebun/farmer-*` — foto petani: data petani masih nama contoh (`src/data/farmers.ts`), jadi foto orang sungguhan tidak dipasang.
- `home/intro-1.webp` — foto buatan sendiri (file asli sangat besar, lihat catatan ukuran di bawah).

Catatan: foto asli di Drive berukuran ~10 MB per file (kamera Sony); yang dipasang di sini sudah diperkecil. Foto wajah warga/peserta
dipakai dari dokumentasi kegiatan — pastikan izin publikasinya sebelum situs dirilis.

## Cara mengganti gambar

1. Buka folder yang sesuai di tabel atas.
2. Timpa file dengan foto asli, **pakai nama file yang sama** (mis. `hero.webp` tetap bernama
   `hero.webp`) — dengan begitu tidak ada baris kode yang perlu diubah sama sekali. Convert foto ke
   `.webp` dulu (banyak tool online gratis, atau `cwebp`/Photoshop/Squoosh.app) sebelum menimpa.
3. Kalau foto asli formatnya beda (`.jpg`/`.png`, bukan `.webp`), simpan dengan ekstensi itu, lalu
   ganti ekstensi pada baris terkait di `src/lib/images.ts` (satu-satunya kondisi yang perlu sentuh
   kode) — tapi disarankan tetap `.webp` demi performa.
4. Untuk produk/petani/lahan/artikel baru: tambahkan file dengan pola nama yang sama (`<slug>-1.webp`,
   `farmer-f-05.webp`, dst.) — fungsi helper di `src/lib/images.ts` (`productImages`, `farmerPhoto`,
   `plotPhoto`, `articleImage`) otomatis mengarah ke situ selama `slug`/`id` datanya cocok.

## Ukuran yang disarankan

Rasio aspek harus sama dengan yang sudah ada; resolusi asli boleh lebih tinggi, tapi jangan lebih
rendah dari ini (supaya tidak pecah di layar retina):

- `products/*` — persegi, 1000×1000
- `home/hero.webp` — 2000×1400 (lebar, foto latar penuh)
- `home/intro-*.webp` — potret, 700×875
- `home/why-farmer.webp` — potret, 900×1000
- `home/cta-forest.webp` — lebar, 1800×1000
- `home/ecosystem-*.webp` — 800×800
- `program/screening..monitoring.webp` — potret, 1000×1250
- `program/gallery-*.webp` — campuran potret dan lanskap
- `kebun/farmer-*.webp` — potret, 600×750
- `kebun/plot-*.webp` — lanskap, 900×700
- `articles/*.webp` — lanskap, 900×650
- `contact/hero.webp` — lebar, 1600×700
- `shared/footer-bg.webp` — lebar, 1800×900
- `shared/og-default.webp` — 1200×630 (rasio standar Open Graph)
