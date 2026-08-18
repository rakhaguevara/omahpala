// Model data — sumber: PRD.md §8
// Field *_id / *_en dipisah agar konten dwibahasa wajib diisi keduanya (lihat PRD §9 & §12 risiko).

export type Locale = 'id' | 'en'

export type ProductCategory = 'pangan' | 'minuman' | 'non-pangan'

export type Certification = 'PIRT' | 'Halal' | 'SNI' | 'Organik' | 'HACCP'

export interface CertificationStatus {
  name: Certification
  status: 'terbit' | 'dalam-proses'
}

export interface Product {
  id: string
  slug: string
  nameId: string
  nameEn: string
  category: ProductCategory
  descriptionId: string
  descriptionEn: string
  composition: string[]
  netWeight: string
  packaging: string
  shelfLife: string
  priceIdr: number | null
  priceUsd: number | null
  moq: string
  monthlyCapacity: string
  hsCode: string
  incoterms: string[]
  originPort: string
  certifications: CertificationStatus[]
  images: string[]
  /** Link toko Shopee produk ini — lihat catatan "Data contoh" di data/products.ts. */
  shopeeUrl: string
  plotId: string
  isFeatured: boolean
  isActive: boolean
  createdAt: string
}

export type PlotStatus = 'aktif' | 'panen' | 'istirahat'

export interface Plot {
  id: string
  code: string
  name: string
  areaM2: number
  commodities: string[]
  status: PlotStatus
  farmerId: string
  lat: number
  lng: number
}

export interface Farmer {
  id: string
  name: string
  role: string
  photo: string
  joinedAt: string
  plotIds: string[]
}

export type InquiryStatus = 'baru' | 'diproses' | 'selesai'

export interface Inquiry {
  id: string
  name: string
  company: string
  country: string
  email: string
  phone: string
  productId: string | null
  volume: string
  message: string
  locale: Locale
  status: InquiryStatus
  internalNote: string
  createdAt: string
  // honeypot — harus selalu kosong; kalau terisi, submission ditolak diam-diam
  website?: string
}

export interface PageContentEntry {
  key: string
  valueId: string
  valueEn: string
}

export type AdminRole = 'admin' | 'pengurus'

export interface AdminUser {
  id: string
  email: string
  name: string
  role: AdminRole
}

export interface ProgramPillar {
  id: string
  icon: 'screening' | 'cultivation' | 'production' | 'economy' | 'monitoring'
  titleId: string
  titleEn: string
  descriptionId: string
  descriptionEn: string
  pointsId: string[]
  pointsEn: string[]
  image: string
}

export interface ProgramMilestone {
  id: string
  date: string
  titleId: string
  titleEn: string
  descriptionId: string
  descriptionEn: string
  done: boolean
}

export interface Article {
  id: string
  slug: string
  titleId: string
  titleEn: string
  excerptId: string
  excerptEn: string
  /** Paragraf isi lengkap untuk halaman detail artikel. */
  contentId: string[]
  contentEn: string[]
  image: string
  categoryId: string
  categoryEn: string
  publishedAt: string
}

export interface StatItem {
  id: string
  /** Angka yang dianimasikan (CountUp). Untuk rentang seperti "40–70", ini angka atasnya (70). */
  value: number
  suffix: string
  /** Teks statis sebelum angka animasi, mis. "40–" untuk menampilkan rentang "40–70". */
  prefix?: string
  labelId: string
  labelEn: string
}
