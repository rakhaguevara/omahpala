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

/** Nama bulan singkat (Jan, Feb, …) sesuai locale — dipakai di kalender tanam/panen lahan. */
export function monthShort(month: number, locale: 'id' | 'en'): string {
  return new Date(2024, month - 1, 1).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', {
    month: 'short',
  })
}

/** Estimasi lama baca dari jumlah kata konten, dibulatkan ke menit terdekat (min. 1). */
export function estimateReadMinutes(paragraphs: string[]): number {
  const words = paragraphs.reduce((total, p) => total + p.trim().split(/\s+/).filter(Boolean).length, 0)
  return Math.max(1, Math.round(words / 200))
}

/**
 * Foto lahan dummy dibuat sebagai SVG lokal (data URI), bukan lewat network — dipakai sebagai
 * fallback `onError` saat foto asli (picsum atau upload admin) gagal dimuat, supaya kartu lahan
 * tidak pernah menampilkan ikon gambar rusak. Bentuknya deterministik dari `seed` (id lahan) jadi
 * tiap lahan tetap dapat variasi warna yang konsisten antar render.
 */
export function plotPlaceholder(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  const bg = ['#EAF7E4', '#F2F7EC', '#EAF2E2'][hash % 3]
  const rows = Array.from({ length: 5 }, (_, i) => {
    const y = 40 + i * 46
    const bow = 14 + (hash >> i) % 12
    return `<path d="M-20 ${y} Q 200 ${y - bow} 420 ${y}" stroke="#7EEA57" stroke-opacity="0.32" stroke-width="10" fill="none" stroke-linecap="round" />`
  }).join('')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
    <rect width="400" height="300" fill="${bg}" />
    ${rows}
    <path d="M160 190 C 160 140 210 120 240 120 C 240 160 210 190 160 190 Z" fill="#212121" fill-opacity="0.12" />
    <path d="M160 190 C 180 170 210 150 240 120" stroke="#212121" stroke-opacity="0.18" stroke-width="4" fill="none" stroke-linecap="round" />
  </svg>`
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

export const WHATSAPP_NUMBER = '6281234567890'

export function waLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}
