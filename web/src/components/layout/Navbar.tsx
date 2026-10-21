import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useScrolled } from '@/lib/useScrolled'
import { ease } from '@/lib/motion'
import { LinkButton } from '@/components/ui/Button'
import { IconClose, IconMenu } from '@/components/ui/Icons'
import { AnimatedBackground } from '@/components/motion/AnimatedBackground'
import { LanguageSwitch } from './LanguageSwitch'

const navItems = [
  { to: '/', key: 'home' },
  { to: '/produk', key: 'catalog' },
  { to: '/program', key: 'program' },
  { to: '/kebun', key: 'kebun' },
  { to: '/find-my-polo', key: 'polo' },
] as const

/**
 * Floating Navbar — design.md §5 / PRD H-03.
 * Pill putih melayang top:20px, max-width 1120px, blur backdrop.
 * Ukuran/posisi tetap konstan saat scroll — hanya shadow yang menguat. Mobile: hamburger
 * membuka panel penuh.
 */
export function Navbar() {
  const { t } = useTranslation()
  const scrolled = useScrolled(80)
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const activeItem = navItems.find((item) => (item.to === '/' ? pathname === '/' : pathname.startsWith(item.to)))
  // Item yang sedang "disorot" pill hijau — mengikuti hover, kembali ke halaman aktif saat
  // mouse keluar (lihat AnimatedBackground). Disinkronkan ulang tiap kali rute berubah.
  const [highlightedId, setHighlightedId] = useState<string | undefined>(activeItem?.to)
  useEffect(() => {
    setHighlightedId(activeItem?.to)
  }, [activeItem?.to])

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 [transform:translateZ(0)] will-change-transform">
      <div className="mt-5 flex w-full max-w-[1120px] items-center justify-between gap-3">
        {/* Pill kiri — logo + menu, mengambang terpisah dari pill CTA (persis referensi) */}
        <div
          className={cn(
            'flex flex-1 items-center justify-between rounded-pill border border-white/60 bg-white/[.86] py-2.5 backdrop-blur-md transition-shadow duration-200 [transition-timing-function:var(--ease-brand)]',
            scrolled ? 'shadow-[0_4px_24px_rgba(0,0,0,.12)]' : 'shadow-[0_4px_24px_rgba(0,0,0,.08)]',
          )}
        >
          <NavLink to="/" className="flex items-center gap-2 pl-3" onClick={() => setOpen(false)}>
            <img src="/favicon.svg" alt="" className="h-8 w-8 rounded-full object-cover" />
            <span className="text-label font-semibold text-ink">{t('common.brand')}</span>
          </NavLink>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigasi utama">
            <AnimatedBackground
              defaultValue={activeItem?.to}
              onValueChange={(id) => setHighlightedId(id ?? undefined)}
              className="rounded-pill bg-accent"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
              enableHover
            >
              {navItems.map((item) => {
                const isHighlighted = item.to === highlightedId
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    data-id={item.to}
                    className={cn(
                      'rounded-pill px-4 py-2 text-label transition-colors duration-200',
                      isHighlighted ? 'text-accent-ink' : 'text-muted hover:text-ink',
                    )}
                  >
                    {t(`nav.${item.key}`)}
                  </NavLink>
                )
              })}
            </AnimatedBackground>
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
