import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useInquiries, useProducts } from '@/lib/useEntities'
import type { Inquiry, InquiryStatus } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Select, Textarea } from '@/components/ui/Field'
import { formatDate } from '@/lib/utils'
import { Seo } from '@/components/layout/Seo'

const statusTone: Record<InquiryStatus, 'accent' | 'pending' | 'neutral'> = {
  baru: 'pending',
  diproses: 'neutral',
  selesai: 'accent',
}

/** Inbox pesanan & inquiry — PRD §7.6 A-05, ekspor CSV A-08. */
export default function OrdersAdmin() {
  const { t } = useTranslation()
  const { items: inquiries, update } = useInquiries()
  const { items: products } = useProducts()
  const [openId, setOpenId] = useState<string | null>(null)

  function exportCsv() {
    const header = ['Nama', 'Perusahaan', 'Negara', 'Email', 'Produk', 'Volume', 'Status', 'Tanggal']
    const rows = inquiries.map((i) => [
      i.name,
      i.company,
      i.country,
      i.email,
      products.find((p) => p.slug === i.productId)?.nameId ?? '',
      i.volume,
      i.status,
      i.createdAt,
    ])
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'omahpala-inquiries.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-6">
      <Seo title={`${t('admin.ordersTitle')} — ${t('common.brand')}`} description="" path="/admin/pesanan" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-display-m">{t('admin.ordersTitle')}</h1>
        <Button variant="ghost" onClick={exportCsv} disabled={inquiries.length === 0}>
          {t('admin.exportCsv')}
        </Button>
      </div>
      <p className="text-meta text-muted-2">{t('admin.storageWarning')}</p>

      {inquiries.length === 0 ? (
        <p className="rounded-md border border-line bg-white p-8 text-center text-muted">
          {t('admin.orderEmpty')}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {inquiries.map((inquiry) => (
            <InquiryRow
              key={inquiry.id}
              inquiry={inquiry}
              open={openId === inquiry.id}
              onToggle={() => setOpenId(openId === inquiry.id ? null : inquiry.id)}
              onUpdate={(patch) => update(inquiry.id, patch)}
              productName={products.find((p) => p.slug === inquiry.productId)?.nameId}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function InquiryRow({
  inquiry,
  open,
  onToggle,
  onUpdate,
  productName,
}: {
  inquiry: Inquiry
  open: boolean
  onToggle: () => void
  onUpdate: (patch: Partial<Inquiry>) => void
  productName?: string
}) {
  const { t } = useTranslation()

  return (
    <div className="rounded-md border border-line bg-white">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full flex-wrap items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <div>
          <p className="text-label text-ink">
            {inquiry.name} · {inquiry.company}
          </p>
          <p className="text-meta text-muted">
            {inquiry.country} · {formatDate(inquiry.createdAt, 'id')}
            {productName ? ` · ${productName}` : ''}
          </p>
        </div>
        <Badge tone={statusTone[inquiry.status]}>{t(`admin.orderStatus${capitalize(inquiry.status)}`)}</Badge>
      </button>

      {open && (
        <div className="flex flex-col gap-4 border-t border-line px-5 py-5">
          <div className="grid gap-3 text-body sm:grid-cols-2">
            <p>
              <span className="text-meta text-muted-2">Email:</span> {inquiry.email}
            </p>
            {inquiry.phone && (
              <p>
                <span className="text-meta text-muted-2">Telepon:</span> {inquiry.phone}
              </p>
            )}
            {inquiry.volume && (
              <p>
                <span className="text-meta text-muted-2">Volume:</span> {inquiry.volume}
              </p>
            )}
          </div>
          <p className="whitespace-pre-wrap text-body text-ink">{inquiry.message}</p>

          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label htmlFor={`status-${inquiry.id}`} className="mb-1 block text-meta text-muted-2">
                Status
              </label>
              <Select
                id={`status-${inquiry.id}`}
                value={inquiry.status}
                onChange={(e) => onUpdate({ status: e.target.value as InquiryStatus })}
                className="w-44"
              >
                <option value="baru">{t('admin.orderStatusBaru')}</option>
                <option value="diproses">{t('admin.orderStatusDiproses')}</option>
                <option value="selesai">{t('admin.orderStatusSelesai')}</option>
              </Select>
            </div>
          </div>

          <div>
            <label htmlFor={`note-${inquiry.id}`} className="mb-1 block text-meta text-muted-2">
              {t('admin.orderNote')}
            </label>
            <Textarea
              id={`note-${inquiry.id}`}
              value={inquiry.internalNote}
              placeholder={t('admin.orderNotePlaceholder')}
              onChange={(e) => onUpdate({ internalNote: e.target.value })}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
