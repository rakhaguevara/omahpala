import type { Product } from '@/types'

// Data contoh — harga, MOQ, dan sertifikasi WAJIB diverifikasi tim sebelum situs live.
// Jangan tampilkan sertifikasi yang belum terbit (PRD §12 risiko).
//
// PENTING (UX-WRITING.md §1, §4.1, §7): hanya 3 produk di sini, persis jumlah target proposal
// PPK Ormawa HIMFA 2026 ("3 produk olahan daging buah pala" — lihat programStats di data/program.ts).
// Versi sebelumnya berisi 6 produk; 3 di antaranya (manisan, minyak atsiri, bubuk pala) dikarang
// untuk membuat katalog terlihat penuh — itu melanggar aturan "jangan mengarang isi" di dokumen
// UX writing. Kalau produk itu memang nyata, tambahkan lagi setelah dikonfirmasi tim, dan
// sesuaikan angka target di programStats.
//
// Deskripsi & fakta kemasan mengikuti copy deck UX-WRITING.md §8 "Produk" persis. Tidak ada klaim
// kesehatan (nama penyakit / fungsi organ) di sini — itu dilarang tegas untuk halaman produk.
//
// shopeeUrl: BELUM ADA TOKO SHOPEE ASLI. Sementara mengarah ke halaman pencarian nama produk di
// Shopee (bukan listing tertentu) supaya tombolnya tidak 404 — WAJIB diganti dengan link toko/listing
// asli sebelum situs live.
export const productsSeed: Product[] = [
  {
    id: 'prd-01',
    slug: 'gummy-daging-buah-pala',
    nameId: 'Gummy Daging Buah Pala',
    nameEn: 'Nutmeg Fruit Gummy',
    category: 'pangan',
    descriptionId: 'Permen kenyal dari daging buah pala, manis dengan sisa rasa hangat khas rempah.',
    descriptionEn: 'Chewy candy made from nutmeg fruit, sweet with a lingering warm spice finish.',
    composition: ['Sari daging buah pala', 'Gula aren', 'Gelatin', 'Asam sitrat alami'],
    netWeight: '60 g / pouch (isi 12 butir)',
    packaging: 'Pouch resealable, karton isi 24 pouch. Diproduksi di TOGA Corner, Desa Wonokerto.',
    shelfLife: '12 bulan pada suhu ruang',
    priceIdr: 18000,
    priceUsd: 1.3,
    moq: '500 pouch (1 karton kecil)',
    monthlyCapacity: '8.000 pouch/bulan',
    hsCode: '2006.00',
    incoterms: ['FOB', 'CIF'],
    originPort: 'Pelabuhan Tanjung Emas, Semarang',
    certifications: [
      { name: 'PIRT', status: 'terbit' },
      { name: 'Halal', status: 'dalam-proses' },
    ],
    images: [
      'https://picsum.photos/seed/omahpala-gummy-1/1000/1000',
      'https://picsum.photos/seed/omahpala-gummy-2/1000/1000',
    ],
    shopeeUrl: 'https://shopee.co.id/search?keyword=gummy%20daging%20buah%20pala',
    plotId: 'p-01',
    isFeatured: true,
    isActive: true,
    createdAt: '2024-01-10',
  },
  {
    id: 'prd-02',
    slug: 'teh-daging-buah-pala',
    nameId: 'Teh Daging Buah Pala',
    nameEn: 'Nutmeg Fruit Tea',
    category: 'minuman',
    descriptionId: 'Seduhan hangat dari daging buah pala yang dikeringkan. Rasanya asam segar dengan sisa hangat rempah.',
    descriptionEn: 'A warm brew made from dried nutmeg fruit flesh. Bright, tangy taste with a lingering spice warmth.',
    composition: ['Irisan daging buah pala kering 100%'],
    netWeight: '20 g / box (isi 10 kantong)',
    packaging: 'Kantong kertas, box karton. Diproduksi di TOGA Corner, Desa Wonokerto.',
    shelfLife: '18 bulan pada suhu ruang, kering',
    priceIdr: 25000,
    priceUsd: 1.8,
    moq: '300 box',
    monthlyCapacity: '3.000 box/bulan',
    hsCode: '0909.31',
    incoterms: ['FOB', 'CIF', 'EXW'],
    originPort: 'Pelabuhan Tanjung Emas, Semarang',
    certifications: [
      { name: 'PIRT', status: 'terbit' },
      { name: 'Organik', status: 'dalam-proses' },
    ],
    images: [
      'https://picsum.photos/seed/omahpala-tea-1/1000/1000',
      'https://picsum.photos/seed/omahpala-tea-2/1000/1000',
    ],
    shopeeUrl: 'https://shopee.co.id/search?keyword=teh%20daging%20buah%20pala',
    plotId: 'p-04',
    isFeatured: true,
    isActive: true,
    createdAt: '2024-02-05',
  },
  {
    id: 'prd-03',
    slug: 'sirup-daging-buah-pala',
    nameId: 'Sirup Daging Buah Pala',
    nameEn: 'Nutmeg Fruit Syrup',
    category: 'minuman',
    descriptionId: 'Sirup pekat dari daging buah pala segar. Encerkan dengan air dingin atau soda.',
    descriptionEn: 'Concentrated syrup from fresh nutmeg fruit. Dilute with cold water or soda.',
    composition: ['Sari daging buah pala', 'Gula tebu', 'Air'],
    netWeight: '330 ml / botol',
    packaging: 'Botol kaca, karton isi 12 botol. Diproduksi di TOGA Corner, Desa Wonokerto.',
    shelfLife: '9 bulan sebelum dibuka',
    priceIdr: 32000,
    priceUsd: 2.3,
    moq: '200 botol',
    monthlyCapacity: '2.500 botol/bulan',
    hsCode: '2106.90',
    incoterms: ['FOB', 'CIF'],
    originPort: 'Pelabuhan Tanjung Emas, Semarang',
    certifications: [{ name: 'PIRT', status: 'terbit' }],
    images: [
      'https://picsum.photos/seed/omahpala-syrup-1/1000/1000',
      'https://picsum.photos/seed/omahpala-syrup-2/1000/1000',
    ],
    shopeeUrl: 'https://shopee.co.id/search?keyword=sirup%20daging%20buah%20pala',
    plotId: 'p-02',
    isFeatured: true,
    isActive: true,
    createdAt: '2024-03-12',
  },
]
