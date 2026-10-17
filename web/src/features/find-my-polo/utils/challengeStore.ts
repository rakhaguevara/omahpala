import { STORAGE_KEYS } from '../config'
import type { PendingChallenge } from '../types'

// Hanya id & parameter challenge (bukan rahasia) disimpan di sessionStorage supaya bar challenge
// bisa pulih setelah refresh. Kebenaran status challenge tetap di server.

export function saveChallenge(c: PendingChallenge) {
  try {
    sessionStorage.setItem(STORAGE_KEYS.challenge, JSON.stringify(c))
  } catch {
    /* penyimpanan diblokir — bar tetap jalan selama halaman tidak di-refresh */
  }
}

export function readChallenge(): PendingChallenge | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.challenge)
    if (!raw) return null
    const c = JSON.parse(raw) as Partial<PendingChallenge>
    if (
      typeof c.id !== 'string' ||
      typeof c.destination_path !== 'string' ||
      !c.destination_path.startsWith('/') ||
      c.destination_path.startsWith('//') ||
      typeof c.min_seconds !== 'number' ||
      typeof c.min_scroll_px !== 'number' ||
      typeof c.min_scroll_events !== 'number'
    ) {
      return null
    }
    return c as PendingChallenge
  } catch {
    return null
  }
}

export function clearChallenge() {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.challenge)
  } catch {
    /* abaikan */
  }
}

/** Samakan "/produk/" dan "/produk" saat membandingkan path. */
export function samePath(a: string, b: string) {
  const norm = (p: string) => (p.length > 1 ? p.replace(/\/+$/, '') : p)
  return norm(a) === norm(b)
}
