import { lazy, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Eyebrow } from '@/components/ui/Badge'
import { Reveal } from '@/components/motion/Reveal'
import { ProductGrid } from '@/components/blocks/ProductGrid'
import { Seo } from '@/components/layout/Seo'
import { useProducts } from '@/lib/useEntities'
import { useLocale } from '@/lib/useLocale'
import { cn } from '@/lib/utils'
import { commoditiesSeed } from '@/data/commodities'
import { IconCheck, IconFilter } from '@/components/ui/Icons'
import type { CommodityId, Product } from '@/types'

// gsap nambah ~30 KB gzip ke bundle — code-split di sini supaya tidak ikut blocking parse
// bundle utama (Catalog eager-loaded di App.tsx), konsisten dengan alasan Antigravity di-lazy.
const BounceCards = lazy(() => import('@/components/motion/BounceCards'))

const OTHER_PLANT_COMMODITIES: CommodityId[] = ['jahe', 'kunyit', 'sereh', 'kencur']

type SortKey = 'terbaru' | 'harga-rendah' | 'harga-tinggi'

function sortProducts(products: Product[], sort: SortKey): Product[] {
  const sorted = [...products]
  if (sort === 'harga-rendah') sorted.sort((a, b) => (a.priceIdr ?? Infinity) - (b.priceIdr ?? Infinity))
  else if (sort === 'harga-tinggi') sorted.sort((a, b) => (b.priceIdr ?? -Infinity) - (a.priceIdr ?? -Infinity))
  else sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  return sorted
}

/**
 * Katalog produk — PRD P-01 (grid kartu) & P-02 (kategorisasi, sekarang per komoditas).
 * Tiga section tetap, olahan pala diprioritaskan sebagai komoditas unggulan: Pala -> tanaman
 * TOGA lain -> produk lain dari Desa Wonokerto yang belum masuk komoditas manapun. Tiap section
 * punya satu tombol ikon filter/urutkan di kanan judul (bukan bubble di layout) — section
 * tanaman lain dapat tambahan filter per jenis tanaman karena isinya lebih dari satu komoditas.
 */
export default function Catalog() {
  const { t } = useTranslation()
  const { items: products } = useProducts()

  const active = useMemo(() => products.filter((p) => p.isActive), [products])
  const palaProducts = useMemo(() => active.filter((p) => p.commodityId === 'pala'), [active])
  const otherPlantProducts = useMemo(
    () => active.filter((p) => OTHER_PLANT_COMMODITIES.includes(p.commodityId)),
    [active],
  )
  const otherWonokertoProducts = useMemo(() => active.filter((p) => p.commodityId === 'lainnya'), [active])
  // Cuplikan foto produk buat BounceCards — pakai foto produk asli (bukan stok foto acak) supaya
  // langsung menunjukkan hasil olahan tani sungguhan, bukan dekorasi lepas dari isi katalog.
  const showcaseImages = useMemo(() => active.slice(0, 5).map((p) => p.images[0]), [active])

  return (
    <>
      <Seo title={`${t('catalog.title')} — ${t('common.brand')}`} description={t('catalog.subtitle')} path="/produk" />
      <Section tone="paper" className="pt-36">
        <Container>
          <Reveal className="mx-auto mb-4 flex max-w-2xl flex-col items-center gap-4 text-center">
            <Eyebrow className="justify-center">{t('catalog.eyebrow')}</Eyebrow>
            <h1 className="text-display-l text-balance">{t('catalog.title')}</h1>
            <p className="text-body-l max-content-w text-muted">{t('catalog.subtitle')}</p>
          </Reveal>

          {showcaseImages.length > 0 && (
            <div className="mx-auto mb-4 flex h-[280px] justify-center">
              <Suspense fallback={null}>
                <BounceCards
                  images={showcaseImages}
                  containerWidth={560}
                  containerHeight={280}
                  animationDelay={0.3}
                  animationStagger={0.08}
                  transformStyles={[
                    'rotate(8deg) translate(-160px)',
                    'rotate(-4deg) translate(-80px)',
                    'rotate(3deg)',
                    'rotate(4deg) translate(80px)',
                    'rotate(-8deg) translate(160px)',
                  ]}
                  enableHover
                />
              </Suspense>
            </div>
          )}

          <div className="flex flex-col gap-14">
            <CatalogSection
              title={t('catalog.sectionPalaTitle')}
              description={t('catalog.sectionPalaDesc')}
              products={palaProducts}
            />
            <CatalogSection
              title={t('catalog.sectionOtherPlantsTitle')}
              description={t('catalog.sectionOtherPlantsDesc')}
              products={otherPlantProducts}
              commodityOptions={OTHER_PLANT_COMMODITIES}
            />
            <CatalogSection
              title={t('catalog.sectionOtherWonokertoTitle')}
              description={t('catalog.sectionOtherWonokertoDesc')}
              products={otherWonokertoProducts}
            />
          </div>
        </Container>
      </Section>
    </>
  )
}

