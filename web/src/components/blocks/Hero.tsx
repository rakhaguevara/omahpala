import { useTranslation } from 'react-i18next'
import { useScroll, useTransform, motion, useReducedMotion, AnimatePresence } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { LinkButton } from '@/components/ui/Button'
import { TextEffect } from '@/components/motion/TextEffect'
import { CountUp } from '@/components/motion/CountUp'
import { IconArrowUpRight, IconLeaf, IconSparkle, IconStorefront } from '@/components/ui/Icons'
import { usePageContent } from '@/lib/usePageContent'
import { useLocale } from '@/lib/useLocale'
import { useProducts, usePlots } from '@/lib/useEntities'
import { heroEnter } from '@/lib/motion'
import { programPillars, programStats } from '@/data/program'
import type { StatItem } from '@/types'

// Foto + caption header berganti bareng tiap 5 detik — PRD H-01. Produk (foto pertama tiap produk
// aktif) diselang-seling dengan kegiatan lima pilar program supaya kartu tidak melulu satu topik.
const SLIDE_INTERVAL_MS = 5000

interface HeroSlide {
  id: string
  image: string
  title: string
  kind: 'product' | 'activity'
  href: string
}

/**
 * Hero — PRD H-01 + H-02. Layout referensi: eyebrow berbentuk pill kaca (bukan cuma titik+teks),
 * judul + subjudul + dua CTA di kolom kiri, kartu di kolom kanan yang tetap DI DALAM batas foto
 * hero — tidak lagi ditarik lewat margin negatif ke section berikutnya (itu bikin kartu kepotong
 * separuh foto, separuh putih). Jarak bawah kartu (mb-[88px]/[120px]) SENGAJA disamakan angkanya
 * dengan padding bawah kolom teks (pb-[88px]/[120px]) supaya kartu dan baris tombol CTA berhenti
 * di ketinggian yang sama — kalau salah satu diubah, ubah keduanya bareng.
 *
 * Kartu: teks yang BERGANTI per slide ada di HEADER (icon + nama produk/pilar + kategori, tombol
 * panah ikut mengarah ke halaman produk/program yang relevan) — sinkron dengan foto di bawahnya.
 * Kotak data paling bawah TIDAK ikut berganti — selalu menampilkan 3 capaian program sekaligus
 * (KK menanam TOGA, jumlah lahan/petak dari usePlots, produk olahan), seperti StatBand di
 * Beranda/Program tapi versi ringkas 3 kolom.
 */
