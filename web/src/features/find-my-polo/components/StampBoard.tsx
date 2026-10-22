import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { dur, ease } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { IconCheck } from '@/components/ui/Icons'
import { ASSETS } from '../config'

interface StampBoardProps {
  total: number
  /** Nomor QR yang sudah dikumpulkan (dari server). */
  collected: number[]
  /** Nomor QR yang baru saja didapat — hanya slot ini yang dianimasikan. */
  justCollected?: number | null
}

/**
 * Papan slot stamp (3 slot: QR 1–3). Status ditunjukkan dengan ikon centang + teks ("Ditemukan"/"Belum ditemukan"),
 * tidak hanya lewat warna. Animasi mati bila pengguna memilih reduced motion.
 */
export function StampBoard({ total, collected, justCollected = null }: StampBoardProps) {
  const { t } = useTranslation()
  const reduce = useReducedMotion()
  const sorted = [...collected].sort((a, b) => a - b)

  return (
    <div>
      <p className="text-title" aria-live="polite">
        {t('polo.progress.count', { count: sorted.length, total })}
      </p>
      <ul className={cn('mt-5 grid gap-4', total === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4')} aria-label={t('polo.progress.title')}>
        {Array.from({ length: total }, (_, i) => {
          const label = sorted[i]
          const found = label !== undefined
          const isNew = found && label === justCollected
          const cardBase = 'flex aspect-square flex-col items-center justify-center gap-2 rounded-md p-3 text-center'
          const emptyFace = (
            <>
              <span aria-hidden="true" className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-line text-title text-muted-2 sm:h-20 sm:w-20">
                ?
              </span>
              <span className="inline-flex items-center gap-1 text-meta text-ink">{t('polo.progress.slotEmpty')}</span>
            </>
          )
          const foundFace = found && (
            <>
              <img src={ASSETS.stamp(label)} alt={t('polo.stampAlt')} className="h-16 w-16 object-contain sm:h-20 sm:w-20" />
              <span className="inline-flex items-center gap-1 text-meta text-ink">
                <IconCheck className="h-4 w-4 text-accent-ink" aria-hidden="true" />
                {`${t('polo.progress.qrNo', { n: label })} · ${t('polo.progress.slotFound')}`}
              </span>
            </>
          )
          const hidden = { backfaceVisibility: 'hidden' as const, WebkitBackfaceVisibility: 'hidden' as const }

          return (
            <li key={i} style={{ perspective: 800 }}>
              {isNew && !reduce ? (
                // Kartu dua sisi: sisi luar "?" berputar ke sisi dalam (stempel) saat baru ditemukan.
                <motion.div
                  key={`flip-${label}`}
                  className="relative aspect-square"
                  style={{ transformStyle: 'preserve-3d' }}
                  initial={{ rotateY: 0 }}
                  animate={{ rotateY: 180 }}
                  transition={{ duration: dur.slow, ease, delay: dur.fast }}
                >
                  <div className={cn(cardBase, 'absolute inset-0 border border-dashed border-line bg-white')} style={hidden}>
                    {emptyFace}
                  </div>
                  <div
                    className={cn(cardBase, 'absolute inset-0 border border-accent bg-accent-soft')}
                    style={{ ...hidden, transform: 'rotateY(180deg)' }}
                  >
                    {foundFace}
                  </div>
                </motion.div>
              ) : (
                <div className={cn(cardBase, found ? 'border border-accent bg-accent-soft' : 'border border-dashed border-line bg-white')}>
                  {found ? foundFace : emptyFace}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
