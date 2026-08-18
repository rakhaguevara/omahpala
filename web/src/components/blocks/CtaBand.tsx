import { useTranslation } from 'react-i18next'
import { useReducedMotion } from 'framer-motion'
import { LinkButton } from '@/components/ui/Button'
import { usePageContent } from '@/lib/usePageContent'
import { ScrollExpand } from '@/components/motion/ScrollExpand'

/**
 * CTA penutup — PRD H-10. Full-bleed, frame foto yang membuka penuh seiring scroll
 * (ScrollExpand, React Bits — lihat catatan penyimpangan token motion di komponennya).
 * `enabled` diset dari prefers-reduced-motion supaya pengguna yang minta motion minimal
 * langsung melihat frame dalam keadaan terbuka penuh, tanpa animasi scroll-jacking.
 */
export function CtaBand() {
  const { t } = useTranslation()
  const title = usePageContent('cta.title')
  const subtitle = usePageContent('cta.subtitle')
  const reduceMotion = useReducedMotion()

  return (
    <ScrollExpand
      src="https://picsum.photos/seed/omahpala-forest/1800/1000"
      alt={title}
      title={title}
      scrollHint={t('common.scrollHint')}
      useWindowScroll
      enabled={!reduceMotion}
      scrollDistance={1}
      holdDistance={0.2}
      startRadius={40}
      endRadius={0}
    >
      <p className="max-content-w text-body-l text-white/85">{subtitle}</p>
      <LinkButton to="/kontak" variant="primary">
        {t('home.ctaCardTitle')}
      </LinkButton>
    </ScrollExpand>
  )
}
