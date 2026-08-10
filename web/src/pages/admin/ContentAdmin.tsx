import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePageContentCollection } from '@/lib/usePageContent'
import { FieldWrapper, Textarea } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { Seo } from '@/components/layout/Seo'

/** Edit konten halaman tanpa deploy ulang — PRD §7.6 A-07. */
export default function ContentAdmin() {
  const { t } = useTranslation()
  const { items } = usePageContentCollection()

  return (
    <div className="flex flex-col gap-6">
      <Seo title={`${t('admin.contentTitle')} — ${t('common.brand')}`} description="" path="/admin/konten" />
      <div>
        <h1 className="text-display-m">{t('admin.contentTitle')}</h1>
        <p className="mt-1 text-body text-muted">{t('admin.contentSubtitle')}</p>
      </div>
      <p className="text-meta text-muted-2">{t('admin.storageWarning')}</p>

      <div className="flex flex-col gap-4">
        {items.map((entry) => (
          <ContentRow key={entry.key} entryKey={entry.key} valueId={entry.valueId} valueEn={entry.valueEn} />
        ))}
      </div>
    </div>
  )
}

function ContentRow({
  entryKey,
  valueId,
  valueEn,
}: {
  entryKey: string
  valueId: string
  valueEn: string
}) {
  const { t } = useTranslation()
  const { update } = usePageContentCollection()
  const [id, setId] = useState(valueId)
  const [en, setEn] = useState(valueEn)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function save() {
    if (!id.trim() || !en.trim()) {
      setError(t('admin.requiredBothLang'))
      return
    }
    setError(null)
    update(entryKey, { valueId: id, valueEn: en })
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border border-line bg-white p-6">
      <p className="text-meta font-medium text-muted-2">{entryKey}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldWrapper label={t('admin.fieldId')} htmlFor={`${entryKey}-id`}>
          <Textarea id={`${entryKey}-id`} value={id} onChange={(e) => setId(e.target.value)} />
        </FieldWrapper>
        <FieldWrapper label={t('admin.fieldEn')} htmlFor={`${entryKey}-en`}>
          <Textarea id={`${entryKey}-en`} value={en} onChange={(e) => setEn(e.target.value)} />
        </FieldWrapper>
      </div>
      {error && <p className="text-meta text-[#B23A3A]">{error}</p>}
      <div className="flex items-center gap-3">
        <Button variant="dark" size="sm" onClick={save}>
          {t('admin.productSave')}
        </Button>
        {saved && <span className="text-meta text-accent-ink">{t('admin.contentSaved')}</span>}
      </div>
    </div>
  )
}
