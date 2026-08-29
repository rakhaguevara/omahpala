import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { getSession, can } from '@/lib/auth'
import { useFarmers, useInquiries, usePlots, useProducts } from '@/lib/useEntities'
import { useLocale } from '@/lib/useLocale'
import { Seo } from '@/components/layout/Seo'
import { Badge } from '@/components/ui/Badge'
import { LinkButton } from '@/components/ui/Button'
import { IconAlertTriangle, IconArrowRight } from '@/components/ui/Icons'
import { cn, commodityLabel, formatDate, monthShort } from '@/lib/utils'
import type { Inquiry, InquiryStatus } from '@/types'

const inquiryStatusTone: Record<InquiryStatus, 'accent' | 'pending' | 'neutral'> = {
  baru: 'pending',
  diproses: 'neutral',
  selesai: 'accent',
}

const DAY_MS = 24 * 60 * 60 * 1000

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function buildTrend(inquiries: Inquiry[]) {
  const now = new Date()
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const month = d.getMonth() + 1
    const year = d.getFullYear()
    const count = inquiries.filter((inq) => {
      const c = new Date(inq.createdAt)
      return c.getMonth() + 1 === month && c.getFullYear() === year
    }).length
    return { month, year, count }
  })
}

/** Dashboard admin — PRD §7.6 A-03 (kartu wajib) + ringkasan operasional, aksi cepat, dan
 * indikator "perlu tindakan" yang dibangun dari data produk/lahan/penanam/pesanan yang sudah ada. */