/**
 * Satu section katalog: heading + tombol ikon filter di kanan, paragraf, lalu satu grid produk.
 * Tombol filter cuma tampil kalau section-nya sudah ada produknya.
 */
function CatalogSection({
  title,
  description,
  products,
  commodityOptions,
}: {
  title: string
  description: string
  products: Product[]
  commodityOptions?: CommodityId[]
}) {
  const { t } = useTranslation()
  const [commodityFilter, setCommodityFilter] = useState<CommodityId | 'all'>('all')
  const [sort, setSort] = useState<SortKey>('terbaru')

  const filtered =
    commodityOptions && commodityFilter !== 'all'
      ? products.filter((p) => p.commodityId === commodityFilter)
      : products
  const sorted = useMemo(() => sortProducts(filtered, sort), [filtered, sort])

  return (
    <div>
      <div className="mb-2 flex items-start justify-between gap-4">
        <h2 className="text-title">{title}</h2>
        {products.length > 0 && (
          <FilterMenu
            sort={sort}
            onSortChange={setSort}
            commodityOptions={commodityOptions}
            commodityFilter={commodityFilter}
            onCommodityChange={setCommodityFilter}
          />
        )}
      </div>
      <p className="mb-6 max-content-w text-body text-muted">{description}</p>

      {sorted.length > 0 ? (
        <ProductGrid products={sorted} carousel />
      ) : (
        <div className="rounded-md border border-dashed border-line py-12 text-center">
          <p className="text-body text-muted">{t('catalog.sectionComingSoon')}</p>
        </div>
      )}
    </div>
  )
}

function FilterMenu({
  sort,
  onSortChange,
  commodityOptions,
  commodityFilter,
  onCommodityChange,
}: {
  sort: SortKey
  onSortChange: (v: SortKey) => void
  commodityOptions?: CommodityId[]
  commodityFilter: CommodityId | 'all'
  onCommodityChange: (v: CommodityId | 'all') => void
}) {
  const { t } = useTranslation()
  const { locale } = useLocale()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open])

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: 'terbaru', label: t('catalog.sortNewest') },
    { key: 'harga-rendah', label: t('catalog.sortPriceLow') },
    { key: 'harga-tinggi', label: t('catalog.sortPriceHigh') },
  ]

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={t('catalog.filterButtonLabel')}
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-full border transition-colors duration-200',
          open ? 'border-ink bg-ink text-white' : 'border-line text-ink hover:border-ink/40',
        )}
      >
        <IconFilter className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-10 flex w-56 flex-col gap-4 rounded-md border border-line bg-white p-4 shadow-[0_8px_32px_rgba(0,0,0,.12)]">
          {commodityOptions && (
            <div>
              <p className="mb-2 text-meta text-muted-2">{t('catalog.filterCommodityLabel')}</p>
              <div className="flex flex-col gap-0.5">
                <FilterOption active={commodityFilter === 'all'} onClick={() => onCommodityChange('all')}>
                  {t('catalog.sectionFilterAll')}
                </FilterOption>
                {commoditiesSeed
                  .filter((c) => commodityOptions.includes(c.id))
                  .map((c) => (
                    <FilterOption key={c.id} active={commodityFilter === c.id} onClick={() => onCommodityChange(c.id)}>
                      {locale === 'id' ? c.nameId : c.nameEn}
                    </FilterOption>
                  ))}
              </div>
            </div>
          )}
          <div>
            <p className="mb-2 text-meta text-muted-2">{t('catalog.filterSortLabel')}</p>
            <div className="flex flex-col gap-0.5">
              {sortOptions.map((o) => (
                <FilterOption key={o.key} active={sort === o.key} onClick={() => onSortChange(o.key)}>
                  {o.label}
                </FilterOption>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FilterOption({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center justify-between rounded-sm px-2 py-1.5 text-left text-body transition-colors duration-200',
        active ? 'bg-surface-2 text-ink' : 'text-muted hover:bg-surface-2',
      )}
    >
      {children}
      {active && <IconCheck className="h-3.5 w-3.5 shrink-0" />}
    </button>
  )
}
