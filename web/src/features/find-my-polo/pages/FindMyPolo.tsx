import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Eyebrow } from '@/components/ui/Badge'
import { Button, LinkButton } from '@/components/ui/Button'
import { IconArrowRight } from '@/components/ui/Icons'
import { Reveal } from '@/components/motion/Reveal'
import { Stagger, StaggerItem } from '@/components/motion/Stagger'
import { Seo } from '@/components/layout/Seo'
import { GameGate } from '../components/GameGate'
import { RewardPanel } from '../components/RewardPanel'
import { SoundToggle } from '../components/SoundToggle'
import { StampBoard } from '../components/StampBoard'
import { ROUTES } from '../config'
import { signOut } from '../hooks/useAuthSession'
import { useGame } from '../hooks/useGame'
import { saveChallenge } from '../utils/challengeStore'

const STEPS = [1, 2, 3, 4] as const

/** Find My Polo — beranda permainan: aturan, masuk/daftar, Start Hunting, koleksi stamp, hadiah. */
export default function FindMyPolo() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const game = useGame()

  return (
    <>
      <Seo title={`${t('polo.metaTitle')} — ${t('common.brand')}`} description={t('polo.metaDescription')} path={ROUTES.home} />

      <Section tone="ink" className="pt-36">
        <Container>
          <Reveal className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
            <Eyebrow tone="white" className="justify-center">
              {t('polo.eyebrow')}
            </Eyebrow>
            <h1 className="text-display-xl text-balance text-white">{t('polo.title')}</h1>
            <p className="text-body-l max-content-w text-white/85">{t('polo.subtitle')}</p>
          </Reveal>
        </Container>
      </Section>

      <Section tone="surface">
        <Container className="flex flex-col gap-12">
          <GameGate game={game}>
            {(progress) => (
              <div className="flex flex-col gap-10">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-display-m">{t('polo.progress.title')}</h2>
                  <div className="flex flex-wrap items-center gap-3">
                    <SoundToggle />
                    <Button variant="ghost" size="sm" onClick={() => void signOut()}>
                      {t('polo.auth.signOut')}
                    </Button>
                  </div>
                </div>

                {!progress.event.is_open && (
                  <p role="status" className="rounded-md bg-[#FFF6E0] p-4 text-body text-[#7A5A00]">
                    {t('polo.closedBanner')}
                  </p>
                )}

                <StampBoard total={progress.total_active} collected={progress.collected} />

                <p className="text-body text-muted">
                  {progress.all_found
                    ? t('polo.progress.allFound')
                    : progress.sticker_unlocked
                      ? t('polo.progress.stickerUnlocked')
                      : t('polo.progress.stickerLocked', { count: progress.sticker_unlock_at })}
                </p>

                {progress.pending_challenge ? (
                  <div className="flex flex-col items-start gap-3 rounded-md border border-line bg-white p-5">
                    <p className="text-label">{t('polo.challenge.resume')}</p>
                    <p className="text-body text-muted">{t('polo.challenge.goToBody')}</p>
                    <Button
                      variant="dark"
                      size="sm"
                      onClick={() => {
                        saveChallenge(progress.pending_challenge!)
                        navigate(progress.pending_challenge!.destination_path)
                      }}
                    >
                      {t('polo.challenge.resumeCta')}
                    </Button>
                  </div>
                ) : (
                  progress.event.is_open && (
                    <LinkButton to={ROUTES.scan} variant="primary" className="self-start">
                      {t('polo.scanCta')}
                      <IconArrowRight className="h-4 w-4" aria-hidden="true" />
                    </LinkButton>
                  )
                )}

                <div className="flex flex-col gap-4">
                  <h2 className="text-display-m">{t('polo.rewards.title')}</h2>
                  <RewardPanel progress={progress} onProgress={game.apply} />
                </div>
              </div>
            )}
          </GameGate>

          {!game.started && (
            <div>
              <Reveal className="mb-8">
                <h2 className="text-display-m">{t('polo.rulesTitle')}</h2>
              </Reveal>
              <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {STEPS.map((n) => (
                  <StaggerItem key={n}>
                    <div className="flex h-full flex-col gap-3 rounded-md border border-line bg-white p-5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-label text-white">{n}</span>
                      <h3 className="text-title">{t(`polo.step${n}Title`)}</h3>
                      <p className="text-body text-muted">{t(`polo.step${n}Body`)}</p>
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          )}

        </Container>
      </Section>
    </>
  )
}
