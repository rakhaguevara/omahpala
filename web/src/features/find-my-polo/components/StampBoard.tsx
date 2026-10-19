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
 * Papan 4 slot stamp. Status ditunjukkan dengan ikon centang + teks ("Ditemukan"/"Belum ditemukan"),
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
      <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4" aria-label={t('polo.progress.title')}>
        {Array.from({ length: total }, (_, i) => {
          const label = sorted[i]
          const found = label !== undefined
          const isNew = found && label === justCollected
          return (
            <li key={i}>
              <motion.div
                key={found ? `f-${label}` : `e-${i}`}
                initial={isNew && !reduce ? { scale: 0.6, opacity: 0, rotateY: -360 } : false}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                style={{ transformPerspective: 800 }}
                transition={{ duration: dur.slow, ease }}
                className={cn(
                  'flex aspect-square flex-col items-center justify-center gap-2 rounded-md p-3 text-center',
                  found ? 'border border-accent bg-accent-soft' : 'border border-dashed border-line bg-white',
                )}
              >
                {found ? (
                  <img src={ASSETS.stamp(label)} alt={t('polo.stampAlt')} className="h-16 w-16 object-contain sm:h-20 sm:w-20" />
                ) : (
                  <span aria-hidden="true" className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-line text-title text-muted-2 sm:h-20 sm:w-20">
                    ?
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-meta text-ink">
                  {found && <IconCheck className="h-4 w-4 text-accent-ink" aria-hidden="true" />}
                  {found ? `${t('polo.progress.qrNo', { n: label })} · ${t('polo.progress.slotFound')}` : t('polo.progress.slotEmpty')}
                </span>
              </motion.div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
