import { useSyncExternalStore } from 'react'
import { STORAGE_KEYS } from '../config'

// Efek suara disintesis dengan Web Audio — tanpa berkas audio untuk diunduh atau diganti.
// Preferensi mute (non-sensitif) disimpan di localStorage; boleh gagal tanpa merusak apa pun.

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

function note(freq: number, startAt: number, length: number, type: OscillatorType = 'sine', peak = 0.12) {
  if (!ctx) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0.0001, ctx.currentTime + startAt)
  gain.gain.exponentialRampToValueAtTime(peak, ctx.currentTime + startAt + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startAt + length)
  osc.connect(gain).connect(ctx.destination)
  osc.start(ctx.currentTime + startAt)
  osc.stop(ctx.currentTime + startAt + length + 0.05)
}

export type SoundKind = 'stamp' | 'sticker' | 'neutral'

/** Dipanggil dari handler aksi pengguna (browser mengharuskan gestur untuk memulai audio). */
export function playSound(kind: SoundKind) {
  if (muted) return
  try {
    ctx ??= new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
    if (kind === 'stamp') {
      note(523.25, 0, 0.14)
      note(783.99, 0.1, 0.22)
    } else if (kind === 'sticker') {
      note(523.25, 0, 0.14)
      note(659.25, 0.1, 0.14)
      note(783.99, 0.2, 0.14)
      note(1046.5, 0.3, 0.4)
    } else {
      note(392, 0, 0.16, 'triangle', 0.08)
    }
  } catch {
    /* audio tidak tersedia — fitur tetap berfungsi tanpa suara */
  }
}
