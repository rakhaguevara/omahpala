import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import type { Product } from '@/types'
import { useLocale } from '@/lib/useLocale'
import { formatIdr, waLink } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { ExternalLinkButton } from '@/components/ui/Button'
import { IconArrowUpRight } from '@/components/ui/Icons'

/**
 * Kartu produk — design.md §5 (latar --surface-2, radius --r-md, hover shadow+scale 3%)
 * dan PRD P-01 (foto, nama, kategori, badge sertifikasi, harga, tombol pesan).
 */
export function ProductCard({ product }: { product: Product }) {
  const { t } = useTranslation()
  const { locale } = useLocale()
  const name = locale === 'id' ? product.nameId : product.nameEn
  const category = t(`catalog.category${categoryKey(product.category)}`)

  return (
    <div className="group flex flex-col overflow-hidden rounded-md bg-surface-2 shadow-[0_1px_2px_rgba(0,0,0,.04)] transition-shadow duration-200 hover:shadow-[0_8px_32px_rgba(0,0,0,.08)]">
      <Link to={`/produk/${product.slug}`} className="relative block aspect-square overflow-hidden bg-surface">
        <img
          src={product.images[0]}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-400 [transition-timing-function:var(--ease-brand)] group-hover:scale-[1.03]"
        />
        {product.isFeatured && (
          <Badge tone="accent" className="absolute left-4 top-4">
            {t('common.viewAll')}
          </Badge>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-7.5">
        <span className="text-eyebrow text-muted-2">{category}</span>
        <Link to={`/produk/${product.slug}`}>
          <h3 className="text-title text-ink hover:underline">{name}</h3>
        </Link>

        {product.certifications.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {product.certifications.map((c) => (
              <Badge key={c.name} tone={c.status === 'terbit' ? 'neutral' : 'pending'}>
                {c.name}
                {c.status === 'dalam-proses' ? ` · ${t('product.certPending')}` : ''}
              </Badge>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <span className="text-title text-ink">{formatIdr(product.priceIdr)}</span>
          <Link
            to={`/produk/${product.slug}`}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink transition-colors group-hover:border-ink"
            aria-label={name}
          >
            <IconArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <ExternalLinkButton
          href={waLink(`Halo Omah Pala, saya ingin memesan ${name}.`)}
          target="_blank"
          rel="noopener noreferrer"
          variant="dark"
          size="sm"
          className="w-full"
        >
          {t('catalog.orderWhatsapp')}
        </ExternalLinkButton>
      </div>
    </div>
  )
}

function categoryKey(cat: Product['category']) {
  if (cat === 'pangan') return 'Pangan'
  if (cat === 'minuman') return 'Minuman'
  return 'NonPangan'
}
