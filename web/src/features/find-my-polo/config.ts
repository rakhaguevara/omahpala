// Konfigurasi Find My Polo yang aman dipublikasikan. Aturan permainan (jumlah QR, ambang stamp,
// durasi challenge) TIDAK ada di sini — itu hidup di database (game_events.config) dan diputuskan server.

export const EVENT_SLUG = 'find-my-polo'

export const ROUTES = {
  home: '/find-my-polo',
  scan: '/find-my-polo/scan',
  qr: (token: string) => `/find-my-polo/q/${encodeURIComponent(token)}`,
  admin: '/admin/find-my-polo',
} as const

/**
 * Aset visual. SEMUA gambar di sini DUMMY — ganti dengan artwork resmi OmahPala dengan mengubah
 * path di bawah (atau menimpa file di public/find-my-polo/ dengan nama yang sama).
 */
export const ASSETS = {
  /** Gambar stempel untuk QR bernomor `label` (QR stempel 1–3 → stempel1–3.svg; di luar itu berulang). */
  stamp: (label: number) => `/find-my-polo/stempel${(((label - 1) % 4) + 4) % 4 + 1}.svg`,
  /** Stiker digital yang terbuka pada ambang sticker_unlock_at. */
  digitalSticker: '/find-my-polo/sticker-dummy.svg',
  /** Pop-up saat QR bukan target pemain (tanpa stamp). */
  miss: '/find-my-polo/miss-dummy.svg',
} as const

/** Tipe hadiah yang dikenal UI; harus sama dengan kunci config.rewards di database. */
export const REWARD_TYPES = ['small_gift', 'sticker'] as const

/** Kunci sessionStorage/localStorage. Tidak ada rahasia di sini: hanya id challenge & preferensi suara. */
export const STORAGE_KEYS = {
  challenge: 'omahpala_polo_challenge',
  muted: 'omahpala_polo_muted',
} as const
