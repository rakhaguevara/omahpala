import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, LinkButton } from '@/components/ui/Button'
import { ROUTES } from '../config'
import { playSound } from '../hooks/useSound'
import { beginChallenge, completeChallenge } from '../services/gameApi'
import type { PendingChallenge } from '../types'
import { clearChallenge, samePath } from '../utils/challengeStore'
import { ScrollEvidenceTracker } from '../utils/scrollEvidence'

type Phase = 'away' | 'starting' | 'running' | 'verifying' | 'done' | 'expired' | 'error'

const TICK_MS = 250

/**
 * Bar tantangan scroll yang melayang di bawah halaman produk/program yang SUDAH ADA (tanpa
 * mengubah layout halaman itu). Browser hanya mengumpulkan bukti; server yang memutuskan selesai
 * (jam server, kepemilikan, kedaluwarsa, sekali pakai). Lihat catatan di scrollEvidence.ts.
 */
export default function ChallengeBar({ challenge }: { challenge: PendingChallenge }) {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const onDestination = samePath(pathname, challenge.destination_path)
  const [phase, setPhase] = useState<Phase>(onDestination ? 'starting' : 'away')
  const [bars, setBars] = useState({ time: 0, scroll: 0 })
  const [needMore, setNeedMore] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const phaseRef = useRef<Phase>(phase)
  phaseRef.current = phase

  const finish = useCallback(() => {
    clearChallenge()
    playSound('ding')
    setPhase('done')
  }, [])

  useEffect(() => {
    if (!onDestination) {
      setPhase('away')
      return
    }
    let cancelled = false
    let timer: number | undefined
    let retry: number | undefined
    const tracker = new ScrollEvidenceTracker(
      challenge.min_seconds * 1000,
      challenge.min_scroll_px,
      challenge.min_scroll_events,
    )
    const visible = () => document.visibilityState === 'visible'
    const onScroll = () => tracker.scroll(window.scrollY, visible())

    async function verify() {
      if (cancelled || phaseRef.current === 'verifying') return
      setPhase('verifying')
      try {
        const res = await completeChallenge(challenge.id, tracker.snapshot())
        if (cancelled) return
        if (res.ok) return finish()
        if (res.reason === 'expired') {
          clearChallenge()
          return setPhase('expired')
        }
        if (res.reason === 'too_early') {
          // Jam server sedikit tertinggal dari jam klien (latensi begin) — coba lagi sebentar lagi.
          setPhase('verifying')
          retry = window.setTimeout(() => {
            phaseRef.current = 'running'
            void verify()
          }, (res.retry_after_ms ?? 500) + 100)
          return
        }
        // Server menilai bukti kurang: mulai hitung ulang dari nol, jangan loop otomatis.
        setNeedMore(true)
        tracker.start(performance.now(), window.scrollY)
        setPhase('running')
      } catch {
        if (!cancelled) setPhase('error')
      }
    }

    setPhase('starting')
    setNeedMore(false)
    beginChallenge(challenge.id)
      .then((res) => {
        if (cancelled) return
        if (res.status === 'completed') return finish()
        if (!res.ok) {
          clearChallenge()
          return setPhase('expired')
        }
        tracker.start(performance.now(), window.scrollY)
        setPhase('running')
        window.addEventListener('scroll', onScroll, { passive: true })
        timer = window.setInterval(() => {
          tracker.tick(performance.now(), visible())
          const p = tracker.progress()
          setBars({ time: p.time, scroll: p.scroll })
          if (p.done && phaseRef.current === 'running') void verify()
        }, TICK_MS)
      })
      .catch(() => {
        if (!cancelled) setPhase('error')
      })

    return () => {
      cancelled = true
      window.removeEventListener('scroll', onScroll)
      if (timer) window.clearInterval(timer)
      if (retry) window.clearTimeout(retry)
    }
  }, [onDestination, challenge.id, challenge.min_seconds, challenge.min_scroll_px, challenge.min_scroll_events, attempt, finish])

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <section
        aria-label={t('polo.challenge.title')}
        className="pointer-events-auto w-full max-w-md rounded-md border border-line bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,.14)]"
      >
        {phase === 'away' && (
          <div className="flex flex-col gap-3">
            <p className="text-label">{t('polo.challenge.resume')}</p>
            <p className="text-meta text-muted">{t('polo.challenge.goToBody')}</p>
            <LinkButton to={challenge.destination_path} variant="dark" size="sm" className="self-start">
              {t('polo.challenge.goTo')}
            </LinkButton>
          </div>
        )}

        {(phase === 'starting' || phase === 'running' || phase === 'verifying') && (
          <div className="flex flex-col gap-3">
            <p className="text-label">{t('polo.challenge.title')}</p>
            <p className="text-meta text-muted">
              {phase === 'verifying' ? t('polo.challenge.verifying') : needMore ? t('polo.challenge.needMore') : t('polo.challenge.intro')}
            </p>
            <Meter label={t('polo.challenge.time')} value={bars.time} />
            <Meter label={t('polo.challenge.scroll')} value={bars.scroll} />
          </div>
        )}

        {phase === 'done' && (
          <div className="flex flex-col gap-3" role="status">
            <p className="text-label">{t('polo.challenge.done')}</p>
            <LinkButton to={ROUTES.scan} variant="primary" size="sm" className="self-start">
              {t('polo.challenge.continue')}
            </LinkButton>
          </div>
        )}

        {phase === 'expired' && (
          <div className="flex flex-col gap-3" role="status">
            <p className="text-meta text-muted">{t('polo.challenge.expired')}</p>
            <LinkButton to={ROUTES.scan} variant="dark" size="sm" className="self-start">
              {t('polo.scanCta')}
            </LinkButton>
          </div>
        )}

        {phase === 'error' && (
          <div className="flex flex-col gap-3" role="alert">
            <p className="text-meta text-[#B23A3A]">{t('polo.challenge.error')}</p>
            <Button variant="ghost" size="sm" className="self-start" onClick={() => setAttempt((n) => n + 1)}>
              {t('polo.challenge.retry')}
            </Button>
          </div>
        )}
      </section>
    </div>
  )
}

/** Bar progres dengan persentase sebagai teks, tidak hanya warna/lebar. */
function Meter({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 100)
  return (
    <div>
      <div className="mb-1 flex justify-between text-meta text-muted">
        <span>{label}</span>
        <span className="tabular-nums">{pct}%</span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        className="h-2 overflow-hidden rounded-pill bg-surface"
      >
        <div className="h-full rounded-pill bg-accent" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

