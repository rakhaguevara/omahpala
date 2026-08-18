import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ProgramPillar } from '@/types'
import { useLocale } from '@/lib/useLocale'
import { programPillars } from '@/data/program'
import { cn } from '@/lib/utils'
import { IconButton } from '@/components/ui/Button'
import { IconCheck, IconChevronLeft, IconChevronRight } from '@/components/ui/Icons'
import { PillarIcon } from './PillarIcon'
import { TabPanel } from '@/components/motion/TabPanel'

/** Bagian pilar program dengan chip tab — PRD H-05 & PR-01/PR-02. */
export function PillarTabs({ pillars = programPillars }: { pillars?: ProgramPillar[] }) {
  const { t } = useTranslation()
  const { locale } = useLocale()
  const [active, setActive] = useState(pillars[0]?.id)
  const currentIndex = Math.max(0, pillars.findIndex((p) => p.id === active))
  const current = pillars[currentIndex] ?? pillars[0]

  const goTo = (offset: number) => {
    const next = (currentIndex + offset + pillars.length) % pillars.length
    setActive(pillars[next]?.id)
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label={t('home.pillarsTitle')}>
        {pillars.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={p.id === active}
            onClick={() => setActive(p.id)}
            className={cn(
              'inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-none border px-5 py-3 text-label transition-colors duration-200 [transition-timing-function:var(--ease-brand)]',
              p.id === active
                ? 'border-ink bg-ink text-white'
                : 'border-line bg-transparent text-ink hover:border-ink/40',
            )}
          >
            <PillarIcon icon={p.icon} className={p.id === active ? 'text-accent' : 'text-muted-2'} />
            {locale === 'id' ? p.titleId : p.titleEn}
          </button>
        ))}
      </div>

      {current && (
        <TabPanel tabKey={current.id}>
          <div className="grid gap-8 rounded-lg bg-white p-6 sm:grid-cols-2 sm:p-10">
            <img
              src={current.image}
              alt={locale === 'id' ? current.titleId : current.titleEn}
              loading="lazy"
              className="aspect-[4/5] w-full rounded-md object-cover"
            />
            <div className="flex flex-col gap-5">
              <h3 className="text-display-m">{locale === 'id' ? current.titleId : current.titleEn}</h3>
              <p className="text-body-l max-content-w text-muted">
                {locale === 'id' ? current.descriptionId : current.descriptionEn}
              </p>
              <ul className="flex flex-col gap-3">
                {(locale === 'id' ? current.pointsId : current.pointsEn).map((point) => (
                  <li key={point} className="flex items-start gap-2 text-body text-ink">
                    <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent-ink" aria-hidden />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </TabPanel>
      )}

      {pillars.length > 1 && (
        <div className="flex items-center justify-between sm:hidden">
          <IconButton
            type="button"
            aria-label={t('home.pillarsPrev')}
            onClick={() => goTo(-1)}
          >
            <IconChevronLeft className="h-5 w-5" />
          </IconButton>
          <span className="text-meta text-muted-2">
            {currentIndex + 1} / {pillars.length}
          </span>
          <IconButton
            type="button"
            aria-label={t('home.pillarsNext')}
            onClick={() => goTo(1)}
          >
            <IconChevronRight className="h-5 w-5" />
          </IconButton>
        </div>
      )}
    </div>
  )
}
