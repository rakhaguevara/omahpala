import type { Commodity } from '@/types'

// Daftar komoditas TOGA yang ditampilkan sebagai section/filter di halaman Produk & Kebun.
// 'lainnya' menampung komoditas yang belum punya section sendiri.
export const commoditiesSeed: Commodity[] = [
  { id: 'pala', nameId: 'Pala', nameEn: 'Nutmeg' },
  { id: 'jahe', nameId: 'Jahe', nameEn: 'Ginger' },
  { id: 'kunyit', nameId: 'Kunyit', nameEn: 'Turmeric' },
  { id: 'sereh', nameId: 'Sereh', nameEn: 'Lemongrass' },
  { id: 'kencur', nameId: 'Kencur', nameEn: 'Aromatic Ginger' },
  { id: 'lainnya', nameId: 'Lainnya', nameEn: 'Other' },
]
