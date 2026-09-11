import { useCollection } from './useCollection'
import { productsSeed } from '@/data/products'
import { plotsSeed } from '@/data/plots'
import { farmersSeed } from '@/data/farmers'
import type { Farmer, Inquiry, Plot, Product } from '@/types'

// v4 — katalog diganti total dari 24 produk demo multi-komoditas jadi 6 produk teh/wedang asli
// (id prd-01..06 dipakai ulang tapi isinya beda total). Browser yang sudah pernah membuka situs
// sebelumnya masih menyimpan data lama di localStorage dengan id yang sama, jadi tanpa menaikkan
// versi key ini datanya tidak akan ter-refresh (loadFromLocalStorage cuma upsert id baru, tidak
// menimpa id yang sudah ada). Naikkan lagi ("_v5", dst.) tiap kali seed produk berubah signifikan.
export const PRODUCTS_KEY = 'omahpala_products_v4'
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
