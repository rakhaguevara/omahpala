import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useFarmers, usePlots } from '@/lib/useEntities'
import type { CommodityId, Farmer, Plot, PlotCalendarEntry, PlotStatus } from '@/types'
import { Chip } from '@/components/ui/Chip'
import { Button } from '@/components/ui/Button'
import { FieldWrapper, Input, Select, Textarea } from '@/components/ui/Field'
import { Badge } from '@/components/ui/Badge'
import { Seo } from '@/components/layout/Seo'
import { commoditiesSeed } from '@/data/commodities'
import { cn, commodityLabel, monthShort } from '@/lib/utils'
import { useLocale } from '@/lib/useLocale'

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
  return {
    code: '',
    name: '',
    areaM2: 0,
    commodities: [],
    status: 'aktif',
    farmerIds: [],
    lat: -7.66,
    lng: 110.42,
    photo: '',
    descriptionId: '',
    descriptionEn: '',
    calendar: [],
  }
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
    // Buang entri kalender untuk komoditas yang sudah dilepas dari lahan ini, supaya data tidak
    // menumpuk jadi entri "hantu" yang tidak pernah ditampilkan lagi.
    const payload: Omit<Plot, 'id'> = {
      ...draft,
      calendar: draft.calendar.filter((entry) => draft.commodities.includes(entry.commodityId)),
    }
    if (editingId === 'new') add({ ...payload, id: `p-${Date.now()}` })
    else if (editingId) update(editingId, payload)
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
            <FieldWrapper label={t('admin.fieldPhoto')} htmlFor="pphoto" className="sm:col-span-2">
              <Input
                id="pphoto"
                value={draft.photo}
                onChange={(e) => setDraft({ ...draft, photo: e.target.value })}
              />
            </FieldWrapper>
            <FieldWrapper label="Deskripsi (ID)" htmlFor="pdescId" className="sm:col-span-2">
              <Textarea
                id="pdescId"
                value={draft.descriptionId}
                onChange={(e) => setDraft({ ...draft, descriptionId: e.target.value })}
              />
            </FieldWrapper>
            <FieldWrapper label="Description (EN)" htmlFor="pdescEn" className="sm:col-span-2">
              <Textarea
                id="pdescEn"
                value={draft.descriptionEn}
                onChange={(e) => setDraft({ ...draft, descriptionEn: e.target.value })}
              />
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
              <CommoditiesEditor
                value={draft.commodities}
                onChange={(commodities) => setDraft({ ...draft, commodities })}
              />
            </FieldWrapper>
            <FieldWrapper label={t('admin.fieldFarmer')} htmlFor="farmerIds" className="sm:col-span-2">
              <FarmersEditor
                farmers={farmers}
                value={draft.farmerIds}
                onChange={(farmerIds) => setDraft({ ...draft, farmerIds })}
              />
            </FieldWrapper>
            {draft.commodities.length > 0 && (
              <FieldWrapper label={t('kebun.calendarTitle')} htmlFor="calendar" className="sm:col-span-2">
                <PlotCalendarEditor
                  commodities={draft.commodities}
                  value={draft.calendar}
                  onChange={(calendar) => setDraft({ ...draft, calendar })}
                />
              </FieldWrapper>
            )}
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

function CommoditiesEditor({ value, onChange }: { value: CommodityId[]; onChange: (v: CommodityId[]) => void }) {
  const { locale } = useLocale()

  function toggle(id: CommodityId) {
    if (value.includes(id)) onChange(value.filter((c) => c !== id))
    else onChange([...value, id])
  }

  return (
    <div className="flex flex-wrap gap-2">
      {commoditiesSeed.map((c) => (
        <label
          key={c.id}
          className="flex items-center gap-2 rounded-sm border border-line px-3 py-1.5 text-body text-ink"
        >
          <input type="checkbox" checked={value.includes(c.id)} onChange={() => toggle(c.id)} />
          {commodityLabel(c.id, locale)}
        </label>
      ))}
    </div>
  )
}

