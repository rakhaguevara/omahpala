import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { LinkButton } from '@/components/ui/Button'
import { IconArrowUpRight, IconCheck, IconClose } from '@/components/ui/Icons'
import { dur, ease } from '@/lib/motion'

export interface EcosystemCardContent {
  id: string
  image: string
  eyebrow: string
  title: string
  description: string
  points?: string[]
  productSlug?: string
}

/**
 * Kartu mengambang saat sebuah node diagram ekosistem diklik — hanya kartu penjelas
 * (bukan halaman/dialog penuh), warna & radius mengikuti token design.md, bukan tema referensi.
 */
export function EcosystemNodeCard({
  content,
  onClose,
}: {
  content: EcosystemCardContent | null
  onClose: () => void
}) {
  const { t } = useTranslation()

  return (
    <AnimatePresence>
      {content && (
        <motion.div
          key="ecosystem-card-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 p-4 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: dur.fast, ease }}
          onClick={onClose}
        >
          <motion.div
            key={content.id}
            role="dialog"
            aria-modal="true"
            aria-label={content.title}
            className="relative max-h-[90vh] w-full max-w-sm overflow-x-hidden overflow-y-auto rounded-lg bg-white text-left shadow-[0_24px_64px_rgba(0,0,0,.2)]"
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 6 }}
            transition={{ duration: dur.base, ease }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label={t('common.close')}
              className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-line/60 bg-white/90 text-muted-2 shadow-[0_1px_4px_rgba(0,0,0,.12)] backdrop-blur-sm transition-colors duration-200 [transition-timing-function:var(--ease-brand)] hover:bg-white hover:text-ink"
            >
              <IconClose className="h-4 w-4" />
            </button>

            <div className="aspect-[4/3] w-full bg-surface">
              <img
                src={content.image}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex flex-col gap-3 p-6">
              <div className="flex items-center gap-2 text-eyebrow text-muted">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                {content.eyebrow}
              </div>
              <h3 className="text-title text-ink">{content.title}</h3>
              <p className="text-body text-muted">{content.description}</p>

              {content.points && content.points.length > 0 && (
                <ul className="flex flex-col gap-2 pt-1">
                  {content.points.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-meta text-muted">
                      <IconCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-ink" aria-hidden />
                      {point}
                    </li>
                  ))}
                </ul>
              )}

              {content.productSlug && (
                <LinkButton
                  to={`/produk/${content.productSlug}`}
                  variant="ghost"
                  size="sm"
                  className="mt-1 w-full"
                  onClick={onClose}
                >
                  <IconArrowUpRight className="h-4 w-4" />
                  {t('catalog.viewDetail')}
                </LinkButton>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
