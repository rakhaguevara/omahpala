import { useTranslation } from 'react-i18next'
import { Eyebrow } from '@/components/ui/Badge'
import { LinkButton } from '@/components/ui/Button'
import { IconCheck } from '@/components/ui/Icons'
import { Reveal } from '@/components/motion/Reveal'
import { Stagger, StaggerItem } from '@/components/motion/Stagger'
import { StackReveal } from '@/components/motion/StackReveal'
import { homeImages } from '@/lib/images'

const images = homeImages.intro

/** Pengantar program — PRD H-04. */
export function IntroBlock() {
  const { t } = useTranslation()
  const points = [t('home.introPoint1'), t('home.introPoint2'), t('home.introPoint3')]

  return (
    <div className="flex flex-col items-center gap-10 text-center">
      <Reveal className="flex flex-col items-center gap-5">
        <Eyebrow className="justify-center">{t('home.introEyebrow')}</Eyebrow>
        <h2 className="text-display-l max-w-3xl text-balance">
          {t('home.introTitle1')}
          <span className="text-accent-ink">{t('home.introTitleHighlight')}</span>
        </h2>
        <p className="text-body-l max-content-w text-muted">{t('home.introBody')}</p>
      </Reveal>

      {/* Mobile: cards slide in and stack one at a time as the page scrolls past, instead of the
          3 tall images each costing a full screen of scroll. Rides the page's own scrollbar. */}
      <StackReveal images={images} className="mx-auto w-full max-w-sm sm:hidden" />

      {/* Tablet/desktop: original 3-up grid, unchanged. */}
      <Stagger className="hidden w-full grid-cols-1 gap-5 sm:grid sm:grid-cols-3" stagger={0.1}>
        {images.map((src, i) => (
          <StaggerItem key={src} className={i === 1 ? 'sm:mt-8' : ''}>
            <img
              src={src}
              alt=""
              loading="lazy"
              className="aspect-[4/5] w-full rounded-md object-cover"
            />
          </StaggerItem>
        ))}
      </Stagger>

      <LinkButton to="/program" variant="dark">
        {t('home.introCta')}
      </LinkButton>

      <Reveal className="w-full">
        <ul className="mx-auto flex w-full max-w-2xl flex-col gap-3 text-left sm:flex-row sm:justify-center sm:gap-8">
          {points.map((point) => (
            <li key={point} className="flex items-center gap-2 text-body text-ink">
              <IconCheck className="h-4 w-4 shrink-0 text-accent-ink" aria-hidden />
              {point}
            </li>
          ))}
        </ul>
      </Reveal>
    </div>
  )
}
