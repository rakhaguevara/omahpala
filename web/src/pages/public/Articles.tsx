import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import type { Article } from '@/types'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Eyebrow } from '@/components/ui/Badge'
import { IconButton } from '@/components/ui/Button'
import { IconChevronLeft, IconChevronRight } from '@/components/ui/Icons'
import { Reveal } from '@/components/motion/Reveal'
import { Stagger, StaggerItem } from '@/components/motion/Stagger'
import { Seo } from '@/components/layout/Seo'
import { useLocale } from '@/lib/useLocale'
import { cn, estimateReadMinutes, formatDate } from '@/lib/utils'
import { articles } from '@/data/articles'

const PAGE_SIZE = 3

/**
 * Daftar artikel — bukan carousel teaser seperti ArticleGrid di beranda, tapi halaman penuh:
 * artikel terbaru sebagai sorotan + daftar ringkas, lalu grid artikel lain dengan paginasi.
 * Tidak masuk Navbar (lihat navItems di layout/Navbar.tsx) — dijangkau lewat tombol
 * "Lihat semua artikel" di beranda, supaya nav tidak makin panjang.
 */
export default function Articles() {
  const { t } = useTranslation()
  const { locale } = useLocale()
  const [page, setPage] = useState(0)

  const sorted = useMemo(
    () => [...articles].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()),
    [],
  )

  const featured = sorted[0]
  const latest = sorted.slice(0, 4)

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages - 1)
  const pageItems = sorted.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE)

  function goToPage(next: number) {
    setPage(Math.min(Math.max(next, 0), totalPages - 1))
  }

  return (
    <>
      <Seo title={`${t('articles.title')} — ${t('common.brand')}`} description={t('articles.subtitle')} path="/artikel" />

      <Section tone="paper" className="pt-36 pb-10 md:pb-14">
        <Container>
          <Reveal className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
            <Eyebrow className="justify-center">{t('articles.eyebrow')}</Eyebrow>
            <h1 className="text-display-l text-balance">{t('articles.title')}</h1>
            <p className="text-body-l max-content-w text-muted">{t('articles.subtitle')}</p>
          </Reveal>
        </Container>
      </Section>

      {featured && (
        <Section tone="paper" className="pt-0">
          <Container>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
              <Reveal className="lg:col-span-2">
                <FeaturedCard article={featured} locale={locale} t={t} />
              </Reveal>

              <Reveal delay={0.1} direction="none" className="flex flex-col">
                <h2 className="text-title text-ink mb-5">{t('articles.latestPost')}</h2>
                <div className="flex flex-1 flex-col divide-y divide-line">
                  {latest.map((article) => (
                    <LatestPostItem key={article.id} article={article} locale={locale} t={t} />
                  ))}
                </div>
              </Reveal>
            </div>
          </Container>
        </Section>
      )}

      <Section tone="paper" className="pt-0">
        <Container>
          <div className="mb-10 flex items-end justify-between gap-4 border-t border-line pt-10">
            <Reveal>
              <h2 className="text-display-l text-balance">{t('articles.highlights')}</h2>
            </Reveal>
            <div className="flex shrink-0 items-center gap-2">
              <IconButton
                type="button"
                aria-label={t('articles.pagePrev')}
                disabled={currentPage === 0}
                onClick={() => goToPage(currentPage - 1)}
              >
                <IconChevronLeft className="h-5 w-5" />
              </IconButton>
              <IconButton
                type="button"
                aria-label={t('articles.pageNext')}
                disabled={currentPage === totalPages - 1}
                onClick={() => goToPage(currentPage + 1)}
              >
                <IconChevronRight className="h-5 w-5" />
              </IconButton>
            </div>
          </div>

          <Stagger className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" stagger={0.08}>
            {pageItems.map((article) => (
              <StaggerItem key={article.id} className="h-full">
                <HighlightCard article={article} locale={locale} t={t} />
              </StaggerItem>
            ))}
          </Stagger>

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={t('articles.pageLabel', { count: i + 1 })}
                  aria-current={i === currentPage ? 'page' : undefined}
                  onClick={() => goToPage(i)}
                  className={cn(
                    'inline-flex h-10 w-10 items-center justify-center rounded-pill text-label transition-colors duration-200',
                    i === currentPage ? 'bg-ink text-white' : 'text-muted hover:bg-black/[.04]',
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </Container>
      </Section>
    </>
  )
}

interface CardProps {
  article: Article
  locale: 'id' | 'en'
  t: (key: string, options?: Record<string, unknown>) => string
}

function FeaturedCard({ article, locale, t }: CardProps) {
  const title = locale === 'id' ? article.titleId : article.titleEn
  const category = locale === 'id' ? article.categoryId : article.categoryEn
  const minutes = estimateReadMinutes(locale === 'id' ? article.contentId : article.contentEn)

  return (
    <Link
      to={`/artikel/${article.slug}`}
      className="group relative flex aspect-[4/5] sm:aspect-[16/10] flex-col justify-end overflow-hidden rounded-lg"
    >
      <img
        src={article.image}
        alt={title}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-400 [transition-timing-function:var(--ease-brand)] group-hover:scale-[1.03]"
      />
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(180deg, rgba(33,33,33,0) 30%, rgba(33,33,33,.75) 100%)' }}
      />

      <div className="relative z-10 flex flex-col gap-4 p-7.5 sm:p-10">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-pill bg-white/90 px-3 py-1 text-meta font-medium text-ink">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
          {category}
        </span>
        <h2 className="text-display-m text-white text-balance">{title}</h2>
        <span className="text-meta text-white/75">
          {formatDate(article.publishedAt, locale)} · {t('articles.minRead', { count: minutes })}
        </span>
      </div>
    </Link>
  )
}

function LatestPostItem({ article, locale, t }: CardProps) {
  const title = locale === 'id' ? article.titleId : article.titleEn
  const minutes = estimateReadMinutes(locale === 'id' ? article.contentId : article.contentEn)

  return (
    <Link to={`/artikel/${article.slug}`} className="group flex gap-4 py-4 first:pt-0 last:pb-0">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-sm bg-surface">
        <img
          src={article.image}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-400 [transition-timing-function:var(--ease-brand)] group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-col justify-center gap-1.5">
        <h3 className="text-body font-medium text-ink line-clamp-2 text-balance group-hover:text-muted">{title}</h3>
        <span className="text-meta text-muted-2">
          {formatDate(article.publishedAt, locale)} · {t('articles.minRead', { count: minutes })}
        </span>
      </div>
    </Link>
  )
}

function HighlightCard({ article, locale, t }: CardProps) {
  const title = locale === 'id' ? article.titleId : article.titleEn
  const excerpt = locale === 'id' ? article.excerptId : article.excerptEn
  const category = locale === 'id' ? article.categoryId : article.categoryEn
  const minutes = estimateReadMinutes(locale === 'id' ? article.contentId : article.contentEn)

  return (
    <Link
      to={`/artikel/${article.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-md bg-surface-2 shadow-[0_1px_2px_rgba(0,0,0,.04)] transition-shadow duration-200 hover:shadow-[0_8px_32px_rgba(0,0,0,.08)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface">
        <img
          src={article.image}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-400 [transition-timing-function:var(--ease-brand)] group-hover:scale-[1.03]"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-7.5">
        <Eyebrow className="text-muted-2">{category}</Eyebrow>
        <h3 className="text-title text-ink text-balance">{title}</h3>
        <p className="text-body max-content-w text-muted line-clamp-2">{excerpt}</p>
        <span className="mt-auto pt-2 text-meta text-muted-2">
          {formatDate(article.publishedAt, locale)} · {t('articles.minRead', { count: minutes })}
        </span>
      </div>
    </Link>
  )
}