/** Lahan bisa dirawat lebih dari satu penanam bersama — lihat kebun.plotGrowersTitle di halaman
 * detail lahan publik. */
function FarmersEditor({
  farmers,
  value,
  onChange,
}: {
  farmers: Farmer[]
  value: string[]
  onChange: (v: string[]) => void
}) {
  function toggle(id: string) {
    if (value.includes(id)) onChange(value.filter((f) => f !== id))
    else onChange([...value, id])
  }

  return (
    <div className="flex flex-wrap gap-2">
      {farmers.map((f) => (
        <label
          key={f.id}
          className="flex items-center gap-2 rounded-sm border border-line px-3 py-1.5 text-body text-ink"
        >
          <input type="checkbox" checked={value.includes(f.id)} onChange={() => toggle(f.id)} />
          {f.name}
        </label>
      ))}
      {farmers.length === 0 && <p className="text-meta text-muted-2">—</p>}
    </div>
  )
}

const ALL_MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

/** Perkiraan bulan tanam & panen per komoditas pada lahan ini — ditampilkan sebagai kalender di
 * halaman detail lahan publik supaya buyer bisa mengira-ngira kapan stok tersedia. */
function PlotCalendarEditor({
  commodities,
  value,
  onChange,
}: {
  commodities: CommodityId[]
  value: PlotCalendarEntry[]
  onChange: (v: PlotCalendarEntry[]) => void
}) {
  const { t } = useTranslation()
  const { locale } = useLocale()

  function entryFor(commodityId: CommodityId): PlotCalendarEntry {
    return value.find((e) => e.commodityId === commodityId) ?? { commodityId, plantingMonths: [], harvestMonths: [] }
  }

  function toggleMonth(commodityId: CommodityId, kind: 'plantingMonths' | 'harvestMonths', month: number) {
    const current = entryFor(commodityId)
    const months = current[kind].includes(month)
      ? current[kind].filter((m) => m !== month)
      : [...current[kind], month].sort((a, b) => a - b)
    const updated: PlotCalendarEntry = { ...current, [kind]: months }
    const exists = value.some((e) => e.commodityId === commodityId)
    onChange(exists ? value.map((e) => (e.commodityId === commodityId ? updated : e)) : [...value, updated])
  }

  return (
    <div className="flex flex-col gap-5">
      {commodities.map((commodityId) => {
        const entry = entryFor(commodityId)
        return (
          <div key={commodityId} className="flex flex-col gap-2 rounded-sm border border-line p-3">
            <p className="text-label text-ink">{commodityLabel(commodityId, locale)}</p>
            <MonthToggleRow
              label={t('kebun.calendarPlanting')}
              months={entry.plantingMonths}
              onToggle={(m) => toggleMonth(commodityId, 'plantingMonths', m)}
              locale={locale}
            />
            <MonthToggleRow
              label={t('kebun.calendarHarvest')}
              months={entry.harvestMonths}
              onToggle={(m) => toggleMonth(commodityId, 'harvestMonths', m)}
              locale={locale}
            />
          </div>
        )
      })}
    </div>
  )
}

function MonthToggleRow({
  label,
  months,
  onToggle,
  locale,
}: {
  label: string
  months: number[]
  onToggle: (month: number) => void
  locale: 'id' | 'en'
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-14 shrink-0 text-meta text-muted-2">{label}</span>
      <div className="flex flex-wrap gap-1">
        {ALL_MONTHS.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onToggle(m)}
            aria-pressed={months.includes(m)}
            className={cn(
              'h-7 w-9 rounded-sm border text-meta transition-colors duration-200 [transition-timing-function:var(--ease-brand)]',
              months.includes(m) ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink hover:border-ink/40',
            )}
          >
            {monthShort(m, locale)}
          </button>
        ))}
      </div>
    </div>
  )
}
