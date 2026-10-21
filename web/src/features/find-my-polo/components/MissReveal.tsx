import { useTranslation } from 'react-i18next'
import { ASSETS } from '../config'
import { RevealDialog } from './RevealDialog'

interface MissRevealProps {
  code: 'inactive_for_player' | 'challenge_required'
  /** Tombol utama: lanjut ke halaman tantangan. */
  onContinue: () => void
  /** Esc / klik di luar tombol: tetap di halaman scan (kartu "Lanjutkan tantangan" tetap tersedia). */
  onClose: () => void
}

/** Pop-up saat scan tidak memberi stamp: QR valid tapi bukan target, atau tantangan lama belum selesai. */
export function MissReveal({ code, onContinue, onClose }: MissRevealProps) {
  const { t } = useTranslation()
  return (
    <RevealDialog
      image={ASSETS.miss}
      imageAlt={t('polo.miss.alt')}
      title={t(`polo.miss.${code}.title`)}
      closeLabel={t('polo.miss.cta')}
      onClose={onClose}
      onConfirm={onContinue}
    >
      <p className="text-body text-muted">{t(`polo.miss.${code}.body`)}</p>
      <p className="text-meta text-muted-2">{t('polo.dummyNote')}</p>
    </RevealDialog>
  )
}
