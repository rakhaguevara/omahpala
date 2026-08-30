// Registry gambar situs — SATU tempat untuk semua path gambar publik.
//
// Semua file ada di `public/images/<page>/...`, dikelompokkan per halaman supaya gampang
// dicari: mau ganti foto Beranda? buka `public/images/home/`. Mau ganti foto kebun/petani?
// buka `public/images/kebun/`. Dst.
//
// CARA GANTI GAMBAR (tanpa sentuh kode):
//   1. Buka folder `public/images/<page>/` yang sesuai.
//   2. Timpa file placeholder (.svg) dengan foto asli — pertahankan NAMA FILE yang sama
//      (mis. `hero.svg` tetap `hero.svg`) supaya baris di file ini tidak perlu diubah.
//   3. Kalau foto asli formatnya .jpg/.webp (disarankan, bukan .svg), ganti ekstensi pada
//      baris terkait di bawah — itu satu-satunya kondisi yang perlu edit kode.
//
// Semua path saat ini masih placeholder (dibuat otomatis, bukan foto asli) — lihat
// `public/images/README.md` untuk ukuran & format yang disarankan per gambar.

const base = (p: string) => `/images/${p}`

export const homeImages = {
  hero: base('home/hero.jpg'),
  intro: [base('home/intro-1.svg'), base('home/intro-2.svg'), base('home/intro-3.svg')],
  whyFarmer: base('home/why-farmer.svg'),
  ctaForest: base('home/cta-forest.svg'),
  ecosystemKwt: base('home/ecosystem-kwt.svg'),
  ecosystemSpi: base('home/ecosystem-spi.svg'),
  ecosystemTogaCorner: base('home/ecosystem-toga-corner.svg'),
}

export const contactImages = {
  hero: base('contact/hero.svg'),
}

export const sharedImages = {
  footerBg: base('shared/footer-bg.jpg'),
  ogDefault: base('shared/og-default.svg'),
}

export const programImages = {
  screening: base('program/screening.svg'),
  cultivation: base('program/cultivation.svg'),
  production: base('program/production.svg'),
  economy: base('program/economy.svg'),
  monitoring: base('program/monitoring.svg'),
  gallery: [1, 2, 3, 4, 5, 6].map((i) => base(`program/gallery-${i}.svg`)),
}

/** Dua foto produk (katalog + detail) — nama file mengikuti `slug` produk di data/products.ts. */
export function productImages(slug: string): [string, string] {
  return [base(`products/${slug}-1.svg`), base(`products/${slug}-2.svg`)]
}

/** Foto petani — nama file mengikuti `id` di data/farmers.ts (mis. `f-01`). */
export function farmerPhoto(id: string): string {
  return base(`kebun/farmer-${id}.svg`)
}

/** Foto lahan — nama file mengikuti `id` di data/plots.ts (mis. `p-01`). */
export function plotPhoto(id: string): string {
  return base(`kebun/plot-${id}.svg`)
}

/** Foto artikel — nama file mengikuti `slug` di data/articles.ts. */
export function articleImage(slug: string): string {
  return base(`articles/${slug}.svg`)
}
