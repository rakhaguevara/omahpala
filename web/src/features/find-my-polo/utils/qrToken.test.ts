import { describe, expect, it } from 'vitest'
import { buildQrUrl, extractQrToken } from './qrToken'

const TOKEN = 'Abcdefghijklmnop_-1234567'

describe('extractQrToken', () => {
  it('mengambil token dari URL QR', () => {
    expect(extractQrToken(`https://omahpala.id/find-my-polo/q/${TOKEN}`)).toBe(TOKEN)
    expect(extractQrToken(`http://localhost:5173/find-my-polo/q/${TOKEN}/`)).toBe(TOKEN)
    expect(extractQrToken(`  https://x.test/find-my-polo/q/${TOKEN}?utm=1#a  `)).toBe(TOKEN)
  })

  it('menerima token polos (tempel manual)', () => {
    expect(extractQrToken(TOKEN)).toBe(TOKEN)
    expect(extractQrToken(`  ${TOKEN}\n`)).toBe(TOKEN)
  })

  it('menolak QR milik pihak lain, token pendek/panjang, dan karakter ilegal', () => {
    expect(extractQrToken('https://example.com/menu/42')).toBeNull()
    expect(extractQrToken('WIFI:S:foo;T:WPA;P:bar;;')).toBeNull()
    expect(extractQrToken('')).toBeNull()
    expect(extractQrToken('short')).toBeNull()
    expect(extractQrToken('a'.repeat(129))).toBeNull()
    expect(extractQrToken('a'.repeat(3000))).toBeNull()
    expect(extractQrToken(`https://x.test/find-my-polo/q/${TOKEN}/extra`)).toBeNull()
    expect(extractQrToken('https://x.test/find-my-polo/q/has space here!!!!')).toBeNull()
    expect(extractQrToken('https://x.test/find-my-polo/q/%E0%A4%A')).toBeNull()
    expect(extractQrToken('javascript:alert(1)')).toBeNull()
  })
})

describe('buildQrUrl', () => {
  it('membentuk URL yang bisa dibaca balik', () => {
    const url = buildQrUrl('https://omahpala.id/', TOKEN)
    expect(url).toBe(`https://omahpala.id/find-my-polo/q/${TOKEN}`)
    expect(extractQrToken(url)).toBe(TOKEN)
  })
})
