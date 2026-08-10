import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useScrolled } from '@/lib/useScrolled'
import { ease } from '@/lib/motion'
import { LinkButton } from '@/components/ui/Button'
import { IconClose, IconMenu } from '@/components/ui/Icons'
import { LanguageSwitch } from './LanguageSwitch'

const navItems = [
  { to: '/', key: 'home' },
  { to: '/produk', key: 'catalog' },
  { to: '/program', key: 'program' },
  { to: '/kebun', key: 'kebun' },
  { to: '/kontak', key: 'contact' },
] as const

/**
 * Floating Navbar — design.md §5 / PRD H-03.
 * Pill putih melayang top:20px, max-width 1120px, blur backdrop.
 * Menyusut saat scroll > 80px. Mobile: hamburger membuka panel penuh.
 */
export function Navbar() {
  const { t } = useTranslation()
  const scrolled = useScrolled(80)
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4">
      <div
        className={cn(
          'mt-5 flex w-full max-w-[1120px] items-center justify-between gap-3 transition-[margin] duration-200 [transition-timing-function:var(--ease-brand)]',
          scrolled ? 'mt-3' : 'mt-5',
        )}
      >
        {/* Pill kiri — logo + menu, mengambang terpisah dari pill CTA (persis referensi) */}
        <div
          className={cn(
            'flex flex-1 items-center justify-between rounded-pill border border-white/60 bg-white/[.86] backdrop-blur-md transition-[padding,box-shadow] duration-200 [transition-timing-function:var(--ease-brand)]',
            scrolled ? 'py-2 shadow-[0_4px_24px_rgba(0,0,0,.12)]' : 'py-2.5 shadow-[0_4px_24px_rgba(0,0,0,.08)]',
          )}
        >
          <NavLink to="/" className="flex items-center gap-2 pl-3" onClick={() => setOpen(false)}>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white">
              OP
            </span>
            <span className="text-label font-semibold text-ink">{t('common.brand')}</span>
          </NavLink>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigasi utama">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'rounded-pill px-4 py-2 text-label transition-colors duration-200',
                    isActive ? 'bg-surface text-ink' : 'text-muted hover:text-ink',
                  )
                }
              >
                {t(`nav.${item.key}`)}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center pr-2 lg:flex">
            <LanguageSwitch />
          </div>

          <button
            type="button"
            className="mr-1.5 flex h-10 w-10 items-center justify-center rounded-full text-ink lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav-panel"
            aria-label={open ? t('common.close') : t('common.menu')}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <IconClose className="h-6 w-6" /> : <IconMenu className="h-6 w-6" />}
          </button>
        </div>

        {/* Pill kanan — CTA hijau, halo putih di sekelilingnya seperti referensi */}
        <div
          className={cn(
            'hidden shrink-0 rounded-pill border border-white/60 bg-white/[.86] p-1.5 backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,.08)] lg:block',
          )}
        >
          <LinkButton to="/kontak" variant="primary" size="sm">
            {t('nav.contactCta')}
          </LinkButton>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav-panel"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease }}
            className="fixed inset-x-4 top-24 z-40 flex flex-col gap-1 rounded-md border border-line bg-white p-5 shadow-[0_16px_40px_rgba(0,0,0,.14)] lg:hidden"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'rounded-sm px-4 py-3 text-title',
                    isActive ? 'bg-surface text-ink' : 'text-ink',
                  )
                }
              >
                {t(`nav.${item.key}`)}
              </NavLink>
            ))}
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-4">
              <LanguageSwitch />
              <LinkButton to="/kontak" variant="primary" size="sm" onClick={() => setOpen(false)}>
                {t('nav.contactCta')}
              </LinkButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
