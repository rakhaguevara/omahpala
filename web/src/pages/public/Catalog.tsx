import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Eyebrow } from '@/components/ui/Badge'
import { Chip } from '@/components/ui/Chip'
import { Reveal } from '@/components/motion/Reveal'
import { ProductGrid } from '@/components/blocks/ProductGrid'
import { Seo } from '@/components/layout/Seo'
import { useProducts } from '@/lib/useEntities'
import type { ProductCategory } from '@/types'

type Filter = ProductCategory | 'all'

/** Katalog produk — PRD P-01 (grid kartu) & P-02 (filter kategori). */
export default function Catalog() {
  const { t } = useTranslation()
  const { items: products } = useProducts()
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = useMemo(() => {
    const active = products.filter((p) => p.isActive)
    if (filter === 'all') return active
    return active.filter((p) => p.category === filter)
  }, [products, filter])

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: t('catalog.filterAll') },
    { key: 'pangan', label: t('catalog.categoryPangan') },
    { key: 'minuman', label: t('catalog.categoryMinuman') },
    { key: 'non-pangan', label: t('catalog.categoryNonPangan') },
  ]

  return (
    <>
      <Seo title={`${t('catalog.title')} — ${t('common.brand')}`} description={t('catalog.subtitle')} path="/produk" />
      <Section tone="paper" className="pt-36">
        <Container>
          <Reveal className="mx-auto mb-10 flex max-w-2xl flex-col items-center gap-4 text-center">
            <Eyebrow className="justify-center">{t('catalog.eyebrow')}</Eyebrow>
            <h1 className="text-display-l text-balance">{t('catalog.title')}</h1>
            <p className="text-body-l max-content-w text-muted">{t('catalog.subtitle')}</p>
          </Reveal>

          <div className="mb-8 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {filters.map((f) => (
              <Chip key={f.key} active={filter === f.key} onClick={() => setFilter(f.key)}>
                {f.label}
              </Chip>
            ))}
          </div>

          {filtered.length > 0 ? (
            <ProductGrid products={filtered} />
          ) : (
            <p className="py-16 text-center text-body text-muted">{t('catalog.empty')}</p>
          )}
        </Container>
      </Section>
    </>
  )
}
