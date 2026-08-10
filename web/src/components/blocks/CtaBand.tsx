import { useTranslation } from 'react-i18next'
import { LinkButton } from '@/components/ui/Button'
import { Reveal } from '@/components/motion/Reveal'
import { usePageContent } from '@/lib/usePageContent'

/** CTA penutup — PRD H-10. Full-bleed edge-to-edge, latar gelap (foto+overlay), satu tombol aksen. */
export function CtaBand() {
  const { t } = useTranslation()
  const title = usePageContent('cta.title')
  const subtitle = usePageContent('cta.subtitle')

  return (
    <div
      className="relative overflow-hidden"
      style={{
        backgroundImage:
          "linear-gradient(180deg, rgba(33,33,33,.55) 0%, rgba(33,33,33,.75) 100%), url('https://picsum.photos/seed/omahpala-forest/1800/1000')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-6 px-6 py-24 text-center sm:py-32">
        <Reveal className="flex max-w-2xl flex-col items-center gap-6">
          <h2 className="text-display-l text-balance text-white">{title}</h2>
          <p className="text-body-l max-content-w text-white/85">{subtitle}</p>
          <LinkButton to="/kontak" variant="primary">
            {t('home.ctaCardTitle')}
          </LinkButton>
        </Reveal>
      </div>
    </div>
  )
}
