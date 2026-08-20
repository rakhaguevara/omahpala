import { useTranslation } from 'react-i18next'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Eyebrow } from '@/components/ui/Badge'
import { LinkButton } from '@/components/ui/Button'
import { Reveal } from '@/components/motion/Reveal'
import { Seo } from '@/components/layout/Seo'
import { Hero } from '@/components/blocks/Hero'
import { IntroBlock } from '@/components/blocks/IntroBlock'
import { PillarTabs } from '@/components/blocks/PillarTabs'
import { ProductGrid } from '@/components/blocks/ProductGrid'
import { StatBand } from '@/components/blocks/StatBand'
import { WhyPala } from '@/components/blocks/WhyPala'
import { EcosystemDiagram } from '@/components/blocks/EcosystemDiagram'
import { CtaBand } from '@/components/blocks/CtaBand'
import { ArticleGrid } from '@/components/blocks/ArticleGrid'
import { useProducts } from '@/lib/useEntities'
import { programStats } from '@/data/program'
import { articles } from '@/data/articles'
import { usePageContent } from '@/lib/usePageContent'

export default function Home() {
  const { t } = useTranslation()
  const { items: products } = useProducts()
  const featured = products.filter((p) => p.isFeatured && p.isActive).slice(0, 4)
  const heroSubtitle = usePageContent('hero.subtitle')

  return (
    <>
      <Seo
        title={`${t('common.brand')} — Produk Olahan Pala Desa Wonokerto`}
        description={heroSubtitle}
        path="/"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Omah Pala',
          url: 'https://omahpala.site',
          description: heroSubtitle,
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Desa Wonokerto, Turi',
            addressRegion: 'Sleman, DI Yogyakarta',
            addressCountry: 'ID',
          },
        }}
      />

      {/* H-01 + H-02 */}
      <Hero />

      {/* H-04 */}
      <Section tone="paper" className="pt-32 sm:pt-40">
        <Container>
          <IntroBlock />
        </Container>
      </Section>

      {/* H-05 */}
      <Section tone="surface">
        <Container>
          <Reveal className="mb-10 flex max-w-2xl flex-col gap-4">
            <Eyebrow>{t('home.pillarsEyebrow')}</Eyebrow>
            <h2 className="text-display-l text-balance">{t('home.pillarsTitle')}</h2>
          </Reveal>
          <PillarTabs />
        </Container>
      </Section>

      {/* H-06 */}
      <Section tone="paper">
        <Container>
          <Reveal className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div className="flex max-w-xl flex-col gap-4">
              <Eyebrow>{t('home.productsEyebrow')}</Eyebrow>
              <h2 className="text-display-l text-balance">
                {t('home.productsTitle1')}
                <span className="text-accent-ink">{t('home.productsTitleHighlight')}</span>
              </h2>
              <p className="text-body-l max-content-w text-muted">{t('home.productsBody')}</p>
            </div>
            <LinkButton to="/produk" variant="ghost">
              {t('home.productsCta')}
            </LinkButton>
          </Reveal>
          <ProductGrid products={featured} />
        </Container>
      </Section>

      {/* H-07 */}
      <Section tone="paper" className="pt-0">
        <Container>
          <Reveal className="mx-auto mb-10 flex max-w-2xl flex-col items-center gap-4 text-center">
            <Eyebrow className="justify-center">{t('home.statsEyebrow')}</Eyebrow>
            <h2 className="text-display-l text-balance">{t('home.statsTitle')}</h2>
          </Reveal>
          <StatBand stats={programStats} />
        </Container>
      </Section>

      {/* H-08 */}
      <Section tone="paper">
        <Container>
          <WhyPala />
        </Container>
      </Section>

      {/* H-09 (Could) */}
      <Section tone="ink">
        <Container>
          <Reveal className="mx-auto mb-10 flex max-w-2xl flex-col items-center gap-4 text-center">
            <Eyebrow tone="white" className="justify-center">
              {t('home.ecosystemEyebrow')}
            </Eyebrow>
            <h2 className="text-display-l text-balance text-white">{t('home.ecosystemTitle')}</h2>
            <p className="text-body-l max-content-w text-white/70">{t('home.ecosystemBody')}</p>
          </Reveal>
          <EcosystemDiagram />
        </Container>
      </Section>

      {/* H-10 — full-bleed, tanpa Container agar edge-to-edge seperti referensi */}
      <Section tone="paper" className="pt-0 pb-0">
        <CtaBand />
      </Section>

      {/* Artikel & kabar — mengikuti banner CTA, ritme sama dengan blok produk H-06.
          Halaman /artikel (daftar lengkap) sengaja tidak masuk Navbar — dijangkau lewat
          tombol "Lihat semua artikel" di sini supaya nav tidak makin panjang. */}
      <Section tone="paper">
        <Container>
          <Reveal className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div className="flex max-w-xl flex-col gap-4">
              <Eyebrow>{t('home.articlesEyebrow')}</Eyebrow>
              <h2 className="text-display-l text-balance">{t('home.articlesTitle')}</h2>
            </div>
            <LinkButton to="/artikel" variant="ghost">
              {t('home.articlesCta')}
            </LinkButton>
          </Reveal>
          <ArticleGrid articles={articles} />
        </Container>
      </Section>
    </>
  )
}