export default function Dashboard() {
  const { t } = useTranslation()
  const { locale } = useLocale()
  const user = getSession()
  const { items: inquiries } = useInquiries()
  const { items: products } = useProducts()
  const { items: plots } = usePlots()
  const { items: farmers } = useFarmers()

  if (!user) return null

  const canKebun = can(user.role, 'kebun')
  const canPesanan = can(user.role, 'pesanan')
  const canProduk = can(user.role, 'produk')

  const now = new Date()
  const newInquiries = inquiries.filter((i) => i.status === 'baru').length
  const ordersThisMonth = inquiries.filter((i) => {
    const d = new Date(i.createdAt)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length
  const needsAttention = products.filter(
    (p) => !p.isActive || p.certifications.some((c) => c.status === 'dalam-proses'),
  ).length

  const kpiCards = [
    { label: t('admin.dashboardNewInquiries'), value: newInquiries, to: '/admin/pesanan' },
    { label: t('admin.dashboardOrdersMonth'), value: ordersThisMonth, to: '/admin/pesanan' },
    { label: t('admin.dashboardLowStock'), value: needsAttention, to: '/admin/produk' },
  ]

  const activeProducts = products.filter((p) => p.isActive).length
  const featuredProducts = products.filter((p) => p.isFeatured).length
  const pendingCertCount = products.reduce(
    (sum, p) => sum + p.certifications.filter((c) => c.status === 'dalam-proses').length,
    0,
  )
  const activePlots = plots.filter((p) => p.status === 'aktif').length
  const productsMissingPrice = products.filter((p) => p.isActive && p.priceIdr === null && p.priceUsd === null)
  const productsMissingImage = products.filter((p) => p.isActive && p.images.length === 0)
  const staleInquiries = inquiries.filter(
    (i) => i.status === 'baru' && now.getTime() - new Date(i.createdAt).getTime() > 3 * DAY_MS,
  )
  const orphanFarmers = farmers.filter((f) => f.plotIds.length === 0)

  const actionItems: { key: string; label: string; to: string }[] = []
  if (canProduk && productsMissingPrice.length > 0) {
    actionItems.push({
      key: 'price',
      label: t('admin.dashboardActionMissingPrice', { count: productsMissingPrice.length }),
      to: '/admin/produk',
    })
  }
  if (canProduk && productsMissingImage.length > 0) {
    actionItems.push({
      key: 'image',
      label: t('admin.dashboardActionMissingImage', { count: productsMissingImage.length }),
      to: '/admin/produk',
    })
  }
  if (canProduk && pendingCertCount > 0) {
    actionItems.push({
      key: 'certs',
      label: t('admin.dashboardActionPendingCerts', { count: pendingCertCount }),
      to: '/admin/produk',
    })
  }
  if (canPesanan && staleInquiries.length > 0) {
    actionItems.push({
      key: 'stale',
      label: t('admin.dashboardActionStaleInquiries', { count: staleInquiries.length }),
      to: '/admin/pesanan',
    })
  }
  if (canKebun && orphanFarmers.length > 0) {
    actionItems.push({
      key: 'orphan',
      label: t('admin.dashboardActionOrphanFarmers', { count: orphanFarmers.length }),
      to: '/admin/kebun',
    })
  }

  const currentMonth = now.getMonth() + 1
  const harvestingNow = canKebun
    ? plots
        .flatMap((plot) => plot.calendar.filter((c) => c.harvestMonths.includes(currentMonth)).map((c) => ({ plot, entry: c })))
        .sort((a, b) => a.plot.code.localeCompare(b.plot.code))
    : []

  const trend = canPesanan ? buildTrend(inquiries) : []
  const trendMax = Math.max(1, ...trend.map((m) => m.count))

  const statusCounts: Record<InquiryStatus, number> = { baru: 0, diproses: 0, selesai: 0 }
  inquiries.forEach((i) => statusCounts[i.status]++)

  return (
    <div className="flex flex-col gap-8">
      <Seo title={`${t('admin.dashboard')} — ${t('common.brand')}`} description="" path="/admin" />
      <div>
        <h1 className="text-display-m">{t('admin.dashboard')}</h1>
        <p className="mt-1 text-body text-muted">{t('admin.dashboardWelcome', { name: user.name })}</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {kpiCards.map((card) => (
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

      <div className="flex flex-col gap-3">
        <h2 className="text-label font-semibold text-ink">{t('admin.dashboardOverview')}</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {canProduk && (
            <MiniStat
              label={t('admin.dashboardActiveProducts')}
              value={activeProducts}
              sub={t('admin.dashboardOfTotal', { count: products.length })}
            />
          )}
          {canProduk && <MiniStat label={t('admin.dashboardFeaturedProducts')} value={featuredProducts} />}
          {canProduk && <MiniStat label={t('admin.dashboardPendingCerts')} value={pendingCertCount} />}
          {canKebun && (
            <MiniStat
              label={t('admin.dashboardActivePlots')}
              value={activePlots}
              sub={t('admin.dashboardOfTotal', { count: plots.length })}
            />
          )}
          {canKebun && <MiniStat label={t('admin.dashboardTotalFarmers')} value={farmers.length} />}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-label font-semibold text-ink">{t('admin.dashboardQuickActions')}</h2>
        <div className="flex flex-wrap gap-3">
          {canProduk && (
            <LinkButton to="/admin/produk" variant="dark" size="sm">
              + {t('admin.productAdd')}
            </LinkButton>
          )}
          {canKebun && (
            <LinkButton to="/admin/kebun" variant="ghost" size="sm">
              + {t('admin.plotAdd')}
            </LinkButton>
          )}
          {canKebun && (
            <LinkButton to="/admin/kebun" variant="ghost" size="sm">
              + {t('admin.farmerAdd')}
            </LinkButton>
          )}
          {canPesanan && (
            <LinkButton to="/admin/pesanan" variant="ghost" size="sm">
              {t('admin.dashboardViewNewOrders')}
            </LinkButton>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {canPesanan && (
          <Panel
            title={t('admin.dashboardRecentActivity')}
            action={
              inquiries.length > 0 && (
                <Link to="/admin/pesanan" className="flex items-center gap-1 text-meta text-muted hover:text-ink">
                  {t('admin.dashboardViewAll')}
                  <IconArrowRight className="h-3.5 w-3.5" />
                </Link>
              )
            }
          >
            {inquiries.length === 0 ? (
              <p className="text-body text-muted">{t('admin.dashboardRecentActivityEmpty')}</p>
            ) : (
              <div className="flex flex-col gap-1">
                {inquiries.slice(0, 5).map((inquiry) => (
                  <Link
                    key={inquiry.id}
                    to="/admin/pesanan"
                    className="-mx-3 flex items-center justify-between gap-3 rounded-sm px-3 py-2.5 hover:bg-surface"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-body text-ink">
                        {inquiry.name}
                        {inquiry.company ? ` · ${inquiry.company}` : ''}
                      </p>
                      <p className="text-meta text-muted">{formatDate(inquiry.createdAt, locale)}</p>
                    </div>
                    <Badge tone={inquiryStatusTone[inquiry.status]} className="shrink-0">
                      {t(`admin.orderStatus${capitalize(inquiry.status)}`)}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </Panel>
        )}

        <Panel title={t('admin.dashboardActionItems')}>
          {actionItems.length === 0 ? (
            <p className="text-body text-muted">{t('admin.dashboardActionItemsEmpty')}</p>
          ) : (
            <div className="flex flex-col gap-1">
              {actionItems.map((item) => (
                <Link
                  key={item.key}
                  to={item.to}
                  className="-mx-3 flex items-center gap-3 rounded-sm px-3 py-2.5 hover:bg-surface"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFF6E0] text-[#7A5A00]">
                    <IconAlertTriangle className="h-4 w-4" />
                  </span>
                  <span className="flex-1 text-body text-ink">{item.label}</span>
                  <IconArrowRight className="h-4 w-4 shrink-0 text-muted-2" />
                </Link>
              ))}
            </div>
          )}
        </Panel>
      </div>

      {canKebun && (
        <Panel title={t('admin.dashboardHarvestTitle')}>
          {harvestingNow.length === 0 ? (
            <p className="text-body text-muted">{t('admin.dashboardHarvestEmpty')}</p>
          ) : (
            <div className="flex flex-col gap-1">
              {harvestingNow.map(({ plot, entry }) => (
                <Link
                  key={`${plot.id}-${entry.commodityId}`}
                  to="/admin/kebun"
                  className="-mx-3 flex items-center justify-between gap-3 rounded-sm px-3 py-2.5 hover:bg-surface"
                >
                  <div className="min-w-0">
                    <p className="truncate text-body text-ink">{plot.name}</p>
                    <p className="text-meta text-muted">{plot.code}</p>
                  </div>
                  <Badge tone="accent">{commodityLabel(entry.commodityId, locale)}</Badge>
                </Link>
              ))}
            </div>
          )}
        </Panel>
      )}

      {canPesanan && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Panel title={t('admin.dashboardTrendTitle')}>
            {inquiries.length === 0 ? (
              <p className="text-body text-muted">{t('admin.dashboardTrendEmpty')}</p>
            ) : (
              <div className="flex h-40 items-end gap-3">
                {trend.map((m) => (
                  <div key={`${m.year}-${m.month}`} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex h-28 w-full items-end">
                      <div
                        className="w-full rounded-t-sm bg-accent"
                        style={{ height: `${(m.count / trendMax) * 100}%` }}
                      />
                    </div>
                    <span className="text-meta tabular-nums text-muted-2">{m.count}</span>
                    <span className="text-meta text-muted">{monthShort(m.month, locale)}</span>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel title={t('admin.dashboardStatusDistribution')}>
            {inquiries.length === 0 ? (
              <p className="text-body text-muted">{t('admin.dashboardTrendEmpty')}</p>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex h-3 w-full overflow-hidden rounded-pill bg-surface">
                  {(['baru', 'diproses', 'selesai'] as const).map(
                    (status) =>
                      statusCounts[status] > 0 && (
                        <div
                          key={status}
                          className={cn(
                            status === 'baru' && 'bg-ink',
                            status === 'diproses' && 'bg-muted-2',
                            status === 'selesai' && 'bg-accent',
                          )}
                          style={{ width: `${(statusCounts[status] / inquiries.length) * 100}%` }}
                        />
                      ),
                  )}
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  {(['baru', 'diproses', 'selesai'] as const).map((status) => (
                    <div key={status} className="flex items-center gap-2 text-meta text-muted">
                      <span
                        className={cn(
                          'h-2.5 w-2.5 rounded-full',
                          status === 'baru' && 'bg-ink',
                          status === 'diproses' && 'bg-muted-2',
                          status === 'selesai' && 'bg-accent',
                        )}
                      />
                      {t(`admin.orderStatus${capitalize(status)}`)} · {statusCounts[status]}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Panel>
        </div>
      )}
    </div>
  )
}

function MiniStat({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-md border border-line bg-white p-4">
      <span className="text-title tabular-nums text-ink">{value}</span>
      <span className="text-meta text-muted">{label}</span>
      {sub && <span className="text-meta text-muted-2">{sub}</span>}
    </div>
  )
}

function Panel({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 rounded-md border border-line bg-white p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-label font-semibold text-ink">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  )
}
