import { useRef, type SyntheticEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { PageBanner } from '@/components/blocks/PageBanner'
import { bannerImages } from '@/lib/images'
import { Badge } from '@/components/ui/Badge'
import { Reveal } from '@/components/motion/Reveal'
import { Stagger, StaggerItem } from '@/components/motion/Stagger'
import { Seo } from '@/components/layout/Seo'
import { IconButton } from '@/components/ui/Button'
import { useFarmers, usePlots } from '@/lib/useEntities'
import { useLocale } from '@/lib/useLocale'
import { formatDate, cn, commodityLabel, plotPlaceholder } from '@/lib/utils'
import { IconArrowUpRight, IconChevronLeft, IconChevronRight } from '@/components/ui/Icons'
import { statusKey, statusTone } from '@/lib/plotStatus'
import type { Farmer, Plot } from '@/types'

/** Ganti foto yang gagal dimuat (network mati/URL rusak) dengan SVG lokal — kartu lahan tidak
 * pernah menampilkan ikon gambar rusak, baik untuk foto contoh (picsum) maupun upload admin. */
function fallbackToPlaceholder(seed: string) {
  return (e: SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.onerror = null
    e.currentTarget.src = plotPlaceholder(seed)
  }
}

/** Kebun (lahan & penanam) — PRD §7.4 K-01..K-04, traceability P-05. */
export default function Kebun() {
  const { t } = useTranslation()
  const { locale } = useLocale()
  const { items: plots } = usePlots()
  const { items: farmers } = useFarmers()
  const nutmegPlots = plots.filter((plot) => plot.commodities.includes('pala'))
  const otherPlots = plots.filter((plot) => !plot.commodities.includes('pala'))

  return (
    <>
      <Seo title={`${t('kebun.title')} — ${t('common.brand')}`} description={t('kebun.subtitle')} path="/kebun" />

      <PageBanner
        image={bannerImages.kebun}
        eyebrow={t('kebun.eyebrow')}
        title={t('kebun.title')}
        subtitle={t('kebun.subtitle')}
        crumb={t('nav.kebun')}
      />

      <Section tone="paper">
        <Container>
          {/* K-01 — pala (komoditas utama) dapat section sendiri; sisanya (jahe/kunyit/sereh/kencur/
              lainnya) digabung jadi satu section supaya lahan campuran tidak muncul berulang di
              tiap section komoditasnya. Komoditas tiap lahan tetap dijelaskan di kartunya. */}
          <h2 className="mb-5 text-title">{t('kebun.plotsTitle')}</h2>
          <div className="mb-16 flex flex-col gap-10">
            {nutmegPlots.length > 0 && (
              <div>
                <h3 className="mb-4 text-label text-muted-2">{commodityLabel('pala', locale)}</h3>
                <PlotCarousel plots={nutmegPlots} farmers={farmers} />
              </div>
            )}
            {otherPlots.length > 0 && (
              <div>
                <h3 className="mb-4 text-label text-muted-2">{t('kebun.otherCommoditiesTitle')}</h3>
                <PlotCarousel plots={otherPlots} farmers={farmers} />
              </div>
            )}
          </div>

          {/* K-02 */}
          <h2 className="mb-5 text-title">{t('kebun.farmersTitle')}</h2>
          <Stagger className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4" stagger={0.06}>
            {farmers.map((farmer) => (
              <StaggerItem key={farmer.id}>
                <FarmerCard farmer={farmer} />
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </Section>

      {/* K-04 */}
      <Section tone="surface" className="pt-0">
        <Container>
          <h2 className="mb-5 text-title">{t('kebun.mapTitle')}</h2>
          <Reveal className="overflow-hidden rounded-lg border border-line">
            <iframe
              title={t('kebun.mapTitle')}
              className="h-[420px] w-full"
              loading="lazy"
              src="https://www.openstreetmap.org/export/embed.html?bbox=110.398%2C-7.675%2C110.445%2C-7.650&layer=mapnik&marker=-7.6631%2C110.4203"
            />
          </Reveal>
        </Container>
      </Section>
    </>
  )
}

function PlotCarousel({ plots, farmers }: { plots: Plot[]; farmers: Farmer[] }) {
  const { t } = useTranslation()
  const scrollerRef = useRef<HTMLDivElement>(null)

  function scroll(direction: 1 | -1) {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: 'smooth' })
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        <Stagger className="flex gap-4" stagger={0.06}>
          {plots.map((plot) => {
            const growerNames = plot.farmerIds
              .map((id) => farmers.find((f) => f.id === id)?.name)
              .filter((name): name is string => Boolean(name))
            return (
              <StaggerItem key={plot.id} className="w-[200px] shrink-0 snap-start sm:w-[228px]">
                <PlotCard plot={plot} growerNames={growerNames} />
              </StaggerItem>
            )
          })}
        </Stagger>
      </div>

      {plots.length > 1 && (
        <div className="flex items-center justify-end gap-2">
          <IconButton type="button" aria-label={t('kebun.plotsPrev')} onClick={() => scroll(-1)}>
            <IconChevronLeft className="h-5 w-5" />
          </IconButton>
          <IconButton type="button" aria-label={t('kebun.plotsNext')} onClick={() => scroll(1)}>
            <IconChevronRight className="h-5 w-5" />
          </IconButton>
        </div>
      )}
    </div>
  )
}

function PlotCard({ plot, growerNames }: { plot: Plot; growerNames: string[] }) {
  const { t } = useTranslation()
  const { locale } = useLocale()

  return (
    <Link
      to={`/kebun/${plot.code.toLowerCase()}`}
      className={cn(
        'group flex h-full w-full flex-col overflow-hidden rounded-md border border-transparent bg-surface-2 text-left shadow-[0_1px_2px_rgba(0,0,0,.04)] transition-shadow duration-200 hover:shadow-[0_8px_32px_rgba(0,0,0,.08)]',
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface">
        <img
          src={plot.photo}
          alt={plot.name}
          loading="lazy"
          onError={fallbackToPlaceholder(plot.id)}
          className="h-full w-full object-cover transition-transform duration-400 [transition-timing-function:var(--ease-brand)] group-hover:scale-[1.03]"
        />
        <span className="absolute left-2.5 top-2.5 rounded-pill bg-ink/70 px-2.5 py-1 text-meta text-white backdrop-blur-sm">
          {plot.code}
        </span>
        <div className="absolute right-2.5 top-2.5 rounded-pill bg-white/90 p-0.5 shadow-[0_1px_4px_rgba(0,0,0,.16)] backdrop-blur-sm">
          <Badge tone={statusTone[plot.status]}>{t(`kebun.${statusKey[plot.status]}`)}</Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <p className="text-label text-ink">{plot.name}</p>
        <dl className="grid grid-cols-2 gap-1.5 text-meta">
          <div>
            <dt className="text-muted-2">{t('kebun.plotArea')}</dt>
            <dd className="text-ink">{plot.areaM2.toLocaleString('id-ID')} m²</dd>
          </div>
          <div>
            <dt className="text-muted-2">{t('kebun.plotFarmer')}</dt>
            <dd className="truncate text-ink">{growerNames.join(', ') || '—'}</dd>
          </div>
        </dl>
        <p className="text-meta text-muted">
          {plot.commodities.map((id) => commodityLabel(id, locale)).join(', ')}
        </p>
        <span className="mt-auto flex items-center gap-1.5 pt-1 text-meta font-medium text-ink">
          {t('kebun.viewDetail')}
          <IconArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 [transition-timing-function:var(--ease-brand)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  )
}

function FarmerCard({ farmer }: { farmer: Farmer }) {
  const { t } = useTranslation()
  const { locale } = useLocale()

  return (
    <div className="flex flex-col overflow-hidden rounded-md bg-surface-2">
      <img
        src={farmer.photo}
        alt={farmer.name}
        loading="lazy"
        onError={fallbackToPlaceholder(farmer.id)}
        className="aspect-[4/5] w-full object-cover"
      />
      <div className="flex flex-col gap-1 p-4 sm:p-5">
        <p className="text-title max-sm:text-sm max-sm:font-semibold max-sm:leading-snug">{farmer.name}</p>
        <p className="text-meta text-muted">{farmer.role}</p>
        <p className="text-meta text-muted-2">
          {t('kebun.farmerJoined')} {formatDate(farmer.joinedAt, locale)}
        </p>
        {farmer.plotIds.length > 0 && (
          <p className="text-meta text-muted-2">
            {t('kebun.farmerPlots')} · {farmer.plotIds.length}
          </p>
        )}
      </div>
    </div>
  )
}
