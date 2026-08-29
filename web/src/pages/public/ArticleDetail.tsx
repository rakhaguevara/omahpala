import { useTranslation } from 'react-i18next'
import { Navigate, useParams } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { LinkButton } from '@/components/ui/Button'
import { Reveal } from '@/components/motion/Reveal'
import { ArticleGrid } from '@/components/blocks/ArticleGrid'
import { Seo } from '@/components/layout/Seo'
import { breadcrumbJsonLd } from '@/lib/seo'
import { useLocale } from '@/lib/useLocale'
import { formatDate } from '@/lib/utils'
import { articles } from '@/data/articles'

/** Detail artikel — dibuka dari kartu artikel di beranda. */
export default function ArticleDetail() {
  const { t } = useTranslation()
  const { locale } = useLocale()
  const { slug } = useParams<{ slug: string }>()

  const article = articles.find((a) => a.slug === slug)

  if (!article) {
    return <Navigate to="/" replace />
  }

  const title = locale === 'id' ? article.titleId : article.titleEn
  const excerpt = locale === 'id' ? article.excerptId : article.excerptEn
  const content = locale === 'id' ? article.contentId : article.contentEn
  const category = locale === 'id' ? article.categoryId : article.categoryEn
  const related = articles.filter((a) => a.id !== article.id).slice(0, 3)

  return (
    <>
      <Seo
        title={`${title} — ${t('common.brand')}`}
        description={excerpt}
        path={`/artikel/${article.slug}`}
        image={article.image}
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: title,
            description: excerpt,
            image: article.image,
            datePublished: article.publishedAt,
            articleSection: category,
            author: { '@type': 'Organization', name: 'Omah Pala' },
            publisher: { '@type': 'Organization', name: 'Omah Pala' },
          },
          breadcrumbJsonLd([
            { name: t('common.brand'), path: '/' },
            { name: t('articles.title'), path: '/artikel' },
            { name: title, path: `/artikel/${article.slug}` },
          ]),
        ]}
      />

      <Section tone="paper" className="pt-36">
        <Container>
          <LinkButton to="/" variant="ghost" size="sm" className="mb-8">
            {t('common.backHome')}
          </LinkButton>

          <Reveal className="mx-auto flex max-w-[62ch] flex-col gap-4">
            <span className="text-eyebrow text-muted-2">
              {category} · {formatDate(article.publishedAt, locale)}
            </span>
            <h1 className="text-display-l text-balance">{title}</h1>
          </Reveal>

          <Reveal delay={0.08} className="mx-auto mt-8 aspect-[16/9] w-full max-w-3xl overflow-hidden rounded-md bg-surface">
            <img src={article.image} alt={title} className="h-full w-full object-cover" />
          </Reveal>

          <Reveal delay={0.12} className="mx-auto mt-8 flex max-w-[62ch] flex-col gap-5">
            {content.map((paragraph) => (
              <p key={paragraph} className="text-body-l text-muted">
                {paragraph}
              </p>
            ))}
          </Reveal>
        </Container>
      </Section>

      {related.length > 0 && (
        <Section tone="surface">
          <Container>
            <Reveal className="mb-8">
              <h2 className="text-display-m">{t('article.relatedTitle')}</h2>
            </Reveal>
            <ArticleGrid articles={related} />
          </Container>
        </Section>
      )}
    </>
  )
}
