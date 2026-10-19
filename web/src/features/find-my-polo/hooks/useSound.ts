import { useSyncExternalStore } from 'react'
import { STORAGE_KEYS } from '../config'

// Efek suara disintesis dengan Web Audio — tanpa berkas audio untuk diunduh atau diganti.
// Preferensi mute (non-sensitif) disimpan di localStorage; boleh gagal tanpa merusak apa pun.
//
// Catatan penting: browser (terutama iOS/Android) hanya mengizinkan audio berjalan SETELAH ada
// sentuhan pengguna. Hasil scan datang asinkron (bukan dari sentuhan), jadi AudioContext "dibuka"
// pada sentuhan pertama di halaman mana pun (lihat unlockAudio). Bunyi yang diminta sebelum itu
// ditahan sebentar dan dimainkan begitu audio terbuka.

function readMuted(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.muted) === '1'
  } catch {
    return false
  }
}

let muted = readMuted()
const listeners = new Set<() => void>()

export function setMuted(value: boolean) {
  muted = value
  try {
    localStorage.setItem(STORAGE_KEYS.muted, value ? '1' : '0')
  } catch {
    /* abaikan */
  }
  listeners.forEach((l) => l())
}

export function useMuted(): boolean {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => muted,
    () => false,
  )
}

let ctx: AudioContext | null = null
let master: GainNode | null = null

function getContext(): AudioContext | null {
  if (ctx) return ctx
  try {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
    master = ctx.createGain()
    master.gain.value = 0.9
    master.connect(ctx.destination)
  } catch {
    ctx = null
  }
  return ctx
}

/** Satu nada lonceng: dasar + dua parsial tak-harmonik yang meluruh, memberi bunyi "cling". */
function bell(freq: number, at: number, decay = 0.9, peak = 0.22) {
  if (!ctx || !master) return
  const t0 = ctx.currentTime + at
  const partials: [number, number, number][] = [
    [1, 1, 1],
    [2.76, 0.35, 0.55],
    [5.4, 0.12, 0.3],
  ]
  for (const [mult, amp, decayMult] of partials) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq * mult
    gain.gain.setValueAtTime(0.0001, t0)
    gain.gain.exponentialRampToValueAtTime(peak * amp, t0 + 0.006)
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + decay * decayMult)
    osc.connect(gain).connect(master)
    osc.start(t0)
    osc.stop(t0 + decay * decayMult + 0.05)
  }
}

/** Nada lembut tanpa parsial (klik, info, error). */
function tone(freq: number, at: number, length: number, type: OscillatorType = 'sine', peak = 0.12) {
  if (!ctx || !master) return
  const t0 = ctx.currentTime + at
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0.0001, t0)
  gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + length)
  osc.connect(gain).connect(master)
  osc.start(t0)
  osc.stop(t0 + length + 0.05)
}

export type SoundKind =
  | 'tap' //      sentuhan tombol utama
  | 'start' //    Start Hunting
  | 'stamp' //    stamp baru: cling
  | 'sticker' //  stiker digital terbuka: arpeggio + kilau
  | 'ding' //     tantangan scroll selesai
  | 'success' //  hadiah diklaim / ditukar
  | 'info' //     sudah ditemukan / QR tidak dikenali
  | 'error' //    gagal

const recipes: Record<SoundKind, () => void> = {
  tap: () => tone(660, 0, 0.09, 'triangle', 0.09),
  start: () => {
    bell(523.25, 0, 0.7)
    bell(659.25, 0.09, 0.7)
    bell(783.99, 0.18, 0.9)
  },
  stamp: () => {
    bell(1318.5, 0, 1.1, 0.26) // E6 — "cling"
    bell(1975.5, 0.09, 1.2, 0.2) // B6
    bell(2637, 0.2, 0.9, 0.1) // kilau
  },
  sticker: () => {
    ;[523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => bell(f, i * 0.1, 1.0, 0.22))
    bell(2093, 0.55, 1.4, 0.14)
    bell(2637, 0.65, 1.4, 0.1)
  },
  ding: () => {
    bell(987.77, 0, 1.0, 0.22)
    bell(1318.5, 0.12, 1.1, 0.2)
  },
  success: () => {
    bell(783.99, 0, 0.8)
    bell(987.77, 0.1, 0.8)
    bell(1174.66, 0.2, 1.1)
  },
  info: () => {
    tone(523.25, 0, 0.12, 'triangle', 0.1)
    tone(440, 0.12, 0.16, 'triangle', 0.08)
  },
  error: () => {
    tone(220, 0, 0.18, 'square', 0.05)
    tone(165, 0.16, 0.26, 'square', 0.05)
  },
}

let pending: { kind: SoundKind; at: number } | null = null
const PENDING_MAX_AGE_MS = 15_000

function playNow(kind: SoundKind) {
  try {
    recipes[kind]()
  } catch {
    /* audio tidak tersedia — fitur tetap berfungsi tanpa suara */
  }
}

/**
 * Membuka audio. Dipasang sekali pada sentuhan pertama (lihat bawah) dan juga dipanggil langsung
 * dari handler tombol. Memutar buffer kosong 1 sampel — trik wajib agar iOS Safari mau berbunyi.
 */
export function unlockAudio() {
  const c = getContext()
  if (!c) return
  const finish = () => {
    if (c.state !== 'running') return
    try {
      const src = c.createBufferSource()
      src.buffer = c.createBuffer(1, 1, 22050)
      src.connect(c.destination)
      src.start(0)
    } catch {
      /* abaikan */
    }
    removeUnlockListeners()
    if (pending && Date.now() - pending.at < PENDING_MAX_AGE_MS && !muted) playNow(pending.kind)
    pending = null
  }
  if (c.state === 'running') finish()
  else void c.resume().then(finish, () => undefined)
}

const UNLOCK_EVENTS = ['pointerdown', 'touchend', 'click', 'keydown'] as const
function removeUnlockListeners() {
  if (typeof window === 'undefined') return
  UNLOCK_EVENTS.forEach((e) => window.removeEventListener(e, unlockAudio))
}
if (typeof window !== 'undefined') {
  UNLOCK_EVENTS.forEach((e) => window.addEventListener(e, unlockAudio, { passive: true }))
}

/** Mainkan efek suara. Aman dipanggil kapan saja: bila audio belum terbuka, ditahan sampai sentuhan berikutnya. */
export function playSound(kind: SoundKind) {
  if (muted) return
  const c = getContext()
  if (!c) return
  if (c.state === 'running') {
    playNow(kind)
    return
  }
  pending = { kind, at: Date.now() }
  void c.resume().then(
    () => {
      if (c.state === 'running' && pending && pending.kind === kind) {
        const p = pending
        pending = null
        if (Date.now() - p.at < PENDING_MAX_AGE_MS) playNow(kind)
      }
    },
    () => undefined,
  )
}
