import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { GameError } from '../services/supabase'
import { createRewardClaim } from '../services/gameApi'
import type { RewardState, StartedProgress } from '../types'
import { ASSETS } from '../config'
import { errorText } from '../utils/errorText'

interface RewardPanelProps {
  progress: StartedProgress
  onProgress: (p: StartedProgress) => void
}

/** Kelayakan, stok, dan klaim — semuanya berasal dari server; tombol hanya meminta klaim. */
export function RewardPanel({ progress, onProgress }: RewardPanelProps) {
  const { t } = useTranslation()
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function claim(type: string) {
    setBusy(type)
    setError(null)
    try {
      onProgress(await createRewardClaim(type))
    } catch (e) {
      setError(errorText(t, e instanceof GameError ? e.code : 'unknown'))
    } finally {
      setBusy(null)
    }
  }

  function status(r: RewardState) {
    if (r.claim) {
      const tone = r.claim.status === 'redeemed' ? 'accent' : r.claim.status === 'cancelled' ? 'neutral' : 'pending'
      const key = r.claim.status === 'redeemed' ? 'statusRedeemed' : r.claim.status === 'cancelled' ? 'statusCancelled' : 'statusClaimed'
      return <Badge tone={tone}>{t(`polo.rewards.${key}`)}</Badge>
    }
    if (!r.eligible) return <Badge>{t('polo.rewards.needStamps', { count: r.min_stamps })}</Badge>
    return null
  }

  const hasLiveClaim = progress.rewards.some((r) => r.claim && r.claim.status !== 'cancelled')

  return (
    <div className="flex flex-col gap-4">
      <ul className="grid gap-4 sm:grid-cols-2">
        {progress.rewards.map((r) => {
          // Server tetap menolak klaim kedua; di sini hanya tidak menawarkannya.
          const blockedByOther = !progress.rewards_combinable && hasLiveClaim
          const claimable = r.eligible && !r.claim && !blockedByOther
          return (
            <li key={r.type} className="flex flex-col gap-3 rounded-md border border-line bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-title">{t(`polo.rewards.${r.type}.title`, { defaultValue: r.type })}</h3>
                  <p className="mt-1 text-body text-muted">{t(`polo.rewards.${r.type}.body`, { defaultValue: '' })}</p>
                </div>
                {status(r)}
              </div>

              {r.claim?.code && (
                <div className="rounded-sm bg-surface p-4">
                  <p className="text-meta text-muted">{t('polo.rewards.code')}</p>
                  <p className="mt-1 font-mono text-display-m tracking-[0.18em]" aria-label={r.claim.code.split('').join(' ')}>
                    {r.claim.code.slice(0, 4)}-{r.claim.code.slice(4)}
                  </p>
                  {r.claim.status === 'claimed' && <p className="mt-2 text-meta text-muted">{t('polo.rewards.showStaff')}</p>}
                </div>
              )}

              {r.eligible && !r.claim && blockedByOther && (
                <p className="text-meta text-muted">{t('polo.errors.already_claimed_other_reward')}</p>
              )}
              {claimable && !r.stock_configured && <p className="text-meta text-muted">{t('polo.rewards.noStock')}</p>}
              {claimable && r.stock_configured && !r.available && <p className="text-meta text-muted">{t('polo.rewards.outOfStock')}</p>}
              {claimable && r.stock_configured && r.available && (
                <Button variant="primary" size="sm" disabled={busy !== null} onClick={() => claim(r.type)} className="self-start">
                  {busy === r.type ? t('polo.rewards.claiming') : t('polo.rewards.claim')}
                </Button>
              )}
            </li>
          )
        })}
      </ul>

      {progress.sticker_unlocked && (
        <div className="flex items-center gap-4 rounded-md border border-accent bg-accent-soft p-5">
          <img src={ASSETS.digitalSticker} alt={t('polo.sticker.alt')} className="h-20 w-20 shrink-0" />
          <div>
            <p className="text-label">{t('polo.progress.stickerUnlocked')}</p>
            <p className="mt-1 text-meta text-muted">{t('polo.dummyNote')}</p>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="text-meta text-[#B23A3A]">
          {error}
        </p>
      )}
      <p className="text-meta text-muted-2">{t('polo.rewards.note')}</p>
    </div>
  )
}
