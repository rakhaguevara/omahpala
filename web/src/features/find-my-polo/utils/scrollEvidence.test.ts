import { describe, expect, it } from 'vitest'
import { ScrollEvidenceTracker } from './scrollEvidence'

const make = () => new ScrollEvidenceTracker(4000, 200, 3)

describe('ScrollEvidenceTracker', () => {
  it('belum selesai tanpa scroll walau waktu cukup', () => {
    const t = make()
    t.start(0, 0)
    for (let ms = 250; ms <= 6000; ms += 250) t.tick(ms, true)
    expect(t.progress()).toMatchObject({ time: 1, scroll: 0, done: false })
  })

  it('belum selesai bila scroll cukup tapi waktu kurang dari 4 detik', () => {
    const t = make()
    t.start(0, 0)
    t.scroll(120, true)
    t.scroll(260, true)
    t.scroll(400, true)
    for (let ms = 250; ms <= 3500; ms += 250) t.tick(ms, true)
    const p = t.progress()
    expect(p.scroll).toBe(1)
    expect(p.time).toBeLessThan(1)
    expect(p.done).toBe(false)
  })

  it('selesai bila waktu terlihat ≥ 4 dtk, jarak ≥ 200px, dan ≥ 3 gerakan', () => {
    const t = make()
    t.start(0, 0)
    t.scroll(100, true)
    t.scroll(220, true)
    t.scroll(310, true)
    for (let ms = 250; ms <= 4000; ms += 250) t.tick(ms, true)
    expect(t.progress().done).toBe(true)
    expect(t.snapshot()).toEqual({ visibleMs: 4000, scrollPx: 310, scrollEvents: 3 })
  })

  it('satu lompatan scroll besar tidak cukup (butuh ≥ 3 gerakan)', () => {
    const t = make()
    t.start(0, 0)
    t.scroll(900, true)
    for (let ms = 250; ms <= 5000; ms += 250) t.tick(ms, true)
    expect(t.progress().done).toBe(false)
  })

  it('waktu & scroll saat tab tersembunyi tidak dihitung', () => {
    const t = make()
    t.start(0, 0)
    for (let ms = 250; ms <= 10_000; ms += 250) t.tick(ms, false)
    t.scroll(500, false)
    expect(t.snapshot()).toEqual({ visibleMs: 0, scrollPx: 0, scrollEvents: 0 })
  })

  it('selisih waktu besar (tab di-throttle) dibatasi 1 dtk per tick', () => {
    const t = make()
    t.start(0, 0)
    t.tick(60_000, true)
    expect(t.snapshot().visibleMs).toBe(1000)
  })

  it('gerakan < 1px diabaikan; scroll balik ke atas juga dihitung jaraknya', () => {
    const t = make()
    t.start(0, 100)
    t.scroll(100.4, true)
    t.scroll(50, true)
    const snap = t.snapshot()
    expect(snap.scrollPx).toBeCloseTo(50.4, 5)
    expect(snap.scrollEvents).toBe(1)
  })

  it('start() mereset bukti (mis. setelah refresh halaman)', () => {
    const t = make()
    t.start(0, 0)
    t.scroll(300, true)
    t.tick(1000, true)
    t.start(5000, 0)
    expect(t.snapshot()).toEqual({ visibleMs: 0, scrollPx: 0, scrollEvents: 0 })
  })
})
