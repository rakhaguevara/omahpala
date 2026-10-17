import { ROUTES } from '../config'

// Token dibuat server dari 18 byte acak → 24 karakter base64url. Rentang 16–128 menolak sampah
// dan teks panjang sebelum sampai ke server; keabsahan sebenarnya tetap diputuskan server.
const TOKEN_RE = /^[A-Za-z0-9_-]{16,128}$/
const QR_PATH_RE = /\/find-my-polo\/q\/([^/?#]+)\/?$/

/**
 * Ambil token dari hasil decode QR: bisa berupa URL (https://…/find-my-polo/q/<token>) atau token
 * polos (dari kolom tempel manual). Mengembalikan null untuk QR milik pihak lain.
 */
export function extractQrToken(raw: string): string | null {
  const text = raw.trim()
  if (!text || text.length > 2048) return null

  if (/^https?:\/\//i.test(text)) {
    let pathname: string
    try {
      pathname = new URL(text).pathname
    } catch {
      return null
    }
    const m = QR_PATH_RE.exec(pathname)
    if (!m) return null
    let token: string
    try {
      token = decodeURIComponent(m[1])
    } catch {
      return null
    }
    return TOKEN_RE.test(token) ? token : null
  }

  return TOKEN_RE.test(text) ? text : null
}

/** URL yang dicetak ke QR fisik. */
export function buildQrUrl(origin: string, token: string): string {
  return `${origin.replace(/\/$/, '')}${ROUTES.qr(token)}`
}
