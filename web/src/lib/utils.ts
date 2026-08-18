import { clsx, type ClassValue } from 'clsx'
import { commoditiesSeed } from '@/data/commodities'
import type { CommodityId, Locale } from '@/types'

/** Gabungkan class name kondisional. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs)
}

/** Nama tampilan komoditas sesuai locale aktif — fallback ke id kalau tidak terdaftar. */
export function commodityLabel(id: CommodityId, locale: Locale): string {
  const commodity = commoditiesSeed.find((c) => c.id === id)
  if (!commodity) return id
  return locale === 'id' ? commodity.nameId : commodity.nameEn
}

export function formatIdr(value: number | null): string {
  if (value === null) return '—'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatUsd(value: number | null): string {
  if (value === null) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function formatDate(iso: string, locale: 'id' | 'en'): string {
  return new Date(iso).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export const WHATSAPP_NUMBER = '6281234567890'

export function waLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}
