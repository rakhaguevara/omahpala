import { Helmet } from 'react-helmet-async'
import { useLocale } from '@/lib/useLocale'
import { sharedImages } from '@/lib/images'
import { SITE_URL } from '@/lib/seo'

interface SeoProps {
  title: string
  description: string
  path: string
  image?: string
  /** Structured data (schema.org) — PRD §9. Array = beberapa skema sekaligus (mis. Product +
   * BreadcrumbList) dalam satu <script> — Google membaca tiap item array sebagai objek terpisah. */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[]
}

const DEFAULT_IMAGE = sharedImages.ogDefault

/**
 * SEO per halaman — PRD §9. Catatan: karena stack React (Vite, CSR) bukan Next.js,
 * tag ini dirender di client, bukan lewat SSR. Untuk indexing penuh + hreflang server-side,
 * lihat README §"Langkah lanjut".
 */
export function Seo({ title, description, path, image = DEFAULT_IMAGE, jsonLd }: SeoProps) {
  const { locale } = useLocale()
  const url = `${SITE_URL}${path}`
  // og:image butuh URL absolut supaya bisa diambil crawler — path lokal (/images/...) dari
  // registry di lib/images.ts perlu digabung dengan SITE_URL dulu.
  const imageUrl = image.startsWith('/') ? `${SITE_URL}${image}` : image

  return (
    <Helmet>
      <html lang={locale} />
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {/* Tanpa hreflang id/en: Google mensyaratkan URL BERBEDA per bahasa untuk hreflang
          valid (lihat developers.google.com/search/docs/specialty/international/localized-versions).
          Situs ini satu URL untuk kedua bahasa (toggle client-side, PRD §11) — hreflang id/en yang
          menunjuk ke URL identik tidak valid dan berisiko diabaikan/salah dibaca Search Console. */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={imageUrl} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  )
}
