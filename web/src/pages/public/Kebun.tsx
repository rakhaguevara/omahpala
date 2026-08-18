import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Eyebrow, Badge } from '@/components/ui/Badge'
import { Reveal } from '@/components/motion/Reveal'
import { Stagger, StaggerItem } from '@/components/motion/Stagger'
import { Seo } from '@/components/layout/Seo'
import { useFarmers, usePlots, useProducts } from '@/lib/useEntities'
import { useLocale } from '@/lib/useLocale'
import { formatDate, cn, commodityLabel } from '@/lib/utils'
import { commoditiesSeed } from '@/data/commodities'
import type { Plot, PlotStatus } from '@/types'

const statusKey: Record<PlotStatus, string> = {
  aktif: 'statusAktif',
  panen: 'statusPanen',
  istirahat: 'statusIstirahat',
}

const statusTone: Record<PlotStatus, 'accent' | 'pending' | 'neutral'> = {
  aktif: 'accent',
  panen: 'pending',
  istirahat: 'neutral',
}

/** Kebun (lahan & penanam) — PRD §7.4 K-01..K-04, traceability P-05. */
export default function Kebun() {
  const { t } = useTranslation()
  const { locale } = useLocale()
  const { items: plots } = usePlots()
  const { items: farmers } = useFarmers()
  const { items: products } = useProducts()
  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null)

  const selectedPlot = plots.find((p) => p.id === selectedPlotId) ?? null
  const selectedFarmer = selectedPlot ? farmers.find((f) => f.id === selectedPlot.farmerId) : null
  const plotProducts = useMemo(
    () => (selectedPlot ? products.filter((p) => p.plotId === selectedPlot.id) : []),
    [selectedPlot, products],
  )

  return (
    <>
      <Seo title={`${t('kebun.title')} — ${t('common.brand')}`} description={t('kebun.subtitle')} path="/kebun" />

      <Section tone="paper" className="pt-36">
        <Container>
          <Reveal className="mx-auto mb-12 flex max-w-2xl flex-col items-center gap-4 text-center">
            <Eyebrow className="justify-center">{t('kebun.eyebrow')}</Eyebrow>
            <h1 className="text-display-l text-balance">{t('kebun.title')}</h1>
            <p className="text-body-l max-content-w text-muted">{t('kebun.subtitle')}</p>
          </Reveal>

          {/* K-01 — dikelompokkan per komoditas; lahan campuran muncul di tiap section komoditasnya */}
          <h2 className="mb-5 text-title">{t('kebun.plotsTitle')}</h2>
          <div className="mb-6 flex flex-col gap-10">
            {commoditiesSeed.map((commodity) => {
              const commodityPlots = plots.filter((plot) => plot.commodities.includes(commodity.id))
              if (commodityPlots.length === 0) return null
              return (
                <div key={commodity.id}>
                  <h3 className="mb-4 text-label text-muted-2">{commodityLabel(commodity.id, locale)}</h3>
                  <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" stagger={0.06}>
                    {commodityPlots.map((plot) => {
                      const farmer = farmers.find((f) => f.id === plot.farmerId)
                      const isSelected = plot.id === selectedPlotId
                      return (
                        <StaggerItem key={plot.id}>
                          <PlotCard
                            plot={plot}
                            farmerName={farmer?.name}
                            isSelected={isSelected}
                            onToggle={() => setSelectedPlotId(isSelected ? null : plot.id)}
                          />
                        </StaggerItem>
                      )
                    })}
                  </Stagger>
                </div>
              )
            })}
          </div>

          {/* K-03 */}
          {selectedPlot && (
            <Reveal className="mb-16 rounded-md bg-ink p-7.5 text-white">
              <p className="mb-4 text-meta text-white/70">
                {selectedPlot.code} · {selectedPlot.name}
              </p>
              <div className="grid gap-6 sm:grid-cols-2">
                {selectedFarmer && (
                  <div className="flex items-center gap-4">
                    <img
                      src={selectedFarmer.photo}
                      alt={selectedFarmer.name}
                      className="h-16 w-16 shrink-0 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-label">{selectedFarmer.name}</p>
                      <p className="text-meta text-white/70">{selectedFarmer.role}</p>
                    </div>
                  </div>
                )}
                <div>
                  <p className="mb-2 text-meta text-white/70">{t('kebun.plotProducts')}</p>
                  {plotProducts.length > 0 ? (
                    <ul className="flex flex-wrap gap-2">
                      {plotProducts.map((p) => (
                        <li key={p.id}>
                          <Link
                            to={`/produk/${p.slug}`}
                            className="rounded-pill border border-white/30 px-3 py-1.5 text-meta text-white hover:bg-white/10"
                          >
                            {locale === 'id' ? p.nameId : p.nameEn}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-meta text-white/60">—</p>
                  )}
                </div>
              </div>
            </Reveal>
          )}

          {/* K-02 */}
          <h2 className="mb-5 text-title">{t('kebun.farmersTitle')}</h2>
          <Stagger className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4" stagger={0.06}>
            {farmers.map((farmer) => (
              <StaggerItem key={farmer.id}>
                <div className="flex flex-col overflow-hidden rounded-md bg-surface-2">
                  <img
                    src={farmer.photo}
                    alt={farmer.name}
                    loading="lazy"
                    className="aspect-[4/5] w-full object-cover"
                  />
                  <div className="flex flex-col gap-1 p-5">
                    <p className="text-title">{farmer.name}</p>
                    <p className="text-meta text-muted">{farmer.role}</p>
                    <p className="text-meta text-muted-2">
                      {t('kebun.farmerJoined')} {formatDate(farmer.joinedAt, locale)}
                    </p>
                  </div>
                </div>
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

function PlotCard({
  plot,
  farmerName,
  isSelected,
  onToggle,
}: {
  plot: Plot
  farmerName: string | undefined
  isSelected: boolean
  onToggle: () => void
}) {
  const { t } = useTranslation()
  const { locale } = useLocale()

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isSelected}
      className={cn(
        'flex w-full flex-col gap-3 rounded-md border p-6 text-left transition-colors duration-200',
        isSelected ? 'border-ink bg-surface-2' : 'border-line bg-white hover:border-ink/30',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-meta text-muted-2">{plot.code}</p>
          <p className="text-title">{plot.name}</p>
        </div>
        <Badge tone={statusTone[plot.status]}>{t(`kebun.${statusKey[plot.status]}`)}</Badge>
      </div>
      <dl className="grid grid-cols-2 gap-2 text-meta">
        <div>
          <dt className="text-muted-2">{t('kebun.plotArea')}</dt>
          <dd className="text-ink">{plot.areaM2.toLocaleString('id-ID')} m²</dd>
        </div>
        <div>
          <dt className="text-muted-2">{t('kebun.plotFarmer')}</dt>
          <dd className="text-ink">{farmerName ?? '—'}</dd>
        </div>
      </dl>
      <p className="text-meta text-muted">
        {t('kebun.plotCommodities')}: {plot.commodities.map((id) => commodityLabel(id, locale)).join(', ')}
      </p>
    </button>
  )
}
