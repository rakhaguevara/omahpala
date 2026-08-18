import { useTranslation } from 'react-i18next'
import { motion, useReducedMotion } from 'framer-motion'
import { useLocale } from '@/lib/useLocale'
import { programPillars } from '@/data/program'
import { productsSeed } from '@/data/products'
import { PillarIcon } from './PillarIcon'
import { Reveal } from '@/components/motion/Reveal'

// Sudut tetap untuk 5 pilar (derajat; 0 = kanan, 90 = bawah, searah jarum jam — x=cos, y=sin
// pada koordinat CSS top/left).
const PILLAR_ANGLES: Record<string, number> = {
  screening: 270,
  cultivation: 342,
  production: 54,
  economy: 126,
  monitoring: 198,
}

interface OutputNode {
  id: string
  labelId: string
  labelEn: string
  pillarId: string
}

// Layer luaran — hanya output nyata: 3 produk dari data/products.ts, dan mitra kelembagaan yang
// memang disebut pada deskripsi pilar terkait di data/program.ts (SPI & KWT di "cultivation",
// TOGA Corner di "economy"). Tidak ada angka capaian yang belum bersumber di sini.
const OUTPUT_NODES_BASE: OutputNode[] = [
  ...productsSeed.map((p) => ({ id: p.id, labelId: p.nameId, labelEn: p.nameEn, pillarId: 'production' })),
  { id: 'out-kwt', labelId: 'KWT', labelEn: 'KWT', pillarId: 'cultivation' },
  { id: 'out-spi', labelId: 'SPI', labelEn: 'SPI', pillarId: 'cultivation' },
  { id: 'out-toga-corner', labelId: 'TOGA Corner', labelEn: 'TOGA Corner', pillarId: 'economy' },
]

// Sebaran rata di lingkaran (360° / 6 node) — bukan dikelompokkan di dekat pilar asalnya, supaya
// cincin luarnya tetap bentuk lingkaran beraturan, bukan jalur yang timpang.
const OUTPUT_NODES = OUTPUT_NODES_BASE.map((o, i) => ({
  ...o,
  angle: (360 / OUTPUT_NODES_BASE.length) * i,
}))

function pointAt(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: 50 + radius * Math.cos(rad), y: 50 + radius * Math.sin(rad) }
}

/**
 * Diagram ekosistem TOGA — PRD H-09 (Could). Tiga lapis dari pusat ke luar: brand, lima pilar
 * program, dan luaran nyata (produk + mitra kelembagaan). Tiap lapis membentuk cincin yang
 * menghubungkan node-node di dalamnya satu sama lain, dan tiap luaran ditarik garis ke pilar
 * asalnya — jadi satu jaring, bukan node yang berdiri sendiri-sendiri.
 */
export function EcosystemDiagram() {
  const { t } = useTranslation()
  const { locale } = useLocale()
  const reduce = useReducedMotion()
  // Radius dihitung di JS (persen), jadi tidak bisa pakai prefix responsive Tailwind — dipilih
  // nilai yang aman untuk kontainer sekecil layar HP; ukuran elemen (ikon/label/lingkaran pusat)
  // yang menyesuaikan lewat breakpoint di bawah.
  const pillarRadius = 22
  const outputRadius = 38

  const pillarPoints = programPillars.map((p) => ({ ...p, ...pointAt(PILLAR_ANGLES[p.id], pillarRadius) }))
  const outputPoints = OUTPUT_NODES.map((o) => ({ ...o, ...pointAt(o.angle, outputRadius) }))
  const outputRing = [...outputPoints].sort((a, b) => a.angle - b.angle)

  return (
    <Reveal className="mx-auto flex aspect-square w-full max-w-3xl items-center justify-center">
      <div className="relative h-full w-full">
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
          {/* Cincin pilar — menghubungkan kelima pilar satu sama lain, garis putus-putus hijau
              aksen yang mengalir (animasi "connecting") — design.md §3 "garis indikator progres"
              termasuk pemakaian aksen yang diperbolehkan. */}
          <motion.polygon
            points={pillarPoints.map((p) => `${p.x},${p.y}`).join(' ')}
            className="fill-none stroke-accent"
            strokeWidth={0.5}
            strokeDasharray="3 2.5"
            animate={reduce ? undefined : { strokeDashoffset: [0, -5.5] }}
            transition={reduce ? undefined : { duration: 1.4, ease: 'linear', repeat: Infinity }}
          />
          {/* Cincin luaran — menghubungkan semua node luaran satu sama lain */}
          <motion.polygon
            points={outputRing.map((p) => `${p.x},${p.y}`).join(' ')}
            className="fill-none stroke-accent"
            strokeWidth={0.5}
            strokeDasharray="3 2.5"
            animate={reduce ? undefined : { strokeDashoffset: [0, -5.5] }}
            transition={reduce ? undefined : { duration: 1.4, ease: 'linear', repeat: Infinity }}
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-16 w-16 flex-col items-center justify-center gap-0.5 rounded-full bg-ink p-1.5 text-center text-white shadow-[0_8px_24px_rgba(0,0,0,.18)] sm:h-24 sm:w-24 sm:gap-1 sm:p-2 lg:h-32 lg:w-32">
            <span className="text-[9px] leading-tight font-semibold sm:text-label">{t('common.brand')}</span>
            <span className="text-[8px] leading-tight text-white/70 sm:text-meta">{t('common.programName')}</span>
          </div>
        </div>

        {pillarPoints.map((pillar) => (
          <div
            key={pillar.id}
            className="absolute flex w-14 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 text-center sm:w-20 sm:gap-1.5 lg:w-24 lg:gap-2"
            style={{ left: `${pillar.x}%`, top: `${pillar.y}%` }}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white shadow-[0_2px_8px_rgba(0,0,0,.06)] sm:h-10 sm:w-10 lg:h-12 lg:w-12">
              <PillarIcon icon={pillar.icon} className="h-3.5 w-3.5 text-accent-ink sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
            </div>
            <span className="text-[10px] leading-tight text-ink sm:text-meta">
              {locale === 'id' ? pillar.titleId : pillar.titleEn}
            </span>
          </div>
        ))}

        {outputPoints.map((output) => (
          <div
            key={output.id}
            className="absolute flex w-14 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 text-center sm:w-16 sm:gap-1.5 lg:w-20"
            style={{ left: `${output.x}%`, top: `${output.y}%` }}
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-line bg-surface-2 sm:h-8 sm:w-8 lg:h-9 lg:w-9">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
            </div>
            <span className="text-[10px] leading-tight text-muted-2 sm:text-meta">
              {locale === 'id' ? output.labelId : output.labelEn}
            </span>
          </div>
        ))}
      </div>
    </Reveal>
  )
}
