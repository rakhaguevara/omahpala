import type { StatItem } from '@/types'
import { useLocale } from '@/lib/useLocale'
import { CountUp } from '@/components/motion/CountUp'
import { Stagger, StaggerItem } from '@/components/motion/Stagger'
import { IconCalendar, IconFlask, IconGauge, IconSeedling } from '@/components/ui/Icons'

// Urutan tetap mengikuti data/program.ts programStats: KK menanam TOGA, SOP tersusun,
// produk olahan, bulan pelaksanaan.
const icons = [IconSeedling, IconGauge, IconFlask, IconCalendar]

/** Band statistik — PRD H-07 / PR-03. 4 kolom dipisah garis vertikal, 2×2 di mobile. */
export function StatBand({ stats }: { stats: StatItem[] }) {
  const { locale } = useLocale()

  return (
    <Stagger
      className="grid grid-cols-2 divide-x divide-y divide-dashed divide-line rounded-lg border border-dashed border-line sm:grid-cols-4 sm:divide-y-0"
      stagger={0.1}
    >
      {stats.map((stat, i) => {
        const Icon = icons[i % icons.length]
        return (
          <StaggerItem key={stat.id} className="flex flex-col items-center gap-3 p-7.5 text-center">
            <Icon className="h-6 w-6 text-muted-2" aria-hidden />
            <p className="text-display-m tabular-nums text-ink">
              {stat.prefix}
              <CountUp value={stat.value} suffix={stat.suffix} />
            </p>
            <p className="text-meta text-muted">{locale === 'id' ? stat.labelId : stat.labelEn}</p>
          </StaggerItem>
        )
      })}
    </Stagger>
  )
}
