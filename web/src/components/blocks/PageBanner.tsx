import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Container } from '@/components/ui/Container'
import { Eyebrow } from '@/components/ui/Badge'
import { IconSparkle } from '@/components/ui/Icons'
import { Reveal } from '@/components/motion/Reveal'

interface PageBannerProps {
  image: string
  eyebrow: string
  title: string
  subtitle?: string
  /** Label breadcrumb terakhir (halaman aktif). */
  crumb: string
  /** CSS object-position foto, mis. "center 30%" — atur titik fokus crop. */
  imagePosition?: string
}

/**
 * Banner header halaman publik — foto full-bleed + overlay gradient standar design.md §2, bukan
 * hero 100vh Beranda. Navbar mengambang tetap di atasnya seperti pola Hero.tsx. Mark kecil pojok
 * kiri atas + breadcrumb pojok kanan bawah. Dipakai Kontak, Produk, Program, dan Kebun supaya
 * header seragam.
 */
export function PageBanner({ image, eyebrow, title, subtitle, crumb, imagePosition }: PageBannerProps) {
  const { t } = useTranslation()

  return (
    <section data-page-banner className="relative flex min-h-[360px] items-end overflow-hidden bg-ink pt-32 sm:min-h-[420px]">
      <img
        src={image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        style={imagePosition ? { objectPosition: imagePosition } : undefined}
      />
      <div
        className="absolute inset-0"
        style={{ backgroundImage: 'linear-gradient(180deg, rgba(33,33,33,.55) 0%, rgba(33,33,33,.75) 100%)' }}
        aria-hidden
      />
      {/* Transisi ke section berikutnya — warna akhir fade (--banner-fade, diatur di index.css)
          mengikuti tone section di bawah banner, jadi tidak ada garis potong putih→abu.
          Stop gradient bertahap (eased) supaya tidak terlihat berpita. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 sm:h-40 lg:h-48"
        style={{
          backgroundImage: `linear-gradient(180deg,
            transparent 0%,
            color-mix(in srgb, var(--banner-fade) 9%, transparent) 18%,
            color-mix(in srgb, var(--banner-fade) 26%, transparent) 36%,
            color-mix(in srgb, var(--banner-fade) 50%, transparent) 54%,
            color-mix(in srgb, var(--banner-fade) 75%, transparent) 72%,
            color-mix(in srgb, var(--banner-fade) 92%, transparent) 88%,
            var(--banner-fade) 100%)`,
        }}
      />

      <Container className="absolute inset-x-0 top-6 z-10 sm:top-8">
        <IconSparkle className="h-5 w-5 text-white" aria-hidden />
      </Container>

      <Container className="absolute inset-x-0 bottom-4 z-10 sm:bottom-6">
        <div className="ml-auto flex w-fit items-center gap-1.5 rounded-pill bg-white/90 px-3 py-1.5 text-meta text-ink shadow-[0_2px_8px_rgba(0,0,0,.12)] backdrop-blur-sm">
          <Link to="/" className="hover:text-muted">
            {t('nav.home')}
          </Link>
          <span className="text-muted-2">/</span>
          <span>{crumb}</span>
        </div>
      </Container>

      <Container className="relative z-10 pb-14 sm:pb-16">
        <Reveal className="flex flex-col gap-4">
          <Eyebrow tone="white">{eyebrow}</Eyebrow>
          <h1 className="text-display-xl max-w-4xl text-balance text-white">{title}</h1>
          {subtitle && <p className="text-body-l max-w-2xl text-white/85">{subtitle}</p>}
        </Reveal>
      </Container>
    </section>
  )
}
