import { useTranslation } from 'react-i18next'
import { useScroll, useTransform, motion, useReducedMotion } from 'framer-motion'
import { useRef } from 'react'
import { Eyebrow } from '@/components/ui/Badge'
import { LinkButton } from '@/components/ui/Button'
import { CountUp } from '@/components/motion/CountUp'
import { usePageContent } from '@/lib/usePageContent'
import { heroEnter } from '@/lib/motion'
import { programStats } from '@/data/program'

/**
 * Hero — PRD H-01 + H-02. Layout mengikuti referensi Framer: konten rata bawah, judul di
 * kolom kiri, kartu capaian di kolom kanan yang MENEMPEL/overlap ke section berikutnya
 * (bukan berhenti di dalam hero) — di desktop maupun mobile. Latar (gambar+overlay) tetap
 * di-clip lewat wrapper terpisah supaya kartu tidak ikut terpotong overflow-hidden.
 */
export function Hero() {
  const { t } = useTranslation()
  const eyebrow = usePageContent('hero.eyebrow')
  const title = usePageContent('hero.title')
  const subtitle = usePageContent('hero.subtitle')
  const cardTitle = t('home.heroCardTitle')

  const sectionRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })
  // Parallax maksimal 12% — design.md §6
  const y = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '12%'])

  const screened = programStats.find((s) => s.id === 's-1')
  const plots = programStats.find((s) => s.id === 's-2')

  return (
    <section ref={sectionRef} className="relative flex min-h-[100vh] items-end bg-ink">
      {/* Latar — di-clip terpisah agar kartu di bawah bisa "menempel" keluar batas section */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div aria-hidden style={{ y }} className="absolute inset-0 -top-[12%] bg-cover bg-center">
          <img
            src="https://picsum.photos/seed/omahpala-hero/2000/1400"
            alt=""
            className="h-full w-full scale-110 object-cover"
          />
        </motion.div>
        {/* Overlay flat, bukan gradient — persis referensi (ink @ 60% opacity) */}
        <div className="absolute inset-0 bg-ink/60" aria-hidden />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-col gap-10 px-6 pt-40 lg:flex-row lg:items-end lg:justify-between lg:gap-8 lg:px-7.5">
        {/* Kolom kiri — judul, subjudul, CTA. Padding bawah sendiri, tidak ikut ketarik kartu. */}
        <motion.div
          initial={reduce ? undefined : 'hidden'}
          animate={reduce ? undefined : 'visible'}
          variants={heroEnter}
          className="flex max-w-xl flex-col gap-6 pb-16 lg:pb-24"
        >
          <Eyebrow tone="white">{eyebrow}</Eyebrow>
          <h1 className="text-display-xl text-balance text-white">{title}</h1>
          <p className="text-body-l max-content-w text-white/85">{subtitle}</p>
          <div className="mt-2">
            <LinkButton to="/produk" variant="primary">
              {t('home.heroCtaPrimary')}
            </LinkButton>
          </div>
        </motion.div>

        {/* Kolom kanan — kartu capaian, sengaja ditarik turun (margin negatif) supaya
            menempel/overlap ke section berikutnya, konsisten di desktop & mobile. */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4, ease: [0.44, 0, 0.56, 1] }}
          className="-mb-20 w-full max-w-sm shrink-0 self-end overflow-hidden rounded-lg bg-white shadow-[0_24px_60px_rgba(0,0,0,.2)] sm:-mb-24 lg:-mb-28"
        >
          <div className="p-5 pb-4">
            <p className="text-meta text-ink">{cardTitle}</p>
          </div>
          <img
            src="https://picsum.photos/seed/omahpala-hero-card/700/500"
            alt={cardTitle}
            loading="lazy"
            className="aspect-video w-full object-cover"
          />
          <div className="flex divide-x divide-dashed divide-line px-5 py-5">
            <div className="flex-1 pr-4">
              <p className="text-display-m tabular-nums text-ink">
                <CountUp value={screened?.value ?? 0} />
              </p>
              <p className="text-meta text-muted">{t('home.heroCardStat1Label')}</p>
            </div>
            <div className="flex-1 pl-4">
              <p className="text-display-m tabular-nums text-ink">
                <CountUp value={plots?.value ?? 0} suffix={plots?.suffix} />
              </p>
              <p className="text-meta text-muted">{t('home.heroCardStat2Label')}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
