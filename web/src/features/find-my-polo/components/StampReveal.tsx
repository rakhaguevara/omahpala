import { useTranslation } from 'react-i18next'
import { ASSETS } from '../config'
import { RevealDialog } from './RevealDialog'

interface StampRevealProps {
  label: number
  count: number
  total: number
  onClose: () => void
}

/** Pop-up tiap stamp baru: gambar stamp + "berhasil" + jumlah terkumpul (mis. 1/4). Angka dari server. */
export function StampReveal({ label, count, total, onClose }: StampRevealProps) {
  const { t } = useTranslation()
  return (
    <RevealDialog
      image={ASSETS.stamp(label)}
      imageAlt={t('polo.stampAlt')}
      title={t('polo.reveal.title')}
      highlight={t('polo.reveal.count', { count, total })}
      closeLabel={t('polo.reveal.close')}
      onClose={onClose}
    >
      <p className="text-body text-muted">{count >= total ? t('polo.progress.allFound') : t('polo.reveal.body', { n: label })}</p>
      <p className="text-meta text-muted-2">{t('polo.dummyNote')}</p>
    </RevealDialog>
  )
}
