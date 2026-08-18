import type { PageContentEntry } from '@/types'

// Konten yang bisa diubah admin tanpa deploy ulang — PRD §7.6 A-07.
// Dipakai di Beranda (hero + CTA penutup). Beda dari string UI tetap (nav, label tombol dsb.)
// yang tinggal di src/i18n/locales — itu bagian dari "kode", ini bagian dari "konten".
export const pageContentSeed: PageContentEntry[] = [
  {
    // Persis UX-WRITING.md §8 "Beranda › Hero"
    key: 'hero.eyebrow',
    valueId: 'PPK ORMAWA HIMFA UII · 2026',
    valueEn: 'PPK ORMAWA HIMFA UII · 2026',
  },
  {
    key: 'hero.title',
    valueId: 'Sehat dari pekarangan, kuat dari pala.',
    valueEn: 'Healthy from the yard, strong from nutmeg.',
  },
  {
    key: 'hero.subtitle',
    valueId:
      'TOGA BERDAYA adalah program lima bulan di Desa Wonokerto, Turi, Sleman. Warga menanam tanaman obat keluarga di pekarangan, dan mengolah daging buah pala yang selama ini dibuang menjadi produk bernilai jual — dijual lewat Omah Pala.',
    valueEn:
      'In Wonokerto village, Yogyakarta, farmers harvest nutmeg for its seed and discard the fruit. TOGA BERDAYA turns that fruit into tea, syrup, and confectionery — produced by the villagers who grow it, and sold under Omah Pala.',
  },
  {
    // §8 "CTA penutup" — labelnya jadi teks tombol di CtaBand
    key: 'cta.title',
    valueId: 'Dukung produksi warga Wonokerto',
    valueEn: 'Support Wonokerto producers',
  },
  {
    key: 'cta.subtitle',
    valueId:
      'Terbuka untuk kerja sama distribusi, pembelian dalam jumlah besar, dan kemitraan program.',
    valueEn: 'Open to distribution partnerships, bulk orders, and program collaboration.',
  },
  {
    key: 'why.title',
    valueId: 'Bisa dilacak sampai ke lahannya',
    valueEn: 'Traceable back to the plot',
  },
  {
    key: 'why.body',
    valueId:
      'Setiap produk Omah Pala tertaut ke kode petak lahan dan nama penanamnya. Bukan klaim pemasaran — ini konsekuensi dari program TOGA BERDAYA yang mencatat setiap tahap, dari bibit sampai kemasan.',
    valueEn:
      'Every Omah Pala product is linked to a plot code and its grower. Not a marketing claim — it’s a direct result of the TOGA BERDAYA program recording every stage, from seedling to packaging.',
  },
]
