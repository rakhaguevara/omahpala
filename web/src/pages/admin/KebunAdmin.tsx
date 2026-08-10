import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useFarmers, usePlots } from '@/lib/useEntities'
import type { Farmer, Plot, PlotStatus } from '@/types'
import { Chip } from '@/components/ui/Chip'
import { Button } from '@/components/ui/Button'
import { FieldWrapper, Input, Select } from '@/components/ui/Field'
import { Badge } from '@/components/ui/Badge'
import { Seo } from '@/components/layout/Seo'

type Tab = 'plots' | 'farmers'

/** CRUD lahan & penanam — PRD §7.6 A-06. */
export default function KebunAdmin() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<Tab>('plots')

  return (
    <div className="flex flex-col gap-6">
      <Seo title={`${t('admin.kebunTitle')} — ${t('common.brand')}`} description="" path="/admin/kebun" />
      <h1 className="text-display-m">{t('admin.kebunTitle')}</h1>
      <p className="text-meta text-muted-2">{t('admin.storageWarning')}</p>

      <div className="flex gap-2">
        <Chip active={tab === 'plots'} onClick={() => setTab('plots')}>
          {t('admin.plotsTab')}
        </Chip>
        <Chip active={tab === 'farmers'} onClick={() => setTab('farmers')}>
          {t('admin.farmersTab')}
        </Chip>
      </div>

      {tab === 'plots' ? <PlotsPanel /> : <FarmersPanel />}
    </div>
  )
}

function emptyPlot(): Omit<Plot, 'id'> {
  return { code: '', name: '', areaM2: 0, commodities: [], status: 'aktif', farmerId: '', lat: -7.66, lng: 110.42 }
}

