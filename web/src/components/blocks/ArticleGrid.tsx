import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { Article } from '@/types'
import { ArticleCard } from './ArticleCard'
import { Stagger, StaggerItem } from '@/components/motion/Stagger'
import { IconButton } from '@/components/ui/Button'
import { IconChevronLeft, IconChevronRight } from '@/components/ui/Icons'

/** Carousel horizontal — kartu digeser dengan tombol panah, bukan grid statis, supaya siap
 * menampung artikel lebih dari 3 tanpa mengubah layout. */
export function ArticleGrid({ articles }: { articles: Article[] }) {
  const { t } = useTranslation()
  const scrollerRef = useRef<HTMLDivElement>(null)

  function scroll(direction: 1 | -1) {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: 'smooth' })
  }

  return (
    <div className="flex flex-col gap-6">
      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        <Stagger className="flex gap-5" stagger={0.08}>
          {articles.map((article) => (
            <StaggerItem key={article.id} className="w-[82%] shrink-0 snap-start sm:w-[46%] lg:w-[31.5%]">
              <ArticleCard article={article} />
            </StaggerItem>
          ))}
        </Stagger>
      </div>

      {articles.length > 1 && (
        <div className="flex items-center justify-end gap-2">
          <IconButton type="button" aria-label={t('home.articlesPrev')} onClick={() => scroll(-1)}>
            <IconChevronLeft className="h-5 w-5" />
          </IconButton>
          <IconButton type="button" aria-label={t('home.articlesNext')} onClick={() => scroll(1)}>
            <IconChevronRight className="h-5 w-5" />
          </IconButton>
        </div>
      )}
    </div>
  )
}
