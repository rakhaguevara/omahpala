import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { Input } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { IconInstagram, IconMail, IconMapPin, IconPhone, IconWhatsapp } from '@/components/ui/Icons'
import { waLink } from '@/lib/utils'
import { sharedImages } from '@/lib/images'

const navItems = [
  { to: '/', key: 'home' },
  { to: '/produk', key: 'catalog' },
  { to: '/program', key: 'program' },
  { to: '/kebun', key: 'kebun' },
  { to: '/kontak', key: 'contact' },
] as const

/** Footer — PRD H-11. Latar gelap (foto+overlay) dengan kartu putih di atasnya. */
export function Footer() {
  const { t } = useTranslation()

  return (
    <footer
      className="relative overflow-hidden bg-ink pt-24 pb-10"
      style={{
        backgroundImage:
          `linear-gradient(180deg, rgba(33,33,33,.55) 0%, rgba(33,33,33,.85) 100%), url('${sharedImages.footerBg}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Transisi dari section putih sebelumnya — glow putih lembut di tepi atas footer,
          senada dengan fade di tepi bawah Hero, supaya potongan putih→foto gelap tidak tajam. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white to-transparent sm:h-40 lg:h-56"
      />
      <Container className="relative z-10">
        <div className="grid gap-10 rounded-lg bg-white p-7.5 text-ink shadow-[0_16px_60px_rgba(0,0,0,.25)] sm:p-10 lg:grid-cols-[1.1fr_1fr]">
          <div className="flex flex-col gap-6">
            <NavLink to="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white">
                OP
              </span>
              <span className="text-title">{t('common.brand')}</span>
            </NavLink>
            <p className="max-content-w text-body text-muted">{t('footer.tagline')}</p>

            <form
              className="flex flex-col gap-3 rounded-md border border-line bg-surface-2 p-5 sm:flex-row sm:items-center"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="flex-1">
                <label htmlFor="newsletter-email" className="sr-only">
                  {t('footer.newsletterPlaceholder')}
                </label>
                <Input
                  id="newsletter-email"
                  type="email"
                  required
                  placeholder={t('footer.newsletterPlaceholder')}
                  className="rounded-pill bg-white"
                />
              </div>
              <Button type="submit" variant="primary" size="sm">
                {t('footer.subscribe')}
              </Button>
            </form>

            <p className="text-meta text-muted-2">
              {t('footer.designedBy')} · © {new Date().getFullYear()} {t('common.brand')}.{' '}
              {t('footer.rights')}
            </p>
          </div>

          {/* Dipisah garis putus-putus antar kolom — persis referensi */}
          <div className="grid grid-cols-2 divide-y divide-dashed divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <div className="flex flex-col gap-3 pb-5 sm:pb-0 sm:pr-6">
              <h3 className="text-label text-muted-2">{t('footer.navTitle')}</h3>
              <ul className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <li key={item.to}>
                    <NavLink to={item.to} end={item.to === '/'} className="text-body text-ink hover:text-muted">
                      {t(`nav.${item.key}`)}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-3 py-5 sm:py-0 sm:px-6">
              <h3 className="text-label text-muted-2">{t('footer.addressTitle')}</h3>
              <p className="flex items-start gap-2 text-body text-ink">
                <IconMapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-2" aria-hidden />
                {t('footer.address1')}
              </p>
            </div>

            <div className="col-span-2 flex flex-col gap-3 pt-5 sm:col-span-1 sm:pt-0 sm:pl-6">
              <h3 className="text-label text-muted-2">{t('footer.contactTitle')}</h3>
              <a
                href={waLink('Halo Omah Pala, saya ingin bertanya lebih lanjut.')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-body text-ink hover:text-muted"
              >
                <IconWhatsapp className="h-4 w-4 text-muted-2" aria-hidden />
                +62 812-3456-7890
              </a>
              <a
                href="mailto:halo@omahpala.id"
                className="flex items-center gap-2 text-body text-ink hover:text-muted"
              >
                <IconMail className="h-4 w-4 text-muted-2" aria-hidden />
                halo@omahpala.id
              </a>
              <div className="mt-1 flex items-center gap-2">
                <a
                  href="https://instagram.com/omahpala.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram Omah Pala"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink hover:bg-surface"
                >
                  <IconInstagram className="h-4.5 w-4.5" aria-hidden />
                </a>
                <a
                  href="tel:+6281234567890"
                  aria-label="Telepon Omah Pala"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink hover:bg-surface"
                >
                  <IconPhone className="h-4.5 w-4.5" aria-hidden />
                </a>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  )
}
