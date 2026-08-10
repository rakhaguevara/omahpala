import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { getSession } from '@/lib/auth'
import { useInquiries, useProducts } from '@/lib/useEntities'
import { Seo } from '@/components/layout/Seo'

/** Dashboard admin — PRD §7.6 A-03. */
export default function Dashboard() {
  const { t } = useTranslation()
  const user = getSession()
  const { items: inquiries } = useInquiries()
  const { items: products } = useProducts()

  const newInquiries = inquiries.filter((i) => i.status === 'baru').length
  const now = new Date()
  const ordersThisMonth = inquiries.filter((i) => {
    const d = new Date(i.createdAt)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length
  const needsAttention = products.filter(
    (p) => !p.isActive || p.certifications.some((c) => c.status === 'dalam-proses'),
  ).length

  const cards = [
    { label: t('admin.dashboardNewInquiries'), value: newInquiries, to: '/admin/pesanan' },
    { label: t('admin.dashboardOrdersMonth'), value: ordersThisMonth, to: '/admin/pesanan' },
    { label: t('admin.dashboardLowStock'), value: needsAttention, to: '/admin/produk' },
  ]

  return (
    <div className="flex flex-col gap-8">
      <Seo title={`${t('admin.dashboard')} — ${t('common.brand')}`} description="" path="/admin" />
      <div>
        <h1 className="text-display-m">{t('admin.dashboard')}</h1>
        {user && <p className="mt-1 text-body text-muted">{t('admin.dashboardWelcome', { name: user.name })}</p>}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            to={card.to}
            className="flex flex-col gap-2 rounded-md border border-line bg-white p-6 transition-colors hover:border-ink/30"
          >
            <span className="text-display-m tabular-nums text-ink">{card.value}</span>
            <span className="text-label text-muted">{card.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
