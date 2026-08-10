import type { ProgramPillar } from '@/types'
import {
  IconFlask,
  IconGauge,
  IconHeartPulse,
  IconSeedling,
  IconStorefront,
} from '@/components/ui/Icons'

const map: Record<ProgramPillar['icon'], typeof IconHeartPulse> = {
  screening: IconHeartPulse,
  cultivation: IconSeedling,
  production: IconFlask,
  economy: IconStorefront,
  monitoring: IconGauge,
}

export function PillarIcon({ icon, className }: { icon: ProgramPillar['icon']; className?: string }) {
  const Icon = map[icon]
  return <Icon className={className} aria-hidden style={{ width: 18, height: 18 }} />
}
