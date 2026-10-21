import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Eyebrow } from '@/components/ui/Badge'
import { Button, LinkButton } from '@/components/ui/Button'
import { FieldWrapper, Input } from '@/components/ui/Field'
import { Seo } from '@/components/layout/Seo'
import { GameGate } from '../components/GameGate'
import { QrScannerView } from '../components/QrScannerView'
import { SoundToggle } from '../components/SoundToggle'
import { StampBoard } from '../components/StampBoard'
import { MissReveal } from '../components/MissReveal'
import { StampReveal } from '../components/StampReveal'
import { StickerReveal } from '../components/StickerReveal'
import { ROUTES } from '../config'
import { useGame } from '../hooks/useGame'
import { playSound } from '../hooks/useSound'
import { scanQr } from '../services/gameApi'
import { GameError } from '../services/supabase'
import type { PendingChallenge, ScanResponse, ScanResultCode, StartedProgress } from '../types'
import { saveChallenge } from '../utils/challengeStore'
import { errorText } from '../utils/errorText'
import { extractQrToken } from '../utils/qrToken'

type Outcome = { code: ScanResultCode; label?: number }

/**
 * Halaman pemindai. Dibuka lewat tombol "Pindai QR" atau lewat tautan di QR fisik
 * (/find-my-polo/q/:token → diarahkan ke sini dengan token di router state, bukan di URL, supaya
 * refresh tidak mengirim ulang). Hasil scan SELALU datang dari server.
 */
