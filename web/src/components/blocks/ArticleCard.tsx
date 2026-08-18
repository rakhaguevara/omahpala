import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import type { Article } from '@/types'
import { useLocale } from '@/lib/useLocale'
import { formatDate } from '@/lib/utils'
import { IconArrowUpRight } from '@/components/ui/Icons'

/** Kartu artikel — sama gaya visual dengan ProductCard (design.md §5), tautan ke /artikel/:slug. */
export function ArticleCard({ article }: { article: Article }) {
  const { t } = useTranslation()
  const { locale } = useLocale()
  const title = locale === 'id' ? article.titleId : article.titleEn
  const excerpt = locale === 'id' ? article.excerptId : article.excerptEn
  const category = locale === 'id' ? article.categoryId : article.categoryEn

  return (
    <Link
      to={`/artikel/${article.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-md bg-surface-2 shadow-[0_1px_2px_rgba(0,0,0,.04)] transition-shadow duration-200 hover:shadow-[0_8px_32px_rgba(0,0,0,.08)]"
    >
      <div className="relative aspect-[16/11] overflow-hidden bg-surface">
        <img
          src={article.image}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-400 [transition-timing-function:var(--ease-brand)] group-hover:scale-[1.03]"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-7.5">
        <span className="text-eyebrow text-muted-2">
          {category} · {formatDate(article.publishedAt, locale)}
        </span>
        <h3 className="text-title text-ink">{title}</h3>
        <p className="text-body max-content-w text-muted">{excerpt}</p>

        <div className="mt-auto flex items-center gap-2 pt-2 text-body text-ink">
          <span>{t('home.articlesReadMore')}</span>
          <IconArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </Link>
  )
}
