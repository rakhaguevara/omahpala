import { Helmet } from 'react-helmet-async'
import { useLocale } from '@/lib/useLocale'

interface SeoProps {
  title: string
  description: string
  path: string
  image?: string
  /** Structured data (schema.org) — PRD §9. */
  jsonLd?: Record<string, unknown>
}

const SITE_URL = 'https://omahpala.site'
const DEFAULT_IMAGE = 'https://picsum.photos/seed/omahpala-og/1200/630'

/**
 * SEO per halaman — PRD §9. Catatan: karena stack React (Vite, CSR) bukan Next.js,
 * tag ini dirender di client, bukan lewat SSR. Untuk indexing penuh + hreflang server-side,
 * lihat README §"Langkah lanjut".
 */
export function Seo({ title, description, path, image = DEFAULT_IMAGE, jsonLd }: SeoProps) {
  const { locale } = useLocale()
  const url = `${SITE_URL}${path}`

  return (
    <Helmet>
      <html lang={locale} />
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <link rel="alternate" hrefLang="id" href={url} />
      <link rel="alternate" hrefLang="en" href={url} />
      <link rel="alternate" hrefLang="x-default" href={url} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  )
}