export default function ScanPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const game = useGame()
  const [busy, setBusy] = useState(false)
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  const [justCollected, setJustCollected] = useState<number | null>(null)
  const [showSticker, setShowSticker] = useState(false)
  // QR bukan target: pop-up dulu, baru ke halaman tantangan lewat tombolnya.
  const [miss, setMiss] = useState<{ code: 'inactive_for_player' | 'challenge_required'; challenge: PendingChallenge } | null>(null)
  // Stamp yang baru didapat: pop-up tampil dulu, slot koleksi terisi setelah pop-up ditutup.
  const [reveal, setReveal] = useState<{ label: number; count: number; total: number; unlocksSticker: boolean } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [manual, setManual] = useState('')
  const handledToken = useRef<string | null>(null)
  const stickerWasUnlocked = useRef<boolean | null>(null)

  const started = game.started
  const { apply } = game
  // Catat status stiker sebelum scan, supaya "baru terbuka" bisa dideteksi dari respons server.
  useEffect(() => {
    if (started && stickerWasUnlocked.current === null) stickerWasUnlocked.current = started.sticker_unlocked
  }, [started])

  const goChallenge = useCallback(
    (progress: StartedProgress) => {
      const c: PendingChallenge | null = progress.pending_challenge
      if (!c) return
      saveChallenge(c)
      navigate(c.destination_path)
    },
    [navigate],
  )

  const submit = useCallback(
    async (raw: string) => {
      setError(null)
      const token = extractQrToken(raw)
      if (!token) {
        setOutcome({ code: 'invalid_qr' })
        return
      }
      setBusy(true)
      try {
        const res: ScanResponse = await scanQr(token)
        apply(res.progress)
        if (res.result === 'stamp_awarded') {
          setJustCollected(res.qr_label ?? null)
          playSound('stamp')
          setReveal({
            label: res.qr_label ?? 0,
            count: res.progress.stamp_count,
            total: res.progress.total_active,
            unlocksSticker: res.progress.sticker_unlocked && stickerWasUnlocked.current === false,
          })
        } else if (res.result === 'already_collected' || res.result === 'invalid_qr') {
          playSound('info')
        } else if (res.result === 'event_inactive' || res.result === 'rate_limited') {
          playSound('error')
        }
        stickerWasUnlocked.current = res.progress.sticker_unlocked

        if (res.result === 'inactive_for_player' || res.result === 'challenge_required') {
          if (res.progress.pending_challenge) {
            playSound('info')
            setMiss({ code: res.result, challenge: res.progress.pending_challenge })
          }
          return
        }
        setOutcome({ code: res.result, label: res.qr_label })
      } catch (e) {
        playSound('error')
        setError(errorText(t, e instanceof GameError ? e.code : 'unknown'))
      } finally {
        setBusy(false)
      }
    },
    [apply, t],
  )

  // Tautan QR: token datang lewat router state; dikonsumsi sekali lalu dihapus dari history.
  const stateToken = (location.state as { token?: string } | null)?.token
  useEffect(() => {
    if (!started || !stateToken || handledToken.current === stateToken) return
    handledToken.current = stateToken
    navigate(location.pathname, { replace: true, state: null })
    void submit(stateToken)
  }, [started, stateToken, navigate, location.pathname, submit])

  function continueMiss() {
    if (!miss) return
    saveChallenge(miss.challenge)
    navigate(miss.challenge.destination_path)
  }

  function closeReveal() {
    const unlocks = reveal?.unlocksSticker
    setReveal(null)
    if (unlocks) {
      playSound('sticker')
      setShowSticker(true)
    }
  }

  function onManual(e: FormEvent) {
    e.preventDefault()
    if (!extractQrToken(manual)) {
      setError(t('polo.scan.manualInvalid'))
      return
    }
    setManual('')
    void submit(manual)
  }

  return (
    <>
      <Seo title={`${t('polo.scan.metaTitle')} — ${t('common.brand')}`} description={t('polo.metaDescription')} path={ROUTES.scan} />

      <Section tone="ink" className="pt-36 pb-16 md:pb-20">
        <Container>
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
            <Eyebrow tone="white" className="justify-center">
              {t('polo.eyebrow')}
            </Eyebrow>
            <h1 className="text-display-l text-balance text-white">{t('polo.scan.title')}</h1>
            <p className="text-body-l text-white/85">{t('polo.scan.subtitle')}</p>
          </div>
        </Container>
      </Section>

      <Section tone="surface" className="pt-12">
        <Container className="flex flex-col gap-8">
          <GameGate game={game} loginNote={t('polo.scan.needLogin')} startNote={t('polo.scan.needGame')}>
            {(progress) => (
              <div className="mx-auto flex w-full max-w-xl flex-col gap-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <LinkButton to={ROUTES.home} variant="ghost" size="sm">
                    {t('polo.scan.back')}
                  </LinkButton>
                  <SoundToggle />
                </div>

                <StampBoard
                  total={progress.total_active}
                  collected={reveal ? progress.collected.filter((l) => l !== reveal.label) : progress.collected}
                  justCollected={justCollected}
                />

                {!progress.event.is_open && (
                  <p role="status" className="rounded-md bg-[#FFF6E0] p-4 text-body text-[#7A5A00]">
                    {t('polo.closedBanner')}
                  </p>
                )}

                {outcome && (
                  <div role="status" className="flex flex-col gap-3 rounded-md border border-line bg-white p-5">
                    <h2 className="text-title">{t(`polo.result.${outcome.code}.title`)}</h2>
                    <p className="text-body text-muted">{t(`polo.result.${outcome.code}.body`, { n: outcome.label })}</p>
                    <Button
                      variant="dark"
                      size="sm"
                      className="self-start"
                      onClick={() => {
                        setOutcome(null)
                        setJustCollected(null)
                      }}
                    >
                      {t('polo.scan.again')}
                    </Button>
                  </div>
                )}

                {!outcome && progress.pending_challenge && (
                  <div className="flex flex-col items-start gap-3 rounded-md border border-line bg-white p-5">
                    <p className="text-label">{t('polo.challenge.resume')}</p>
                    <p className="text-body text-muted">{t('polo.challenge.goToBody')}</p>
                    <Button variant="dark" size="sm" onClick={() => goChallenge(progress)}>
                      {t('polo.challenge.resumeCta')}
                    </Button>
                  </div>
                )}

                {!outcome && !progress.pending_challenge && progress.event.is_open && (
                  <>
                    <QrScannerView onDecode={(text) => void submit(text)} paused={busy} />
                    {busy && (
                      <p role="status" className="text-body text-muted">
                        {t('polo.scan.checking')}
                      </p>
                    )}
                    <p className="text-meta text-muted-2">{t('polo.scan.orCameraApp')}</p>

                    <form onSubmit={onManual} className="flex flex-col gap-3" noValidate>
                      <FieldWrapper label={t('polo.scan.manualLabel')} htmlFor="polo-manual" error={error ?? undefined}>
                        <Input
                          id="polo-manual"
                          inputMode="url"
                          autoComplete="off"
                          autoCapitalize="off"
                          spellCheck={false}
                          value={manual}
                          onChange={(e) => setManual(e.target.value)}
                          aria-describedby="polo-manual-help"
                        />
                        <p id="polo-manual-help" className="text-meta text-muted-2">
                          {t('polo.scan.manualHelp')}
                        </p>
                      </FieldWrapper>
                      <Button type="submit" variant="ghost" size="sm" className="self-start" disabled={busy || !manual.trim()}>
                        {t('polo.scan.manualSubmit')}
                      </Button>
                    </form>
                  </>
                )}

                {(outcome || progress.pending_challenge || !progress.event.is_open) && error && (
                  <p role="alert" className="text-meta text-[#B23A3A]">
                    {error}
                  </p>
                )}
              </div>
            )}
          </GameGate>
        </Container>
      </Section>

      {miss && <MissReveal code={miss.code} onContinue={continueMiss} onClose={() => setMiss(null)} />}
      {reveal && <StampReveal label={reveal.label} count={reveal.count} total={reveal.total} onClose={closeReveal} />}
      {showSticker && <StickerReveal onClose={() => setShowSticker(false)} />}
    </>
  )
}
