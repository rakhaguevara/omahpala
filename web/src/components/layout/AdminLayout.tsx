import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { RequireAuth } from '@/components/admin/RequireAuth'
import { can, logout } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { IconClose, IconMenu } from '@/components/ui/Icons'
import { LanguageSwitch } from '@/components/layout/LanguageSwitch'

type AdminArea = 'produk' | 'pesanan' | 'kebun' | 'konten' | 'polo'

interface AdminNavLink {
  to: string
  end: boolean
  key: string
  area: AdminArea | null
}

const links: AdminNavLink[] = [
  { to: '/admin', end: true, key: 'navDashboard', area: null },
  { to: '/admin/produk', end: false, key: 'navProducts', area: 'produk' },
  { to: '/admin/pesanan', end: false, key: 'navOrders', area: 'pesanan' },
  { to: '/admin/kebun', end: false, key: 'navKebun', area: 'kebun' },
  { to: '/admin/konten', end: false, key: 'navContent', area: 'konten' },
  { to: '/admin/find-my-polo', end: false, key: 'navPolo', area: 'polo' },
]

/** Panel admin — responsif penuh (A-09): sidebar desktop, drawer di mobile. */
export function AdminLayout() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  return (
    <RequireAuth>
      {(user) => {
        const visibleLinks = links.filter((l) => !l.area || can(user.role, l.area))
        return (
          <div className="flex h-screen bg-surface text-ink">
            <aside
              className={cn(
                'fixed inset-y-0 left-0 z-40 w-72 shrink-0 -translate-x-full overflow-y-auto border-r border-line bg-white p-6 transition-transform duration-300 lg:translate-x-0',
                open && 'translate-x-0',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <NavLink to="/admin" className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white">
                    OP
                  </span>
                  <span className="text-label font-semibold">{t('common.brand')}</span>
                </NavLink>
                <div className="flex items-center gap-2">
                  <LanguageSwitch />
                  <button
                    type="button"
                    className="rounded-full p-2 lg:hidden"
                    onClick={() => setOpen(false)}
                    aria-label={t('common.close')}
                  >
                    <IconClose className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <nav className="mt-8 flex flex-col gap-1" aria-label="Navigasi admin">
                {visibleLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'rounded-sm px-4 py-3 text-label',
                        isActive ? 'bg-surface text-ink' : 'text-muted hover:bg-surface hover:text-ink',
                      )
                    }
                  >
                    {t(`admin.${link.key}`)}
                  </NavLink>
                ))}
              </nav>

              <div className="mt-8 flex flex-col gap-2 border-t border-line pt-6">
                <p className="px-4 text-meta text-muted-2">{user.name}</p>
                <NavLink to="/" className="rounded-sm px-4 py-3 text-label text-muted hover:bg-surface hover:text-ink">
                  {t('admin.backToSite')}
                </NavLink>
                <button
                  type="button"
                  className="rounded-sm px-4 py-3 text-left text-label text-muted hover:bg-surface hover:text-ink"
                  onClick={() => {
                    logout()
                    navigate('/admin/login', { replace: true })
                  }}
                >
                  {t('admin.logout')}
                </button>
              </div>
            </aside>

            {open && (
              <button
                type="button"
                aria-label={t('common.close')}
                className="fixed inset-0 z-30 bg-black/30 lg:hidden"
                onClick={() => setOpen(false)}
              />
            )}

            <div className="flex h-full flex-1 flex-col overflow-y-auto lg:pl-72">
              <header className="flex items-center justify-between border-b border-line bg-white px-5 py-4 lg:hidden">
                <span className="text-label font-semibold">{t('admin.dashboard')}</span>
                <div className="flex items-center gap-3">
                  <LanguageSwitch />
                  <button
                    type="button"
                    className="rounded-full p-2"
                    onClick={() => setOpen(true)}
                    aria-label={t('common.menu')}
                  >
                    <IconMenu className="h-5 w-5" />
                  </button>
                </div>
              </header>
              <div className="p-5 sm:p-8 lg:p-10">
                <Outlet />
              </div>
            </div>
          </div>
        )
      }}
    </RequireAuth>
  )
}
