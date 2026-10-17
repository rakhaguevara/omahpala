export interface Evidence {
  visibleMs: number
  scrollPx: number
  scrollEvents: number
}

/**
 * Mengukur "bukti" scroll challenge di browser: waktu halaman benar-benar terlihat, jarak scroll,
 * dan jumlah gerakan scroll. Murni logika (tanpa DOM) supaya bisa dites.
 *
 * Catatan keamanan: angka ini dilaporkan klien dan bisa dipalsukan oleh pengguna yang mengendalikan
 * browser. Server hanya memakainya sebagai syarat tambahan; jam server dan pembatasan sekali-pakai
 * yang menjadi penjaga sebenarnya. Ini mekanisme engagement, bukan bukti membaca.
 */
export class ScrollEvidenceTracker {
  private visibleMs = 0
  private scrollPx = 0
  private scrollEvents = 0
  private lastY: number | null = null
  private lastTick: number | null = null

  private readonly minMs: number
  private readonly minPx: number
  private readonly minEvents: number

  constructor(minMs: number, minPx: number, minEvents: number) {
    this.minMs = minMs
    this.minPx = minPx
    this.minEvents = minEvents
  }

  start(now: number, scrollY: number) {
    this.visibleMs = 0
    this.scrollPx = 0
    this.scrollEvents = 0
    this.lastTick = now
    this.lastY = scrollY
  }

  /** Dipanggil berkala. Selisih waktu dibatasi 1 dtk agar tab yang di-throttle tidak "mengumpulkan" waktu. */
  tick(now: number, pageVisible: boolean) {
    if (this.lastTick === null) return
    if (pageVisible) this.visibleMs += Math.min(Math.max(now - this.lastTick, 0), 1000)
    this.lastTick = now
  }

  /** Hanya dihitung saat halaman terlihat; gerakan < 1px diabaikan. */
  scroll(y: number, pageVisible: boolean) {
    if (this.lastY === null) return
    const delta = Math.abs(y - this.lastY)
    this.lastY = y
    if (!pageVisible || delta < 1) return
    this.scrollPx += delta
    this.scrollEvents += 1
  }

  snapshot(): Evidence {
    return { visibleMs: this.visibleMs, scrollPx: this.scrollPx, scrollEvents: this.scrollEvents }
  }

  progress() {
    const time = Math.min(this.visibleMs / this.minMs, 1)
    const scroll = Math.min(this.scrollPx / this.minPx, 1)
    const eventsOk = this.scrollEvents >= this.minEvents
    return { time, scroll, done: time >= 1 && scroll >= 1 && eventsOk }
  }
}
