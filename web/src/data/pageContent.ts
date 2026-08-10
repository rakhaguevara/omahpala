import type { PageContentEntry } from '@/types'

// Konten yang bisa diubah admin tanpa deploy ulang — PRD §7.6 A-07.
// Dipakai di Beranda (hero + CTA penutup). Beda dari string UI tetap (nav, label tombol dsb.)
// yang tinggal di src/i18n/locales — itu bagian dari "kode", ini bagian dari "konten".
export const pageContentSeed: PageContentEntry[] = [
  {
    key: 'hero.eyebrow',
    valueId: 'DESA SEHAT BERBASIS TOGA — WONOKERTO, SLEMAN',
    valueEn: 'TOGA-BASED HEALTHY VILLAGE — WONOKERTO, SLEMAN',
  },
  {
    key: 'hero.title',
    valueId: 'Pala Wonokerto, diolah warga, dipercaya dunia.',
    valueEn: 'Wonokerto nutmeg, processed by residents, trusted worldwide.',
  },
  {
    key: 'hero.subtitle',
    valueId:
      'Omah Pala menjual produk turunan pala asli Desa Wonokerto — hasil program PPKO HIMFA UII "Desa Sehat Berbasis TOGA" yang menyatukan kesehatan warga dan pemberdayaan ekonomi.',
    valueEn:
      'Omah Pala sells genuine nutmeg-derived products from Desa Wonokerto — the result of PPKO HIMFA UII’s "TOGA-Based Healthy Village" program uniting community health and economic empowerment.',
  },
  {
    key: 'cta.title',
    valueId: 'Siap jadi mitra distribusi pala Wonokerto?',
    valueEn: 'Ready to become a Wonokerto nutmeg distribution partner?',
  },
  {
    key: 'cta.subtitle',
    valueId:
      'Kirim inquiry ekspor Anda, tim kami balas dengan spesifikasi lengkap dan sampel dalam 2×24 jam.',
    valueEn: 'Send your export inquiry — our team replies with full specs and samples within 48 hours.',
  },
  {
    key: 'why.title',
    valueId: 'Mengapa pala Wonokerto?',
    valueEn: 'Why Wonokerto nutmeg?',
  },
  {
    key: 'why.body',
    valueId:
      'Setiap produk yang kami jual bisa dilacak sampai ke petak lahan dan nama penanamnya. Bukan klaim pemasaran — ini konsekuensi dari program pendampingan yang mencatat setiap tahap, dari bibit sampai kemasan.',
    valueEn:
      'Every product we sell can be traced back to the exact plot and grower. Not a marketing claim — it’s a direct result of a mentorship program that records every stage, from seedling to packaging.',
  },
]