export function Hero() {
  const { t } = useTranslation()
  const { locale } = useLocale()
  const eyebrow = usePageContent('hero.eyebrow')
  const title = usePageContent('hero.title')
  const subtitle = usePageContent('hero.subtitle')
  const { items: products } = useProducts()
  const { items: plots } = usePlots()

  const sectionRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })
  // Parallax maksimal 12% — design.md §6
  const y = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '12%'])

  const slides = useMemo<HeroSlide[]>(() => {
    const productSlides: HeroSlide[] = products
      .filter((p) => p.isActive)
      .slice(0, 4)
      .map((p) => ({
        id: `product-${p.id}`,
        image: p.images[0],
        title: locale === 'id' ? p.nameId : p.nameEn,
        kind: 'product',
        href: `/produk/${p.slug}`,
      }))
    const activitySlides: HeroSlide[] = programPillars.map((pillar) => ({
      id: `pillar-${pillar.id}`,
      image: pillar.image,
      title: locale === 'id' ? pillar.titleId : pillar.titleEn,
      kind: 'activity',
      href: '/program',
    }))
    // Selang-seling produk/kegiatan, bukan digabung mentah — biar tidak dua foto produk beruntun.
    const interleaved: HeroSlide[] = []
    const max = Math.max(productSlides.length, activitySlides.length)
    for (let i = 0; i < max; i++) {
      if (productSlides[i]) interleaved.push(productSlides[i])
      if (activitySlides[i]) interleaved.push(activitySlides[i])
    }
    return interleaved
  }, [products, locale])

  const [activeSlide, setActiveSlide] = useState(0)
  const slide = slides[activeSlide % (slides.length || 1)]

  useEffect(() => {
    if (reduce || slides.length <= 1) return
    const id = setInterval(() => {
      setActiveSlide((i) => (i + 1) % slides.length)
    }, SLIDE_INTERVAL_MS)
    return () => clearInterval(id)
  }, [reduce, slides.length])

  // 3 capaian program tetap (tidak ikut berganti) — KK menanam TOGA (s-1) & produk olahan (s-3)
  // dari programStats, plus jumlah lahan/petak SUNGGUHAN dari usePlots (bukan angka karangan).
  const highlightStats = useMemo<StatItem[]>(() => {
    const householdStat = programStats.find((s) => s.id === 's-1')
    const productStat = programStats.find((s) => s.id === 's-3')
    const plotStat: StatItem = {
      id: 'plots',
      value: plots.length,
      suffix: '',
      labelId: 'petak lahan terpetakan',
      labelEn: 'mapped plots',
    }
    return [householdStat, plotStat, productStat].filter((s): s is StatItem => Boolean(s))
  }, [plots])

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
        {/* Transisi ke section putih berikutnya — bukan potongan tajam foto→putih, tapi
            glow putih lembut yang menyatu di tepi bawah. Hanya di sini gradient dipakai
            sebagai fade seam, bukan sebagai latar section penuh (design.md §8). */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-white sm:h-40 lg:h-56"
        />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-col gap-10 px-6 pt-40 lg:flex-row lg:items-end lg:justify-between lg:gap-8 lg:px-7.5">
        {/* Kolom kiri — eyebrow pill, judul, subjudul, dua CTA. Padding bawah sendiri, tidak ikut ketarik kartu. */}
        <motion.div
          initial={reduce ? undefined : 'hidden'}
          animate={reduce ? undefined : 'visible'}
          variants={heroEnter}
          className="flex max-w-xl flex-col gap-6 pb-[88px] lg:pb-[120px]"
        >
          <div className="flex w-fit items-center gap-2 rounded-pill border border-white/20 bg-white/10 px-4 py-2 text-eyebrow text-white/90 backdrop-blur-md">
            <IconLeaf className="h-3.5 w-3.5 text-accent" />
            {eyebrow}
          </div>
          <TextEffect per="word" as="h1" preset="blur" className="text-display-xl text-balance text-white">
            {title}
          </TextEffect>
          <TextEffect per="char" as="p" preset="fade" className="text-body-l max-content-w text-white/85">
            {subtitle}
          </TextEffect>
          <div className="mt-2 flex flex-wrap gap-3">
            <LinkButton to="/program" variant="primary">
              {t('home.heroCtaPrimary')}
            </LinkButton>
            <Link
              to="/produk"
              className="inline-flex items-center justify-center gap-2 rounded-pill border border-white/40 bg-white/5 px-6 py-3 text-label text-white backdrop-blur-md transition-[transform,background-color] duration-200 [transition-timing-function:var(--ease-brand)] hover:-translate-y-px hover:bg-white/15"
            >
              <IconStorefront className="h-4 w-4" />
              {t('home.heroCtaSecondary')}
            </Link>
          </div>
        </motion.div>

        {/* Kolom kanan — kartu info kaca (glassmorphism), tetap di dalam batas hero/foto,
            sejajar-bawah dengan kolom teks. TIDAK menempel/overlap ke section berikutnya lagi
            (revisi: sebelumnya ditarik lewat margin negatif dan malah jatuh di antara dua
            section — foto di atas, putih di bawah). */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4, ease: [0.44, 0, 0.56, 1] }}
          className="mb-[88px] w-full max-w-sm shrink-0 self-end rounded-[16px] border border-white/20 bg-white/10 p-5 shadow-[0_24px_60px_rgba(0,0,0,.25)] backdrop-blur-xl lg:mb-[120px]"
        >
          {/* Jarak antar header/foto/kotak data memakai gap-3 — sama dengan jarak antar tombol CTA
              di kolom kiri, supaya ritme spacing-nya konsisten satu hero. */}
          <div className="flex flex-col gap-3">
            {/* Header — TEKS YANG BERGANTI per slide, sinkron dengan foto di bawahnya. */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-white">
                  <IconSparkle className="h-5 w-5" />
                </span>
                <AnimatePresence mode="wait">
                  {slide && (
                    <motion.div
                      key={slide.id}
                      initial={reduce ? false : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduce ? undefined : { opacity: 0, y: -6 }}
                      transition={{ duration: 0.3, ease: [0.44, 0, 0.56, 1] }}
                    >
                      <p className="line-clamp-1 text-label text-white">{slide.title}</p>
                      <p className="mt-1 text-meta text-white/70">
                        {slide.kind === 'product'
                          ? locale === 'id'
                            ? 'Produk'
                            : 'Product'
                          : locale === 'id'
                            ? 'Kegiatan program'
                            : 'Program activity'}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {slide && (
                <Link
                  to={slide.href}
                  aria-label={slide.title}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-accent-ink transition-[transform,background-color] duration-200 [transition-timing-function:var(--ease-brand)] hover:-translate-y-px hover:bg-[#74dd50]"
                >
                  <IconArrowUpRight className="h-5 w-5" />
                </Link>
              )}
            </div>

            {/* Foto slideshow — dipendekkan (h-36), sinkron dengan header di atasnya. */}
            <div className="relative h-36 overflow-hidden rounded-[16px] bg-white shadow-[0_1px_2px_rgba(0,0,0,.06)]">
              <AnimatePresence mode="wait">
                {slide && (
                  <motion.img
                    key={slide.id}
                    src={slide.image}
                    alt={slide.title}
                    initial={reduce ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={reduce ? undefined : { opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.44, 0, 0.56, 1] }}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Kotak data — putih SOLID, TIDAK ikut berganti. 3 capaian program sekaligus,
                dipisah garis putus-putus seperti StatBand — dikecilkan (text-title, p-2.5,
                label line-clamp) supaya tingginya dekat dengan foto di atasnya, bukan lebih
                tinggi dari foto seperti sebelumnya. */}
            <div className="flex divide-x divide-dashed divide-line rounded-md bg-white p-2.5 shadow-[0_1px_2px_rgba(0,0,0,.06)]">
              {highlightStats.map((stat) => (
                <div key={stat.id} className="flex-1 px-1.5 text-center first:pl-0 last:pr-0">
                  <p className="text-title tabular-nums text-ink">
                    {stat.prefix}
                    <CountUp value={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-meta text-muted">
                    {locale === 'id' ? stat.labelId : stat.labelEn}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
