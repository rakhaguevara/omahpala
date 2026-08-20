import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import type { Product } from '@/types'
import { useLocale } from '@/lib/useLocale'
import { formatIdr, waLink, commodityLabel } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { ExternalLinkButton, LinkButton } from '@/components/ui/Button'
import { IconArrowUpRight, IconCheck, IconStorefront, IconWhatsapp } from '@/components/ui/Icons'

/**
 * Kartu produk — design.md §5 (latar --surface-2, radius --r-sm, hover shadow+scale 3%)
 * dan PRD P-01 (foto, nama, kategori, badge sertifikasi, harga, tombol pesan).
 * Poin komposisi dipakai sebagai daftar "manfaat" — bahan/fakta, BUKAN klaim kesehatan
 * (dilarang tegas di halaman produk, UX-WRITING.md §4).
 */
interface ProductCardProps {
  product: Product
  /** Kartu sempit (grid 2 kolom di layar hp — Home, "produk terkait") vs kartu lebar penuh
   * (carousel katalog per komoditas). Menentukan apakah tombol WA di layar hp tampil dengan
   * teks atau ikon saja — kartu sempit tidak cukup lebar untuk "Pesan lewat WhatsApp". */
  compact?: boolean
}

export function ProductCard({ product, compact = true }: ProductCardProps) {
  const { t } = useTranslation()
  const { locale } = useLocale()
  const name = locale === 'id' ? product.nameId : product.nameEn
  const description = locale === 'id' ? product.descriptionId : product.descriptionEn
  const commodity = commodityLabel(product.commodityId, locale)

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-md bg-surface-2 shadow-[0_1px_2px_rgba(0,0,0,.04)] transition-shadow duration-200 hover:shadow-[0_8px_32px_rgba(0,0,0,.08)]">
      <Link to={`/produk/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-surface sm:aspect-square">
        <img
          src={product.images[0]}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-400 [transition-timing-function:var(--ease-brand)] group-hover:scale-[1.03]"
        />
        {product.isFeatured && (
          <Badge tone="featured" className="absolute left-4 top-4">
            {t('common.featuredBadge')}
          </Badge>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-7.5">
        <span className="hidden text-eyebrow text-muted-2 sm:block">{commodity}</span>
        <Link to={`/produk/${product.slug}`}>
          <h3 className="text-title max-sm:text-sm max-sm:font-semibold max-sm:leading-snug text-ink hover:underline">
            {name}
          </h3>
        </Link>
        <p className="text-meta text-muted line-clamp-2 sm:hidden">{description}</p>

        {product.certifications.length > 0 && (
          <div className="hidden flex-wrap gap-1.5 sm:flex">
            {product.certifications.map((c) => (
              <Badge key={c.name} tone={c.status === 'terbit' ? 'neutral' : 'pending'}>
                {c.name}
                {c.status === 'dalam-proses' ? ` · ${t('product.certPending')}` : ''}
              </Badge>
            ))}
          </div>
        )}

        {product.composition.length > 0 && (
          <ul className="hidden flex-col gap-1.5 sm:flex">
            {product.composition.map((item) => (
              <li key={item} className="flex items-start gap-2 text-meta text-muted">
                <IconCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-ink" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex flex-col gap-3 pt-2">
          <span className="text-title text-ink">{formatIdr(product.priceIdr)}</span>

          {/* Layar hp: pill Detail (besar, kiri) + lingkaran WA (kecil, kanan). sm+: 3 tombol susun (di bawah). */}
          <div className="flex items-center gap-2 sm:hidden">
            <LinkButton
              to={`/produk/${product.slug}`}
              variant="dark"
              size="sm"
              aria-label={compact ? t('catalog.viewDetail') : undefined}
              className="flex-1"
            >
              <IconArrowUpRight className="h-4 w-4" />
              {!compact && t('catalog.viewDetail')}
            </LinkButton>
            <a
              href={waLink(`Halo Omah Pala, saya ingin memesan ${name}.`)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('catalog.orderWhatsapp')}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-transparent text-ink transition-[transform,background-color,border-color,color] duration-200 [transition-timing-function:var(--ease-brand)] hover:-translate-y-px hover:border-accent hover:bg-accent-soft hover:text-accent-ink active:translate-y-0 active:border-accent active:bg-accent active:text-accent-ink"
            >
              <IconWhatsapp className="h-4 w-4" />
            </a>
          </div>

          <div className="hidden flex-col gap-2 sm:flex">
            <LinkButton to={`/produk/${product.slug}`} variant="ghost" size="sm" className="w-full">
              <IconArrowUpRight className="h-4 w-4" />
              {t('catalog.viewDetail')}
            </LinkButton>
            <ExternalLinkButton
              href={waLink(`Halo Omah Pala, saya ingin memesan ${name}.`)}
              target="_blank"
              rel="noopener noreferrer"
              variant="dark"
              size="sm"
              className="w-full"
            >
              <IconWhatsapp className="h-4 w-4" />
              {t('catalog.orderWhatsapp')}
            </ExternalLinkButton>
            <ExternalLinkButton
              href={product.shopeeUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="ghost"
              size="sm"
              className="w-full"
            >
              <IconStorefront className="h-4 w-4" />
              {t('catalog.viewShopee')}
            </ExternalLinkButton>
          </div>
        </div>
      </div>
    </div>
  )
}