function PlotsPanel() {
  const { t } = useTranslation()
  const { items: plots, add, update, remove } = usePlots()
  const { items: farmers } = useFarmers()
  const [editingId, setEditingId] = useState<string | 'new' | null>(null)
  const [draft, setDraft] = useState<Omit<Plot, 'id'>>(emptyPlot())

  function startNew() {
    setDraft(emptyPlot())
    setEditingId('new')
  }
  function startEdit(plot: Plot) {
    const { id: _id, ...rest } = plot
    setDraft(rest)
    setEditingId(plot.id)
  }
  function save() {
    if (editingId === 'new') add({ ...draft, id: `p-${Date.now()}` })
    else if (editingId) update(editingId, draft)
    setEditingId(null)
  }

  return (
    <div className="flex flex-col gap-5">
      <Button variant="dark" className="self-start" onClick={startNew}>
        + {t('admin.plotAdd')}
      </Button>

      {editingId && (
        <div className="flex flex-col gap-4 rounded-md border border-line bg-white p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldWrapper label={t('admin.fieldCode')} htmlFor="code">
              <Input id="code" value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} />
            </FieldWrapper>
            <FieldWrapper label={t('admin.fieldName')} htmlFor="name">
              <Input id="name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </FieldWrapper>
            <FieldWrapper label={t('admin.fieldArea')} htmlFor="area">
              <Input
                id="area"
                type="number"
                value={draft.areaM2}
                onChange={(e) => setDraft({ ...draft, areaM2: Number(e.target.value) })}
              />
            </FieldWrapper>
            <FieldWrapper label={t('admin.fieldStatus')} htmlFor="status">
              <Select
                id="status"
                value={draft.status}
                onChange={(e) => setDraft({ ...draft, status: e.target.value as PlotStatus })}
              >
                <option value="aktif">{t('kebun.statusAktif')}</option>
                <option value="panen">{t('kebun.statusPanen')}</option>
                <option value="istirahat">{t('kebun.statusIstirahat')}</option>
              </Select>
            </FieldWrapper>
            <FieldWrapper label={t('admin.fieldCommodities')} htmlFor="commodities" className="sm:col-span-2">
              <Input
                id="commodities"
                value={draft.commodities.join(', ')}
                onChange={(e) =>
                  setDraft({ ...draft, commodities: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })
                }
              />
            </FieldWrapper>
            <FieldWrapper label={t('admin.fieldFarmer')} htmlFor="farmerId" className="sm:col-span-2">
              <Select id="farmerId" value={draft.farmerId} onChange={(e) => setDraft({ ...draft, farmerId: e.target.value })}>
                <option value="">—</option>
                {farmers.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </Select>
            </FieldWrapper>
          </div>
          <div className="flex gap-3">
            <Button variant="dark" onClick={save}>
              {t('admin.productSave')}
            </Button>
            <Button variant="ghost" onClick={() => setEditingId(null)}>
              {t('admin.productCancel')}
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-md border border-line bg-white">
        <table className="w-full min-w-[600px] text-left text-body">
          <thead>
            <tr className="border-b border-line text-meta text-muted-2">
              <th className="px-5 py-3 font-medium">{t('admin.fieldCode')}</th>
              <th className="px-5 py-3 font-medium">{t('admin.fieldName')}</th>
              <th className="px-5 py-3 font-medium">{t('admin.fieldStatus')}</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {plots.map((plot) => (
              <tr key={plot.id} className="border-b border-line last:border-0">
                <td className="px-5 py-3">{plot.code}</td>
                <td className="px-5 py-3">{plot.name}</td>
                <td className="px-5 py-3">
                  <Badge tone="neutral">{t(`kebun.status${capitalize(plot.status)}`)}</Badge>
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(plot)}>
                      {t('admin.productEdit')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.confirm(t('admin.confirmDelete')) && remove(plot.id)}
                    >
                      {t('admin.plotDelete')}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function emptyFarmer(): Omit<Farmer, 'id'> {
  return { name: '', role: '', photo: '', joinedAt: new Date().toISOString().slice(0, 10), plotIds: [] }
}

function FarmersPanel() {
  const { t } = useTranslation()
  const { items: farmers, add, update, remove } = useFarmers()
  const [editingId, setEditingId] = useState<string | 'new' | null>(null)
  const [draft, setDraft] = useState<Omit<Farmer, 'id'>>(emptyFarmer())

  function startNew() {
    setDraft(emptyFarmer())
    setEditingId('new')
  }
  function startEdit(farmer: Farmer) {
    const { id: _id, ...rest } = farmer
    setDraft(rest)
    setEditingId(farmer.id)
  }
  function save() {
    if (editingId === 'new') add({ ...draft, id: `f-${Date.now()}` })
    else if (editingId) update(editingId, draft)
    setEditingId(null)
  }

  return (
    <div className="flex flex-col gap-5">
      <Button variant="dark" className="self-start" onClick={startNew}>
        + {t('admin.farmerAdd')}
      </Button>

      {editingId && (
        <div className="flex flex-col gap-4 rounded-md border border-line bg-white p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldWrapper label={t('admin.fieldName')} htmlFor="fname">
              <Input id="fname" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </FieldWrapper>
            <FieldWrapper label={t('admin.fieldRole')} htmlFor="frole">
              <Input id="frole" value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })} />
            </FieldWrapper>
            <FieldWrapper label={t('admin.fieldPhoto')} htmlFor="fphoto" className="sm:col-span-2">
              <Input id="fphoto" value={draft.photo} onChange={(e) => setDraft({ ...draft, photo: e.target.value })} />
            </FieldWrapper>
            <FieldWrapper label={t('admin.fieldJoinedAt')} htmlFor="fjoined">
              <Input
                id="fjoined"
                type="date"
                value={draft.joinedAt.slice(0, 10)}
                onChange={(e) => setDraft({ ...draft, joinedAt: e.target.value })}
              />
            </FieldWrapper>
          </div>
          <div className="flex gap-3">
            <Button variant="dark" onClick={save}>
              {t('admin.productSave')}
            </Button>
            <Button variant="ghost" onClick={() => setEditingId(null)}>
              {t('admin.productCancel')}
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-md border border-line bg-white">
        <table className="w-full min-w-[560px] text-left text-body">
          <thead>
            <tr className="border-b border-line text-meta text-muted-2">
              <th className="px-5 py-3 font-medium">{t('admin.fieldName')}</th>
              <th className="px-5 py-3 font-medium">{t('admin.fieldRole')}</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {farmers.map((farmer) => (
              <tr key={farmer.id} className="border-b border-line last:border-0">
                <td className="px-5 py-3">{farmer.name}</td>
                <td className="px-5 py-3">{farmer.role}</td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(farmer)}>
                      {t('admin.productEdit')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.confirm(t('admin.confirmDelete')) && remove(farmer.id)}
                    >
                      {t('admin.farmerDelete')}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
