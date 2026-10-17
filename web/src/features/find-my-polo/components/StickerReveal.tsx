import { useTranslation } from 'react-i18next'
import { ASSETS } from '../config'
import { RevealDialog } from './RevealDialog'

/** Pop-up pembuka stiker digital (ambang sticker_unlock_at dari server). */
export function StickerReveal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  return (
    <RevealDialog image={ASSETS.digitalSticker} imageAlt={t('polo.sticker.alt')} title={t('polo.sticker.title')} closeLabel={t('polo.sticker.close')} onClose={onClose}>
      <p className="text-body text-muted">{t('polo.sticker.body')}</p>
      <p className="text-meta text-muted-2">{t('polo.dummyNote')}</p>
    </RevealDialog>
  )
}
