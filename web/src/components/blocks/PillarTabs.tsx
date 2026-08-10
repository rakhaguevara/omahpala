import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ProgramPillar } from '@/types'
import { useLocale } from '@/lib/useLocale'
import { programPillars } from '@/data/program'
import { Chip } from '@/components/ui/Chip'
import { IconCheck } from '@/components/ui/Icons'
import { PillarIcon } from './PillarIcon'
import { TabPanel } from '@/components/motion/TabPanel'

/** Bagian pilar program dengan chip tab — PRD H-05 & PR-01/PR-02. */
export function PillarTabs({ pillars = programPillars }: { pillars?: ProgramPillar[] }) {
  const { t } = useTranslation()
  const { locale } = useLocale()
  const [active, setActive] = useState(pillars[0]?.id)
  const current = pillars.find((p) => p.id === active) ?? pillars[0]

  return (
    <div className="flex flex-col gap-10">
      <div
        className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label={t('home.pillarsTitle')}
      >
        {pillars.map((p) => (
          <Chip
            key={p.id}
            role="tab"
            active={p.id === active}
            aria-selected={p.id === active}
            onClick={() => setActive(p.id)}
          >
            <span className="flex items-center gap-2">
              <PillarIcon icon={p.icon} className={p.id === active ? 'text-accent' : 'text-muted-2'} />
              {locale === 'id' ? p.titleId : p.titleEn}
            </span>
          </Chip>
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
    </div>
  )
}
