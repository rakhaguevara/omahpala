# Gambar situs

Semua gambar publik (bukan foto yang diupload lewat panel admin — itu disimpan sebagai base64 di
localStorage, lihat `src/components/admin/ImageUploader.tsx`) ada di folder ini, dikelompokkan per
halaman. Path-nya diatur terpusat lewat `src/lib/images.ts` — itu satu-satunya file kode yang tahu
nama file di sini, supaya ganti gambar cukup di folder ini, bukan berburu di banyak file data/komponen.

## Struktur folder

| Folder | Dipakai di | Isi |
|---|---|---|
| `home/` | Beranda (`Hero`, `IntroBlock`, `WhyPala`, `CtaBand`, `EcosystemDiagram`) | Foto hero, 3 foto pengantar, foto petani, foto hutan CTA, 3 foto ekosistem (KWT/SPI/TOGA Corner) |
| `products/` | Katalog, detail produk, kartu produk di Beranda | 2 foto per produk — nama file `<slug-produk>-1.svg` / `-2.svg` (slug dari `src/data/products.ts`) |
| `program/` | Halaman Program, kartu pilar di Beranda | 1 foto per pilar (`screening`/`cultivation`/`production`/`economy`/`monitoring`) + 6 foto galeri |
| `kebun/` | Halaman Kebun & detail lahan | Foto petani (`farmer-<id>.svg`) & foto lahan (`plot-<id>.svg`) — id dari `src/data/farmers.ts` / `plots.ts` |
| `articles/` | Artikel/Kabar | 1 foto per artikel — nama file `<slug-artikel>.svg` (slug dari `src/data/articles.ts`) |
| `contact/` | Halaman Kontak | Foto banner hero |
| `shared/` | Footer (semua halaman), meta `og:image` default | Foto latar footer, gambar share default |

## Cara mengganti gambar

1. Buka folder yang sesuai di tabel atas.
2. Timpa file placeholder `.svg` dengan foto asli, **pakai nama file yang sama** (mis. `hero.svg`
   tetap bernama `hero.svg`) — dengan begitu tidak ada baris kode yang perlu diubah sama sekali.
3. Kalau foto asli formatnya `.jpg`/`.webp` (disarankan — lihat catatan format di bawah), simpan
   dengan ekstensi itu, lalu ganti ekstensi pada baris terkait di `src/lib/images.ts` (satu-satunya
   kondisi yang perlu sentuh kode).
4. Untuk produk/petani/lahan/artikel baru: tambahkan file dengan pola nama yang sama (`<slug>-1.svg`,
   `farmer-f-05.svg`, dst.) — fungsi helper di `src/lib/images.ts` (`productImages`, `farmerPhoto`,
   `plotPhoto`, `articleImage`) otomatis mengarah ke situ selama `slug`/`id` datanya cocok.

## Format & ukuran yang disarankan

Semua file saat ini adalah **placeholder SVG buatan otomatis** (kotak abu-abu + label ukuran) —
belum ada foto asli. Saat mengganti, pakai `.jpg` (foto biasa) atau `.webp` (lebih ringan, disukai
untuk performa) — bukan `.svg` (itu format vektor, tidak cocok untuk foto). Ukuran yang disarankan
mengikuti ukuran placeholder yang sudah dibuat (rasio aspek harus sama; resolusi asli boleh lebih
tinggi, tapi jangan lebih rendah):

- `products/*` — persegi, 1000×1000
- `home/hero.svg` — 2000×1400 (lebar, foto latar penuh)
- `home/intro-*.svg` — potret, 700×875
- `home/why-farmer.svg` — potret, 900×1000
- `home/cta-forest.svg` — lebar, 1800×1000
- `home/ecosystem-*.svg` — 900×700
- `program/screening..monitoring.svg` — potret, 1000×1250
- `program/gallery-*.svg` — campuran 700×875 (potret) dan 700×525 (lanskap)
- `kebun/farmer-*.svg` — potret, 600×750
- `kebun/plot-*.svg` — lanskap, 900×675
- `articles/*.svg` — lanskap, 900×650
- `contact/hero.svg` — lebar, 1800×1000
- `shared/footer-bg.svg` — lebar, 1800×900
- `shared/og-default.svg` — 1200×630 (rasio standar Open Graph)

Semua gambar di sini adalah **data contoh/placeholder** (lihat catatan serupa di `src/data/*.ts`) —
WAJIB diganti dengan foto asli sebelum situs live.
