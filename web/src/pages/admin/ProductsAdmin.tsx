import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePlots, useProducts } from '@/lib/useEntities'
import type { CertificationStatus, CommodityId, Product, ProductCategory } from '@/types'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { FieldWrapper, Input, Select, Textarea } from '@/components/ui/Field'
import { ImageUploader } from '@/components/admin/ImageUploader'
import { formatIdr, slugify, commodityLabel } from '@/lib/utils'
import { commoditiesSeed } from '@/data/commodities'
import { Seo } from '@/components/layout/Seo'
import { useLocale } from '@/lib/useLocale'

type Draft = Omit<Product, 'id' | 'createdAt'>

function emptyDraft(): Draft {
  return {
    slug: '',
    nameId: '',
    nameEn: '',
    commodityId: 'pala',
    category: 'pangan',
    descriptionId: '',
    descriptionEn: '',
    composition: [],
    netWeight: '',
    packaging: '',
    shelfLife: '',
    priceIdr: null,
    priceUsd: null,
    moq: '',
    monthlyCapacity: '',
    hsCode: '',
    incoterms: [],
    originPort: '',
    certifications: [],
    images: [],
    shopeeUrl: '',
    plotId: '',
    isFeatured: false,
    isActive: false,
  }
}

/** CRUD produk — PRD §7.6 A-04. */
export default function ProductsAdmin() {
  const { t } = useTranslation()
  const { locale } = useLocale()
  const { items: products, add, update, remove } = useProducts()
  const { items: plots } = usePlots()
  const [editingId, setEditingId] = useState<string | 'new' | null>(null)
  const [draft, setDraft] = useState<Draft>(emptyDraft())
  const [error, setError] = useState<string | null>(null)

  function startNew() {
    setDraft(emptyDraft())
    setEditingId('new')
    setError(null)
  }

  function startEdit(product: Product) {
    const { id: _id, createdAt: _createdAt, ...rest } = product
    setDraft(rest)
    setEditingId(product.id)
    setError(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setError(null)
  }

  function saveDraft() {
    if (draft.isActive && (!draft.nameId || !draft.nameEn || !draft.descriptionId || !draft.descriptionEn)) {
      setError(t('admin.requiredBothLang'))
      return
    }
    const slug = draft.slug || slugify(draft.nameEn || draft.nameId)

    if (editingId === 'new') {
      add({ ...draft, slug, id: `prd-${Date.now()}`, createdAt: new Date().toISOString() })
    } else if (editingId) {
      update(editingId, { ...draft, slug })
    }
    setEditingId(null)
  }

  function handleDelete(id: string) {
    if (window.confirm(t('admin.confirmDelete'))) remove(id)
  }

  return (
    <div className="flex flex-col gap-6">
      <Seo title={`${t('admin.productsTitle')} — ${t('common.brand')}`} description="" path="/admin/produk" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-display-m">{t('admin.productsTitle')}</h1>
        <Button variant="dark" onClick={startNew}>
          + {t('admin.productAdd')}
        </Button>
      </div>
      <p className="text-meta text-muted-2">{t('admin.storageWarning')}</p>

      {editingId && (
        <div className="flex flex-col gap-5 rounded-md border border-line bg-white p-6">
          <h2 className="text-title">
            {editingId === 'new' ? t('admin.productAdd') : t('admin.productEdit')}
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <FieldWrapper label="Nama (ID)" htmlFor="nameId" required>
              <Input id="nameId" value={draft.nameId} onChange={(e) => setDraft({ ...draft, nameId: e.target.value })} />
            </FieldWrapper>
            <FieldWrapper label="Name (EN)" htmlFor="nameEn" required>
              <Input id="nameEn" value={draft.nameEn} onChange={(e) => setDraft({ ...draft, nameEn: e.target.value })} />
            </FieldWrapper>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FieldWrapper label="Deskripsi (ID)" htmlFor="descId" required>
              <Textarea
                id="descId"
                value={draft.descriptionId}
                onChange={(e) => setDraft({ ...draft, descriptionId: e.target.value })}
              />
            </FieldWrapper>
            <FieldWrapper label="Description (EN)" htmlFor="descEn" required>
              <Textarea
                id="descEn"
                value={draft.descriptionEn}
                onChange={(e) => setDraft({ ...draft, descriptionEn: e.target.value })}
              />
            </FieldWrapper>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <FieldWrapper label="Komoditas" htmlFor="commodityId">
              <Select
                id="commodityId"
                value={draft.commodityId}
                onChange={(e) => setDraft({ ...draft, commodityId: e.target.value as CommodityId })}
              >
                {commoditiesSeed.map((c) => (
                  <option key={c.id} value={c.id}>
                    {commodityLabel(c.id, locale)}
                  </option>
                ))}
              </Select>
            </FieldWrapper>
            <FieldWrapper label="Kategori" htmlFor="category">
              <Select
                id="category"
                value={draft.category}
                onChange={(e) => setDraft({ ...draft, category: e.target.value as ProductCategory })}
              >
                <option value="pangan">{t('catalog.categoryPangan')}</option>
                <option value="minuman">{t('catalog.categoryMinuman')}</option>
                <option value="non-pangan">{t('catalog.categoryNonPangan')}</option>
              </Select>
            </FieldWrapper>
            <FieldWrapper label={t('product.netWeight')} htmlFor="netWeight">
              <Input id="netWeight" value={draft.netWeight} onChange={(e) => setDraft({ ...draft, netWeight: e.target.value })} />
            </FieldWrapper>
            <FieldWrapper label={t('product.shelfLife')} htmlFor="shelfLife">
              <Input id="shelfLife" value={draft.shelfLife} onChange={(e) => setDraft({ ...draft, shelfLife: e.target.value })} />
            </FieldWrapper>
          </div>

          <FieldWrapper label={t('product.packaging')} htmlFor="packaging">
            <Input id="packaging" value={draft.packaging} onChange={(e) => setDraft({ ...draft, packaging: e.target.value })} />
          </FieldWrapper>

          <FieldWrapper label={t('product.shopeeUrl')} htmlFor="shopeeUrl">
            <Input
              id="shopeeUrl"
              type="url"
              value={draft.shopeeUrl}
              onChange={(e) => setDraft({ ...draft, shopeeUrl: e.target.value })}
            />
          </FieldWrapper>

          <FieldWrapper label={`${t('product.composition')} (pisahkan koma)`} htmlFor="composition">
            <Input
              id="composition"
              value={draft.composition.join(', ')}
              onChange={(e) =>
                setDraft({ ...draft, composition: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })
              }
            />
          </FieldWrapper>

          <div className="grid gap-5 sm:grid-cols-2">
            <FieldWrapper label="Harga IDR" htmlFor="priceIdr">
              <Input
                id="priceIdr"
                type="number"
                value={draft.priceIdr ?? ''}
                onChange={(e) => setDraft({ ...draft, priceIdr: e.target.value ? Number(e.target.value) : null })}
              />
            </FieldWrapper>
            <FieldWrapper label="Harga USD" htmlFor="priceUsd">
              <Input
                id="priceUsd"
                type="number"
                step="0.01"
                value={draft.priceUsd ?? ''}
                onChange={(e) => setDraft({ ...draft, priceUsd: e.target.value ? Number(e.target.value) : null })}
              />
            </FieldWrapper>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FieldWrapper label={t('product.moq')} htmlFor="moq">
              <Input id="moq" value={draft.moq} onChange={(e) => setDraft({ ...draft, moq: e.target.value })} />
            </FieldWrapper>
            <FieldWrapper label={t('product.monthlyCapacity')} htmlFor="capacity">
              <Input
                id="capacity"
                value={draft.monthlyCapacity}
                onChange={(e) => setDraft({ ...draft, monthlyCapacity: e.target.value })}
              />
            </FieldWrapper>
            <FieldWrapper label={t('product.hsCode')} htmlFor="hsCode">
              <Input id="hsCode" value={draft.hsCode} onChange={(e) => setDraft({ ...draft, hsCode: e.target.value })} />
            </FieldWrapper>
            <FieldWrapper label={`${t('product.incoterms')} (pisahkan koma)`} htmlFor="incoterms">
              <Input
                id="incoterms"
                value={draft.incoterms.join(', ')}
                onChange={(e) =>
                  setDraft({ ...draft, incoterms: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })
                }
              />
            </FieldWrapper>
          </div>

          <FieldWrapper label={t('product.originPort')} htmlFor="originPort">
            <Input id="originPort" value={draft.originPort} onChange={(e) => setDraft({ ...draft, originPort: e.target.value })} />
          </FieldWrapper>

          <FieldWrapper label="Lahan asal" htmlFor="plotId">
            <Select id="plotId" value={draft.plotId} onChange={(e) => setDraft({ ...draft, plotId: e.target.value })}>
              <option value="">—</option>
              {plots.map((plot) => (
                <option key={plot.id} value={plot.id}>
                  {plot.code} — {plot.name}
                </option>
              ))}
            </Select>
          </FieldWrapper>

          <FieldWrapper label={t('product.certifications')} htmlFor="certs">
            <CertificationEditor
              value={draft.certifications}
              onChange={(certifications) => setDraft({ ...draft, certifications })}
            />
          </FieldWrapper>

          <div>
            <p className="mb-2 text-label text-ink">Foto produk</p>
            <ImageUploader images={draft.images} onChange={(images) => setDraft({ ...draft, images })} />
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-label text-ink">
              <input
                type="checkbox"
                checked={draft.isFeatured}
                onChange={(e) => setDraft({ ...draft, isFeatured: e.target.checked })}
              />
              {t('admin.productFeatured')}
            </label>
            <label className="flex items-center gap-2 text-label text-ink">
              <input
                type="checkbox"
                checked={draft.isActive}
                onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })}
              />
              {t('admin.productActive')}
            </label>
          </div>

          {error && <p className="text-meta text-[#B23A3A]">{error}</p>}

          <div className="flex gap-3">
            <Button variant="dark" onClick={saveDraft}>
              {t('admin.productSave')}
            </Button>
            <Button variant="ghost" onClick={cancelEdit}>
              {t('admin.productCancel')}
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-md border border-line bg-white">
        <table className="w-full min-w-[720px] text-left text-body">
          <thead>
            <tr className="border-b border-line text-meta text-muted-2">
              <th className="px-5 py-3 font-medium">Nama</th>
              <th className="px-5 py-3 font-medium">Komoditas</th>
              <th className="px-5 py-3 font-medium">Kategori</th>
              <th className="px-5 py-3 font-medium">Harga</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0">
                <td className="px-5 py-3">{p.nameId}</td>
                <td className="px-5 py-3">{commodityLabel(p.commodityId, locale)}</td>
                <td className="px-5 py-3">{p.category}</td>
                <td className="px-5 py-3 tabular-nums">{formatIdr(p.priceIdr)}</td>
                <td className="px-5 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    <Badge tone={p.isActive ? 'accent' : 'neutral'}>
                      {p.isActive ? t('admin.productActive') : '—'}
                    </Badge>
                    {p.isFeatured && <Badge tone="pending">{t('admin.productFeatured')}</Badge>}
                  </div>
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(p)}>
                      {t('admin.productEdit')}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)}>
                      {t('admin.productDelete')}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-muted">
                  {t('admin.noRecords')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function CertificationEditor({
  value,
  onChange,
}: {
  value: CertificationStatus[]
  onChange: (v: CertificationStatus[]) => void
}) {
  const options: CertificationStatus['name'][] = ['PIRT', 'Halal', 'SNI', 'Organik', 'HACCP']

  function toggle(name: CertificationStatus['name']) {
    const exists = value.find((c) => c.name === name)
    if (exists) {
      onChange(value.filter((c) => c.name !== name))
    } else {
      onChange([...value, { name, status: 'dalam-proses' }])
    }
  }

  function setStatus(name: CertificationStatus['name'], status: CertificationStatus['status']) {
    onChange(value.map((c) => (c.name === name ? { ...c, status } : c)))
  }

  return (
    <div className="flex flex-col gap-2">
      {options.map((name) => {
        const entry = value.find((c) => c.name === name)
        return (
          <div key={name} className="flex items-center gap-3">
            <label className="flex w-32 items-center gap-2 text-body text-ink">
              <input type="checkbox" checked={!!entry} onChange={() => toggle(name)} />
              {name}
            </label>
            {entry && (
              <select
                className="rounded-sm border border-line px-2 py-1 text-meta"
                value={entry.status}
                onChange={(e) => setStatus(name, e.target.value as CertificationStatus['status'])}
              >
                <option value="terbit">terbit</option>
                <option value="dalam-proses">dalam proses</option>
              </select>
            )}
          </div>
        )
      })}
    </div>
  )
}
