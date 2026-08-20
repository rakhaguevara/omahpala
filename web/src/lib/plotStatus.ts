import type { PlotStatus } from '@/types'

export const statusKey: Record<PlotStatus, string> = {
  aktif: 'statusAktif',
  panen: 'statusPanen',
  istirahat: 'statusIstirahat',
}

export const statusTone: Record<PlotStatus, 'accent' | 'pending' | 'neutral'> = {
  aktif: 'accent',
  panen: 'pending',
  istirahat: 'neutral',
}
