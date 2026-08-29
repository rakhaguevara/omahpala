import { lazy, Suspense, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, useReducedMotion } from 'framer-motion'
import { useLocale } from '@/lib/useLocale'
import { programPillars } from '@/data/program'
import { productsSeed } from '@/data/products'
import { PillarIcon } from './PillarIcon'
import { Reveal } from '@/components/motion/Reveal'
import { EcosystemNodeCard, type EcosystemCardContent } from './EcosystemNodeCard'
import { homeImages } from '@/lib/images'

// three.js + @react-three/fiber nambah ~240 KB gzip ke bundle — code-split di sini supaya tidak
// ikut blocking parse bundle utama Beranda (LCP target PRD §9), baru diunduh saat diagram ini
// benar-benar dirender di client.
const Antigravity = lazy(() =>
  import('@/components/motion/Antigravity').then((m) => ({ default: m.Antigravity })),
)

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
  /** 'product' dapat link "Lihat detail produk"; 'partner' hanya penjelasan singkat. */
  kind: 'product' | 'partner'
  descriptionId: string
  descriptionEn: string
  slug?: string
  image: string
}

// Layer luaran — hanya output nyata: produk UNGGULAN dari data/products.ts (bukan seluruh
// katalog — sejak katalog produk diperluas jadi puluhan item placeholder per komoditas untuk
// demo halaman Produk, memetakan semuanya ke sini bikin diagram penuh sesak dan bertentangan
// dengan tujuan awal section ini), dan mitra kelembagaan yang memang disebut pada deskripsi
// pilar terkait di data/program.ts (SPI & KWT di "cultivation", TOGA Corner di "economy").
// Tidak ada angka capaian yang belum bersumber di sini.
// Deskripsi mitra (KWT/SPI/TOGA Corner) bersumber dari glosarium UX-WRITING.md §7, bukan karangan baru.
const OUTPUT_NODES_BASE: OutputNode[] = [
  ...productsSeed
    .filter((p) => p.isFeatured)
    .map((p) => ({
      id: p.id,
      labelId: p.nameId,
      labelEn: p.nameEn,
      pillarId: 'production',
      kind: 'product' as const,
      descriptionId: p.descriptionId,
      descriptionEn: p.descriptionEn,
      slug: p.slug,
      image: p.images[0],
    })),
  {
    id: 'out-kwt',
    labelId: 'KWT',
    labelEn: 'KWT',
    pillarId: 'cultivation',
    kind: 'partner',
    descriptionId: 'Kelompok Wanita Tani — bersama SPI menyusun SOP budidaya pala dan TOGA di lahan warga.',
    descriptionEn:
      'Kelompok Wanita Tani (women farmer group) — co-drafted the nutmeg and TOGA cultivation SOP with SPI.',
    image: homeImages.ecosystemKwt,
  },
  {
    id: 'out-spi',
    labelId: 'SPI',
    labelEn: 'SPI',
    pillarId: 'cultivation',
    kind: 'partner',
    descriptionId: 'Serikat Petani Indonesia — bersama KWT menyusun SOP budidaya pala dan TOGA di lahan warga.',
    descriptionEn:
      'Serikat Petani Indonesia (Indonesian Farmers Union) — co-drafted the nutmeg and TOGA cultivation SOP with KWT.',
    image: homeImages.ecosystemSpi,
  },
  {
    id: 'out-toga-corner',
    labelId: 'TOGA Corner',
    labelEn: 'TOGA Corner',
    pillarId: 'economy',
    kind: 'partner',
    descriptionId: 'Sentra fisik di balai desa: pusat edukasi, produksi, dan pemasaran produk olahan TOGA.',
    descriptionEn: 'A physical hub at the village hall for education, production, and sales of TOGA-processed goods.',
    image: homeImages.ecosystemTogaCorner,
  },
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

  const [selected, setSelected] = useState<{ type: 'pillar' | 'output'; id: string } | null>(null)

  let selectedContent: EcosystemCardContent | null = null
  if (selected?.type === 'pillar') {
    const pillar = programPillars.find((p) => p.id === selected.id)
    if (pillar) {
      selectedContent = {
        id: `pillar-${pillar.id}`,
        image: pillar.image,
        eyebrow: t('ecosystem.pillarLabel'),
        title: locale === 'id' ? pillar.titleId : pillar.titleEn,
        description: locale === 'id' ? pillar.descriptionId : pillar.descriptionEn,
        points: locale === 'id' ? pillar.pointsId : pillar.pointsEn,
      }
    }
  } else if (selected?.type === 'output') {
    const output = OUTPUT_NODES.find((o) => o.id === selected.id)
    if (output) {
      selectedContent = {
        id: `output-${output.id}`,
        image: output.image,
        eyebrow: output.kind === 'product' ? t('ecosystem.productLabel') : t('ecosystem.partnerLabel'),
        title: locale === 'id' ? output.labelId : output.labelEn,
        description: locale === 'id' ? output.descriptionId : output.descriptionEn,
        productSlug: output.kind === 'product' ? output.slug : undefined,
      }
    }
  }

  return (
    <>
    <Reveal className="mx-auto flex aspect-square w-full max-w-3xl items-center justify-center">
      <div className="relative h-full w-full overflow-hidden">
        {/* Latar partikel — Antigravity (React Bits, three.js). Dimatikan total kalau
            prefers-reduced-motion aktif, konsisten dengan primitive motion lain di proyek ini. */}
        {!reduce && (
          <div className="absolute inset-0 -m-[10%]">
            <Suspense fallback={null}>
              <Antigravity
                count={500}
                magnetRadius={8}
                ringRadius={8}
                waveSpeed={4.8}
                waveAmplitude={1}
                particleSize={1.3}
                lerpSpeed={0.18}
                color="#7eea57"
                autoAnimate
                particleVariance={1}
                particleShape="sphere"
              />
            </Suspense>
          </div>
        )}

        <svg
          viewBox="0 0 100 100"
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden
        >
          {/* Cincin pilar — lingkaran sempurna (bukan poligon garis lurus antar titik), karena
              semua pilar berjarak sama (pillarRadius) dari pusat. Garis putus-putus hijau aksen
              yang mengalir (animasi "connecting") — design.md §3 "garis indikator progres"
              termasuk pemakaian aksen yang diperbolehkan. */}
          <motion.circle
            cx={50}
            cy={50}
            r={pillarRadius}
            className="fill-none stroke-accent"
            strokeWidth={0.5}
            strokeDasharray="3 2.5"
            animate={reduce ? undefined : { strokeDashoffset: [0, -5.5] }}
            transition={reduce ? undefined : { duration: 1.4, ease: 'linear', repeat: Infinity }}
          />
          {/* Cincin luaran — lingkaran sempurna juga, semua node luaran berjarak sama (outputRadius). */}
          <motion.circle
            cx={50}
            cy={50}
            r={outputRadius}
            className="fill-none stroke-accent"
            strokeWidth={0.5}
            strokeDasharray="3 2.5"
            animate={reduce ? undefined : { strokeDashoffset: [0, -5.5] }}
            transition={reduce ? undefined : { duration: 1.4, ease: 'linear', repeat: Infinity }}
          />
        </svg>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="flex h-16 w-16 flex-col items-center justify-center gap-0.5 rounded-full border border-line-dark bg-ink-2 p-1.5 text-center text-white shadow-[0_0_32px_rgba(126,234,87,.14)] sm:h-24 sm:w-24 sm:gap-1 sm:p-2 lg:h-32 lg:w-32">
            <span className="text-[9px] leading-tight font-semibold sm:text-label">{t('common.brand')}</span>
            <span className="text-[8px] leading-tight text-white/70 sm:text-meta">{t('common.programName')}</span>
          </div>
        </div>

        {pillarPoints.map((pillar) => (
          <div
            key={pillar.id}
            className="pointer-events-none absolute flex w-14 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 text-center sm:w-20 sm:gap-1.5 lg:w-24 lg:gap-2"
            style={{ left: `${pillar.x}%`, top: `${pillar.y}%` }}
          >
            <button
              type="button"
              onClick={() => setSelected({ type: 'pillar', id: pillar.id })}
              aria-label={locale === 'id' ? pillar.titleId : pillar.titleEn}
              className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full border border-line-dark bg-ink-2 shadow-[0_2px_8px_rgba(0,0,0,.24)] transition-[box-shadow,transform,border-color] duration-200 [transition-timing-function:var(--ease-brand)] hover:-translate-y-0.5 hover:border-accent hover:shadow-[0_4px_16px_rgba(0,0,0,.32)] sm:h-10 sm:w-10 lg:h-12 lg:w-12"
            >
              <PillarIcon icon={pillar.icon} className="h-3.5 w-3.5 text-accent sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
            </button>
            <span className="text-[10px] leading-tight text-white/90 sm:text-meta">
              {locale === 'id' ? pillar.titleId : pillar.titleEn}
            </span>
          </div>
        ))}

        {outputPoints.map((output) => (
          <div
            key={output.id}
            className="pointer-events-none absolute flex w-14 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 text-center sm:w-16 sm:gap-1.5 lg:w-20"
            style={{ left: `${output.x}%`, top: `${output.y}%` }}
          >
            <button
              type="button"
              onClick={() => setSelected({ type: 'output', id: output.id })}
              aria-label={locale === 'id' ? output.labelId : output.labelEn}
              className="pointer-events-auto flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-line-dark bg-ink-2 transition-[box-shadow,transform,border-color] duration-200 [transition-timing-function:var(--ease-brand)] hover:-translate-y-0.5 hover:border-accent hover:shadow-[0_4px_16px_rgba(0,0,0,.32)] sm:h-8 sm:w-8 lg:h-9 lg:w-9"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
            </button>
            <span className="text-[10px] leading-tight text-white/60 sm:text-meta">
              {locale === 'id' ? output.labelId : output.labelEn}
            </span>
          </div>
        ))}
      </div>
    </Reveal>

    <EcosystemNodeCard content={selectedContent} onClose={() => setSelected(null)} />
    </>
  )
}
