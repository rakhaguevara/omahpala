import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Eyebrow } from '@/components/ui/Badge'
import { LinkButton } from '@/components/ui/Button'
import { Reveal } from '@/components/motion/Reveal'
import { IconChevronDown, IconSparkle } from '@/components/ui/Icons'
import { usePageContent } from '@/lib/usePageContent'
import { dur, ease } from '@/lib/motion'
import { cn } from '@/lib/utils'

/**
 * Blok "Mengapa Pala" — PRD H-08. Persis referensi: daftar baris dipisah garis putus-putus
 * (titik hijau + judul + body), foto di kanan dengan tombol CTA mengambang di tepi bawah.
 * Baris berupa accordion — ringkas, body hanya tampil saat barisnya dibuka.
 */
export function WhyPala() {
  const { t } = useTranslation()
  const title = usePageContent('why.title')
  const body = usePageContent('why.body')
  const reduceMotion = useReducedMotion()
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const rows = [
    { title: t('home.whyRow1Title'), body: t('home.whyRow1Body') },
    { title: t('home.whyRow2Title'), body: t('home.whyRow2Body') },
    { title: t('home.whyRow3Title'), body: t('home.whyRow3Body') },
  ]

  return (
    <div className="grid items-start gap-10 sm:grid-cols-2 sm:gap-16">
      <Reveal className="flex flex-col gap-6">
        <Eyebrow>{t('home.whyEyebrow')}</Eyebrow>
        <h2 className="text-display-l text-balance">{title}</h2>
        <p className="text-body-l max-content-w text-muted">{body}</p>

        <ul className="flex flex-col">
          {rows.map((row, i) => {
            const open = openIndex === i
            return (
              <li key={row.title} className="border-b border-dashed border-line py-5 first:pt-0 last:border-b-0">
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : i)}
                  aria-expanded={open}
                  className="group flex w-full items-center justify-between gap-3 text-left"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        'h-2.5 w-2.5 shrink-0 rounded-full bg-accent transition-opacity duration-200 [transition-timing-function:var(--ease-brand)]',
                        open ? 'opacity-100' : 'opacity-40 group-hover:opacity-100',
                      )}
                      aria-hidden
                    />
                    <h3
                      className={cn(
                        'text-title transition-colors duration-200 [transition-timing-function:var(--ease-brand)]',
                        open ? 'text-accent' : 'text-ink group-hover:text-accent',
                      )}
                    >
                      {row.title}
                    </h3>
                  </span>
                  <IconChevronDown
                    className={cn(
                      'h-4 w-4 shrink-0 transition-[transform,color] duration-200 [transition-timing-function:var(--ease-brand)]',
                      open ? 'rotate-180 text-accent' : 'text-muted-2 group-hover:text-accent',
                    )}
                    aria-hidden
                  />
                </button>

                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                      transition={{ duration: dur.fast, ease }}
                      className="overflow-hidden"
                    >
                      <p className="max-content-w pl-4.5 pt-1.5 text-body text-muted">{row.body}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            )
          })}
        </ul>
      </Reveal>

      <Reveal delay={0.1} className="relative">
        <div className="relative z-0 overflow-hidden rounded-lg bg-white p-3 shadow-[0_16px_40px_rgba(0,0,0,.1)]">
          <img
            src="https://picsum.photos/seed/omahpala-why-farmer/900/1000"
            alt=""
            loading="lazy"
            className="aspect-[9/10] w-full rounded-md object-cover"
          />
          <IconSparkle className="absolute bottom-8 right-5 h-4 w-4 text-white/80" aria-hidden />
        </div>
        <div className="absolute inset-x-10 -bottom-6 z-10 flex justify-center sm:inset-x-14">
          <LinkButton
            to="/kebun"
            variant="primary"
            className="w-full justify-center border-2 border-white shadow-[0_12px_30px_rgba(0,0,0,.18)]"
          >
            {t('home.whyCta')}
          </LinkButton>
        </div>
      </Reveal>
    </div>
  )
}
