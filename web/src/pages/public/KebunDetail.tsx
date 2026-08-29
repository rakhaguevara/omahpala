import type { SyntheticEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useParams } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Badge } from '@/components/ui/Badge'
import { LinkButton } from '@/components/ui/Button'
import { IconCalendar } from '@/components/ui/Icons'
import { Reveal } from '@/components/motion/Reveal'
import { Stagger, StaggerItem } from '@/components/motion/Stagger'
import { ProductGrid } from '@/components/blocks/ProductGrid'
import { Seo } from '@/components/layout/Seo'
import { breadcrumbJsonLd } from '@/lib/seo'
import { useFarmers, usePlots, useProducts } from '@/lib/useEntities'
import { useLocale } from '@/lib/useLocale'
import { cn, commodityLabel, monthShort, plotPlaceholder } from '@/lib/utils'
import { statusKey, statusTone } from '@/lib/plotStatus'
import type { Farmer } from '@/types'

function fallbackToPlaceholder(seed: string) {
  return (e: SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.onerror = null
    e.currentTarget.src = plotPlaceholder(seed)
  }
}

const ALL_MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

/** Detail lahan — mirip layout detail produk (PRD P-03..P-07), plus daftar penanam, kalender
 * tanam/panen, dan produk yang dihasilkan dari lahan ini. Halaman terpisah (bukan modal) supaya
 * bisa di-bookmark, dibagikan, dan diberi SEO sendiri. */
export default function KebunDetail() {
  const { t } = useTranslation()
  const { locale } = useLocale()
  const { code } = useParams<{ code: string }>()
  const { items: plots } = usePlots()
  const { items: farmers } = useFarmers()
  const { items: products } = useProducts()

  const plot = plots.find((p) => p.code.toLowerCase() === code?.toLowerCase())

  if (!plot) {
    return <Navigate to="/kebun" replace />
  }

  const description = locale === 'id' ? plot.descriptionId : plot.descriptionEn
  const growers = plot.farmerIds
    .map((id) => farmers.find((f) => f.id === id))
    .filter((f): f is Farmer => Boolean(f))
  const plotProducts = products.filter((p) => p.plotId === plot.id && p.isActive)

  return (
    <>
      <Seo
        title={`${plot.name} — ${t('common.brand')}`}
        description={description}
        path={`/kebun/${plot.code.toLowerCase()}`}
        image={plot.photo}
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'Place',
            name: plot.name,
            description,
            geo: { '@type': 'GeoCoordinates', latitude: plot.lat, longitude: plot.lng },
          },
          breadcrumbJsonLd([
            { name: t('common.brand'), path: '/' },
            { name: t('kebun.title'), path: '/kebun' },
            { name: plot.name, path: `/kebun/${plot.code.toLowerCase()}` },
          ]),
        ]}
      />

      <Section tone="paper" className="pt-36">
        <Container>
          <LinkButton to="/kebun" variant="ghost" size="sm" className="mb-8">
            {t('common.backToKebun')}
          </LinkButton>

          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <Reveal className="flex flex-col gap-4">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-surface">
                <img
                  src={plot.photo}
                  alt={plot.name}
                  onError={fallbackToPlaceholder(plot.id)}
                  className="h-full w-full object-cover"
                />
                <span className="absolute left-4 bottom-4 rounded-pill bg-ink/70 px-3 py-1 text-meta text-white backdrop-blur-sm">
                  {plot.code}
                </span>
              </div>
            </Reveal>

            <Reveal delay={0.08} className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-eyebrow text-muted-2">
                    {plot.commodities.map((id) => commodityLabel(id, locale)).join(', ')}
                  </span>
                  <Badge tone={statusTone[plot.status]}>{t(`kebun.${statusKey[plot.status]}`)}</Badge>
                </div>
                <h1 className="text-display-l text-balance">{plot.name}</h1>
                <p className="text-body-l max-content-w text-muted">{description}</p>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-md bg-surface-2 p-6">
                <SpecRow label={t('kebun.plotArea')} value={`${plot.areaM2.toLocaleString('id-ID')} m²`} />
                <SpecRow
                  label={t('kebun.plotCommodities')}
                  value={plot.commodities.map((id) => commodityLabel(id, locale)).join(', ')}
                />
              </div>

              {growers.length > 0 && (
                <div className="flex flex-col gap-3">
                  <p className="text-meta text-muted-2">{t('kebun.plotGrowersTitle')}</p>
                  <Stagger className="flex flex-col gap-3" stagger={0.06}>
                    {growers.map((farmer) => (
                      <StaggerItem key={farmer.id}>
                        <div className="flex items-center gap-3 rounded-md border border-line p-3">
                          <img
                            src={farmer.photo}
                            alt={farmer.name}
                            onError={fallbackToPlaceholder(farmer.id)}
                            className="h-12 w-12 shrink-0 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-label text-ink">{farmer.name}</p>
                            <p className="text-meta text-muted">{farmer.role}</p>
                          </div>
                        </div>
                      </StaggerItem>
                    ))}
                  </Stagger>
                </div>
              )}
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* Kalender tanam & panen — bantu buyer mengira-ngira kapan stok tersedia */}
      {plot.calendar.length > 0 && (
        <Section tone="surface">
          <Container>
            <Reveal className="mb-8 flex flex-col gap-2">
              <h2 className="flex items-center gap-2.5 text-display-m">
                <IconCalendar className="h-6 w-6 text-accent-ink" aria-hidden />
                {t('kebun.calendarTitle')}
              </h2>
              <p className="text-meta text-muted-2">{t('kebun.calendarHint')}</p>
            </Reveal>

            <Reveal className="flex flex-col gap-8 rounded-lg bg-white p-6 sm:p-7.5">
              <div className="flex flex-wrap items-center gap-5 text-meta text-muted">
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm bg-accent-soft" aria-hidden />
                  {t('kebun.calendarPlanting')}
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm bg-accent" aria-hidden />
                  {t('kebun.calendarHarvest')}
                </span>
              </div>

              <div className="flex flex-col gap-6">
                {plot.calendar.map((entry) => (
                  <div key={entry.commodityId} className="flex flex-col gap-2">
                    <p className="text-label text-ink">{commodityLabel(entry.commodityId, locale)}</p>
                    <div className="grid grid-cols-12 gap-1 sm:gap-1.5">
                      {ALL_MONTHS.map((month) => {
                        const isHarvest = entry.harvestMonths.includes(month)
                        const isPlanting = entry.plantingMonths.includes(month)
                        return (
                          <div key={month} className="flex flex-col items-center gap-1.5">
                            <div
                              className={cn(
                                'h-7 w-full rounded-sm sm:h-9',
                                isHarvest ? 'bg-accent' : isPlanting ? 'bg-accent-soft' : 'border border-line bg-surface-2',
                              )}
                              aria-hidden
                            />
                            <span className="text-[10px] text-muted-2 sm:text-meta">{monthShort(month, locale)}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </Container>
        </Section>
      )}

      {/* Produk dari lahan ini — traceability, terhubung ke halaman produk */}
      <Section tone="paper">
        <Container>
          <Reveal className="mb-8">
            <h2 className="text-display-m">{t('kebun.plotProducts')}</h2>
          </Reveal>
          {plotProducts.length > 0 ? (
            <ProductGrid products={plotProducts} />
          ) : (
            <p className="text-body text-muted">{t('kebun.productsEmpty')}</p>
          )}
        </Container>
      </Section>
    </>
  )
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 text-meta text-muted">{label}</p>
      <p className="text-body text-ink">{value}</p>
    </div>
  )
}
