import { useCollection } from './useCollection'
import { productsSeed } from '@/data/products'
import { plotsSeed } from '@/data/plots'
import { farmersSeed } from '@/data/farmers'
import type { Farmer, Inquiry, Plot, Product } from '@/types'

export const PRODUCTS_KEY = 'omahpala_products'
export const PLOTS_KEY = 'omahpala_plots'
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
