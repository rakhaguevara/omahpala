import { useTranslation } from 'react-i18next'
import { Eyebrow } from '@/components/ui/Badge'
import { LinkButton } from '@/components/ui/Button'
import { Reveal } from '@/components/motion/Reveal'
import { IconSparkle } from '@/components/ui/Icons'
import { usePageContent } from '@/lib/usePageContent'

/**
 * Blok "Mengapa Pala" — PRD H-08. Persis referensi: daftar baris dipisah garis putus-putus
 * (titik hijau + judul + body), foto di kanan dengan tombol CTA mengambang di tepi bawah.
 */
export function WhyPala() {
  const { t } = useTranslation()
  const title = usePageContent('why.title')
  const body = usePageContent('why.body')

  const rows = [
    { title: t('home.whyRow1Title'), body: t('home.whyRow1Body') },
    { title: t('home.whyRow2Title'), body: t('home.whyRow2Body') },
    { title: t('home.whyRow3Title'), body: t('home.whyRow3Body') },
  ]

  return (
    <div className="grid items-start gap-10 sm:grid-cols-2 sm:gap-16">
      <Reveal className="flex flex-col gap-6">
        <Eyebrow>{t('home.whyEyebrow')}</Eyebrow>
        <h2 className="text-display-l text-balance">{title}</h2>
        <p className="text-body-l max-content-w text-muted">{body}</p>

        <ul className="flex flex-col">
          {rows.map((row) => (
            <li key={row.title} className="flex flex-col gap-1.5 border-b border-dashed border-line py-5 first:pt-0 last:border-b-0">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-accent" aria-hidden />
                <h3 className="text-title">{row.title}</h3>
              </div>
              <p className="max-content-w pl-4.5 text-body text-muted">{row.body}</p>
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal delay={0.1} className="relative">
        <div className="relative z-0 overflow-hidden rounded-lg bg-white p-3 shadow-[0_16px_40px_rgba(0,0,0,.1)]">
          <img
            src="https://picsum.photos/seed/omahpala-why-farmer/900/1000"
            alt=""
            loading="lazy"
            className="aspect-[9/10] w-full rounded-md object-cover"
          />
          <IconSparkle className="absolute bottom-8 right-5 h-4 w-4 text-white/80" aria-hidden />
        </div>
        <div className="absolute inset-x-10 -bottom-6 z-10 flex justify-center sm:inset-x-14">
          <LinkButton
            to="/kebun"
            variant="primary"
            className="w-full justify-center border-2 border-white shadow-[0_12px_30px_rgba(0,0,0,.18)]"
          >
            {t('home.whyCta')}
          </LinkButton>
        </div>
      </Reveal>
    </div>
  )
}
