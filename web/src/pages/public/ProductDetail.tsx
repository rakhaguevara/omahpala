import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Badge } from '@/components/ui/Badge'
import { ExternalLinkButton, LinkButton } from '@/components/ui/Button'
import { IconArrowRight } from '@/components/ui/Icons'
import { Reveal } from '@/components/motion/Reveal'
import { ProductGrid } from '@/components/blocks/ProductGrid'
import { Seo } from '@/components/layout/Seo'
import { useProducts, usePlots, useFarmers } from '@/lib/useEntities'
import { useLocale } from '@/lib/useLocale'
import { formatIdr, formatUsd, waLink } from '@/lib/utils'

/** Detail produk — PRD P-03..P-07. */
export default function ProductDetail() {
  const { t } = useTranslation()
  const { locale } = useLocale()
  const { slug } = useParams<{ slug: string }>()
  const { items: products } = useProducts()
  const { items: plots } = usePlots()
  const { items: farmers } = useFarmers()
  const [activeImage, setActiveImage] = useState(0)

  const product = products.find((p) => p.slug === slug)

  if (!product) {
    return <Navigate to="/produk" replace />
  }

  const name = locale === 'id' ? product.nameId : product.nameEn
  const description = locale === 'id' ? product.descriptionId : product.descriptionEn
  const plot = plots.find((pl) => pl.id === product.plotId)
  const farmer = plot ? farmers.find((f) => f.id === plot.farmerId) : undefined
  const related = products
    .filter((p) => p.id !== product.id && p.category === product.category && p.isActive)
    .slice(0, 3)

  return (
    <>
      <Seo
        title={`${name} — ${t('common.brand')}`}
        description={description}
        path={`/produk/${product.slug}`}
        image={product.images[0]}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name,
          description,
          image: product.images,
          brand: { '@type': 'Brand', name: 'Omah Pala' },
          offers: product.priceIdr
            ? {
                '@type': 'Offer',
                priceCurrency: 'IDR',
                price: product.priceIdr,
                availability: product.isActive
                  ? 'https://schema.org/InStock'
                  : 'https://schema.org/OutOfStock',
              }
            : undefined,
        }}
      />

      <Section tone="paper" className="pt-36">
        <Container>
          <LinkButton to="/produk" variant="ghost" size="sm" className="mb-8">
            {t('common.backToCatalog')}
          </LinkButton>

          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <Reveal className="flex flex-col gap-4">
              <div className="aspect-square overflow-hidden rounded-lg bg-surface">
                <img
                  src={product.images[activeImage]}
                  alt={name}
                  className="h-full w-full object-cover"
                />
              </div>
              {product.images.length > 1 && (
                <div className="flex gap-3">
                  {product.images.map((img, i) => (
                    <button
                      key={img}
                      type="button"
                      onClick={() => setActiveImage(i)}
                      aria-label={`${name} ${i + 1}`}
                      aria-current={i === activeImage}
                      className={`h-20 w-20 overflow-hidden rounded-sm border-2 ${
                        i === activeImage ? 'border-ink' : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </Reveal>

            <Reveal delay={0.08} className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <span className="text-eyebrow text-muted-2">
                  {t(`catalog.category${categoryKey(product.category)}`)}
                </span>
                <h1 className="text-display-l text-balance">{name}</h1>
                <p className="text-body-l max-content-w text-muted">{description}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {product.certifications.map((c) => (
                  <Badge key={c.name} tone={c.status === 'terbit' ? 'neutral' : 'pending'}>
                    {c.name}
                    {c.status === 'dalam-proses' ? ` · ${t('product.certPending')}` : ''}
                  </Badge>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-md bg-surface-2 p-6">
                <SpecRow label={t('product.priceLocal')} value={formatIdr(product.priceIdr)} />
                <SpecRow label={t('product.priceExport')} value={formatUsd(product.priceUsd)} />
                <SpecRow label={t('product.netWeight')} value={product.netWeight} />
                <SpecRow label={t('product.shelfLife')} value={product.shelfLife} />
                <SpecRow label={t('product.packaging')} value={product.packaging} className="col-span-2" />
                <div className="col-span-2">
                  <p className="mb-1 text-meta text-muted">{t('product.composition')}</p>
                  <p className="text-body text-ink">{product.composition.join(', ')}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <ExternalLinkButton
                  href={waLink(`Halo Omah Pala, saya ingin memesan ${name}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="dark"
                  className="flex-1"
                >
                  {t('catalog.orderWhatsapp')}
                </ExternalLinkButton>
                <LinkButton
                  to={`/kontak?produk=${product.slug}`}
                  variant="primary"
                  className="flex-1"
                >
                  {t('catalog.requestQuotation')}
                </LinkButton>
              </div>

              {plot && (
                <div className="flex items-center justify-between gap-4 rounded-md border border-line p-5">
                  <div>
                    <p className="text-meta text-muted">{t('product.traceabilityTitle')}</p>
                    <p className="text-body text-ink">
                      {t('product.traceabilityBody')} <strong>{plot.name}</strong>
                      {farmer && (
                        <>
                          , {t('product.traceabilityFarmer')} <strong>{farmer.name}</strong>
                        </>
                      )}
                      .
                    </p>
                  </div>
                  <Link
                    to="/kebun"
                    className="flex shrink-0 items-center gap-1 text-label text-ink hover:underline"
                  >
                    {t('product.traceabilityCta')}
                    <IconArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* P-04 Spesifikasi ekspor */}
      <Section tone="surface">
        <Container>
          <Reveal className="mb-8 flex flex-col gap-2">
            <h2 className="text-display-m">{t('product.exportSpecTitle')}</h2>
          </Reveal>
          <Reveal className="grid grid-cols-1 gap-6 rounded-lg bg-white p-7.5 sm:grid-cols-2 lg:grid-cols-4">
            <SpecRow label={t('product.moq')} value={product.moq} />
            <SpecRow label={t('product.monthlyCapacity')} value={product.monthlyCapacity} />
            <SpecRow label={t('product.hsCode')} value={product.hsCode} />
            <SpecRow label={t('product.incoterms')} value={product.incoterms.join(', ')} />
            <SpecRow label={t('product.originPort')} value={product.originPort} className="sm:col-span-2 lg:col-span-4" />
          </Reveal>
        </Container>
      </Section>

      {/* P-07 Produk terkait */}
      {related.length > 0 && (
        <Section tone="paper">
          <Container>
            <Reveal className="mb-8">
              <h2 className="text-display-m">{t('product.relatedTitle')}</h2>
            </Reveal>
            <ProductGrid products={related} />
          </Container>
        </Section>
      )}
    </>
  )
}

function SpecRow({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <p className="mb-1 text-meta text-muted">{label}</p>
      <p className="text-body text-ink">{value}</p>
    </div>
  )
}

function categoryKey(cat: 'pangan' | 'minuman' | 'non-pangan') {
  if (cat === 'pangan') return 'Pangan'
  if (cat === 'minuman') return 'Minuman'
  return 'NonPangan'
}
