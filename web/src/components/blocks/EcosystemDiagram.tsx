import { useTranslation } from 'react-i18next'
import { useLocale } from '@/lib/useLocale'
import { programPillars } from '@/data/program'
import { PillarIcon } from './PillarIcon'
import { Reveal } from '@/components/motion/Reveal'

// Sudut tetap untuk 5 pilar dalam lingkaran (derajat, 0 = atas, searah jarum jam).
const ANGLES = [270, 342, 54, 126, 198]

/** Diagram ekosistem TOGA — PRD H-09 (Could). Grafis melingkar, pilar mengelilingi brand. */
export function EcosystemDiagram() {
  const { t } = useTranslation()
  const { locale } = useLocale()
  const radius = 42

  return (
    <Reveal className="mx-auto flex aspect-square w-full max-w-md items-center justify-center">
      <div className="relative h-full w-full">
        <div className="absolute inset-[18%] rounded-full border border-dashed border-line" aria-hidden />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-28 w-28 flex-col items-center justify-center gap-1 rounded-full bg-ink text-center text-white shadow-[0_8px_24px_rgba(0,0,0,.18)]">
            <span className="text-label font-semibold">{t('common.brand')}</span>
            <span className="text-meta text-white/70">{t('common.programName')}</span>
          </div>
        </div>

        {programPillars.map((pillar, i) => {
          const angle = (ANGLES[i] * Math.PI) / 180
          const x = 50 + radius * Math.cos(angle)
          const y = 50 + radius * Math.sin(angle)
          return (
            <div
              key={pillar.id}
              className="absolute flex w-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 text-center"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-white shadow-[0_2px_8px_rgba(0,0,0,.06)]">
                <PillarIcon icon={pillar.icon} className="h-5 w-5 text-accent-ink" />
              </div>
              <span className="text-meta text-ink">
                {locale === 'id' ? pillar.titleId : pillar.titleEn}
              </span>
            </div>
          )
        })}
      </div>
    </Reveal>
  )
}
