import { useTranslation } from 'react-i18next'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Eyebrow } from '@/components/ui/Badge'
import { Badge } from '@/components/ui/Badge'
import { Reveal } from '@/components/motion/Reveal'
import { Stagger, StaggerItem } from '@/components/motion/Stagger'
import { PillarTabs } from '@/components/blocks/PillarTabs'
import { StatBand } from '@/components/blocks/StatBand'
import { Seo } from '@/components/layout/Seo'
import { useLocale } from '@/lib/useLocale'
import { programMilestones, programStats } from '@/data/program'
import { programImages } from '@/lib/images'

const galleryImages = programImages.gallery

/** Program TOGA Berdaya — PRD §7.3 PR-01..PR-05. */
export default function Program() {
  const { t } = useTranslation()
  const { locale } = useLocale()

  return (
    <>
      <Seo title={`${t('program.title')} — ${t('common.brand')}`} description={t('program.metaDescription')} path="/program" />

      <Section tone="ink" className="pt-36">
        <Container>
          <Reveal className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
            <Eyebrow tone="white" className="justify-center">
              {t('program.eyebrow')}
            </Eyebrow>
            <h1 className="text-display-xl text-balance text-white">{t('program.title')}</h1>
            <p className="text-body-l max-content-w text-white/85">{t('program.subtitle')}</p>
          </Reveal>
        </Container>
      </Section>

      {/* PR-01 + PR-02 */}
      <Section tone="surface">
        <Container>
          <Reveal className="mx-auto mb-10 flex max-w-2xl flex-col items-center gap-4 text-center">
            <h2 className="text-display-l text-balance">{t('program.pillarsTitle')}</h2>
          </Reveal>
          <PillarTabs />
        </Container>
      </Section>

      {/* PR-03 */}
      <Section tone="paper">
        <Container>
          <Reveal className="mb-10 text-center">
            <h2 className="text-display-l">{t('program.statsTitle')}</h2>
          </Reveal>
          <StatBand stats={programStats} />
        </Container>
      </Section>

      {/* PR-04 */}
      <Section tone="surface">
        <Container>
          <Reveal className="mx-auto mb-12 flex max-w-2xl flex-col items-center gap-4 text-center">
            <Eyebrow className="justify-center">{t('program.milestonesEyebrow')}</Eyebrow>
            <h2 className="text-display-l text-balance">{t('program.milestonesTitle')}</h2>
          </Reveal>

          <Stagger className="mx-auto flex max-w-2xl flex-col" stagger={0.1}>
            {programMilestones.map((m, i) => (
              <StaggerItem key={m.id} className="relative flex gap-5 pb-10 last:pb-0">
                <div className="flex flex-col items-center">
                  <span
                    className={`flex h-3.5 w-3.5 shrink-0 rounded-full ${
                      m.done ? 'bg-accent' : 'border-2 border-line bg-white'
                    }`}
                  />
                  {i < programMilestones.length - 1 && (
                    <span className="w-px flex-1 bg-line" aria-hidden />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1.5 pb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-meta text-muted-2">{m.date}</span>
                    <Badge tone={m.done ? 'accent' : 'neutral'}>
                      {m.done ? t('program.milestoneDone') : t('program.milestoneUpcoming')}
                    </Badge>
                  </div>
                  <h3 className="text-title">{locale === 'id' ? m.titleId : m.titleEn}</h3>
                  <p className="max-content-w text-body text-muted">
                    {locale === 'id' ? m.descriptionId : m.descriptionEn}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </Section>

      {/* PR-05 */}
      <Section tone="paper">
        <Container>
          <Reveal className="mx-auto mb-10 flex max-w-2xl flex-col items-center gap-4 text-center">
            <Eyebrow className="justify-center">{t('program.galleryEyebrow')}</Eyebrow>
            <h2 className="text-display-l text-balance">{t('program.galleryTitle')}</h2>
          </Reveal>
          <Stagger className="columns-2 gap-5 sm:columns-3" stagger={0.06}>
            {galleryImages.map((src) => (
              <StaggerItem key={src} className="mb-5 break-inside-avoid">
                <img src={src} alt="" loading="lazy" className="w-full rounded-md object-cover" />
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </Section>
    </>
  )
}
