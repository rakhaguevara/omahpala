import { useCollection } from './useCollection'
import { productsSeed } from '@/data/products'
import { plotsSeed } from '@/data/plots'
import { farmersSeed } from '@/data/farmers'
import type { Farmer, Inquiry, Plot, Product } from '@/types'

// v3 — dinaikkan lagi karena path foto produk berubah total (picsum -> svg -> jpg -> webp).
// Browser yang sudah pernah membuka situs sebelum perubahan ini masih menyimpan path lama di
// localStorage dan akan menampilkan ikon gambar rusak sampai key-nya dinaikkan. Naikkan lagi
// ("_v4", dst.) tiap kali seed produk berubah signifikan dan perlu langsung terlihat di browser
// yang sudah pernah membuka situs.
export const PRODUCTS_KEY = 'omahpala_products_v3'
// v3 — path foto lahan ikut berubah total (svg -> jpg -> webp), sama seperti produk di atas.
export const PLOTS_KEY = 'omahpala_plots_v3'
// v2 — sebelumnya tidak pernah dinaikkan sejak awal, padahal path foto petani sudah berubah
// beberapa kali (svg -> jpg -> webp) — ditambahkan versi supaya ikut ter-refresh otomatis.
export const FARMERS_KEY = 'omahpala_farmers_v2'
export const INQUIRIES_KEY = 'omahpala_inquiries'

export function useProducts() {
  return useCollection<Product>(PRODUCTS_KEY, productsSeed)
}

export function usePlots() {
  return useCollection<Plot>(PLOTS_KEY, plotsSeed)
}

export function useFarmers() {
  return useCollection<Farmer>(FARMERS_KEY, farmersSeed)
}

export function useInquiries() {
  return useCollection<Inquiry>(INQUIRIES_KEY, [])
}
