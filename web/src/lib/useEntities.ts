import { useCollection } from './useCollection'
import { productsSeed } from '@/data/products'
import { plotsSeed } from '@/data/plots'
import { farmersSeed } from '@/data/farmers'
import type { Farmer, Inquiry, Plot, Product } from '@/types'

// v2 — dinaikkan supaya localStorage browser lama yang masih menyimpan data produk sebelum
// penambahan produk unggulan ke-4 (isFeatured prd-09) ikut menyegarkan diri otomatis, tanpa
// perlu clear localStorage manual. Naikkan lagi ("_v3", dst.) tiap kali seed produk berubah
// signifikan dan perubahan itu perlu langsung terlihat di browser yang sudah pernah membuka situs.
export const PRODUCTS_KEY = 'omahpala_products_v2'
// v2 — lahan pindah dari farmerId tunggal ke farmerIds[], plus tambahan descriptionId/En &
// calendar. localStorage lama yang masih pakai bentuk sebelumnya akan bikin field baru undefined
// dan meng-crash halaman (layar putih tanpa error terlihat) kalau key-nya tidak dinaikkan.
export const PLOTS_KEY = 'omahpala_plots_v2'
export const FARMERS_KEY = 'omahpala_farmers'
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
