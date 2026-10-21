// Registry gambar situs — SATU tempat untuk semua path gambar publik.
//
// Semua file ada di `public/images/<page>/...`, dikelompokkan per halaman supaya gampang
// dicari: mau ganti foto Beranda? buka `public/images/home/`. Mau ganti foto kebun/petani?
// buka `public/images/kebun/`. Dst.
//
// CARA GANTI GAMBAR (tanpa sentuh kode):
//   1. Buka folder `public/images/<page>/` yang sesuai.
//   2. Timpa file dengan foto asli — pertahankan NAMA FILE yang sama (mis. `hero.webp` tetap
//      `hero.webp`) supaya baris di file ini tidak perlu diubah.
//   3. Kalau foto asli formatnya beda (mis. .jpg/.png, bukan .webp), ganti ekstensi pada baris
//      terkait di bawah — itu satu-satunya kondisi yang perlu edit kode. Disarankan tetap pakai
//      .webp (convert dulu) supaya situs tetap ringan — lihat public/images/README.md.
//
// Foto saat ini: diambil dari Unsplash (lisensi bebas pakai komersial, tanpa atribusi wajib)
// sebagai placeholder sementara — relevan secara tema (pala, jahe, kunyit, sereh, kebun,
// petani, dst.) tapi BUKAN foto asli produk/petani Omah Pala. Wajib diganti foto asli
// sebelum rilis sungguhan — lihat `public/images/README.md`.

const base = (p: string) => `/images/${p}`

export const homeImages = {
  hero: base('home/hero.webp'),
  intro: [base('home/intro-1.webp'), base('home/intro-2.webp'), base('home/intro-3.webp')],
  whyFarmer: base('home/why-farmer.webp'),
  ctaForest: base('home/cta-forest.webp'),
  ecosystemKwt: base('home/ecosystem-kwt.webp'),
  ecosystemSpi: base('home/ecosystem-spi.webp'),
  ecosystemTogaCorner: base('home/ecosystem-toga-corner.webp'),
}

export const contactImages = {
  hero: base('contact/hero.webp'),
}

/** Foto banner header halaman publik (PageBanner). Kebun memakai homeImages.ctaForest. */
export const bannerImages = {
  catalog: base('products/banner.webp'),
  program: base('program/banner.webp'),
  kebun: homeImages.ctaForest,
  polo: base('polo/banner.webp'),
}

export const sharedImages = {
  footerBg: base('shared/footer-bg.webp'),
  ogDefault: base('shared/og-default.webp'),
}

export const programImages = {
  screening: base('program/screening.webp'),
  cultivation: base('program/cultivation.webp'),
  production: base('program/production.webp'),
  economy: base('program/economy.webp'),
  monitoring: base('program/monitoring.webp'),
  gallery: [1, 2, 3, 4, 5, 6].map((i) => base(`program/gallery-${i}.webp`)),
}

/** Dua foto produk (katalog + detail) — nama file mengikuti `slug` produk di data/products.ts.
 * `ext` default `webp`; dipakai `png` untuk foto yang belum dikonversi (lihat public/images/README.md). */
export function productImages(slug: string, ext: 'webp' | 'png' = 'webp'): [string, string] {
  return [base(`products/${slug}-1.${ext}`), base(`products/${slug}-2.${ext}`)]
}

/** Foto petani — nama file mengikuti `id` di data/farmers.ts (mis. `f-01`). */
export function farmerPhoto(id: string): string {
  return base(`kebun/farmer-${id}.webp`)
}

/** Foto lahan — nama file mengikuti `id` di data/plots.ts (mis. `p-01`). */
export function plotPhoto(id: string): string {
  return base(`kebun/plot-${id}.webp`)
}

/** Foto artikel — nama file mengikuti `slug` di data/articles.ts. */
export function articleImage(slug: string): string {
  return base(`articles/${slug}.webp`)
}
