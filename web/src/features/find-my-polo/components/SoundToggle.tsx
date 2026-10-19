import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { playSound, setMuted, unlockAudio, useMuted } from '../hooks/useSound'

/** Kontrol mute. Status disampaikan lewat teks + aria-pressed, bukan hanya ikon/warna. */
export function SoundToggle({ className }: { className?: string }) {
  const { t } = useTranslation()
  const muted = useMuted()
  return (
    <button
      type="button"
      aria-pressed={!muted}
      aria-label={t('polo.soundToggle')}
      onClick={() => {
        // Tombol ini adalah sentuhan pengguna: pakai untuk membuka audio, dan beri bunyi contoh saat dinyalakan.
        unlockAudio()
        setMuted(!muted)
        if (muted) playSound('stamp')
      }}
      className={cn(
        'inline-flex items-center gap-2 rounded-pill border border-line bg-white px-4 py-2 text-label text-ink transition-colors duration-200 hover:bg-surface',
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 10v4h4l5 4V6L8 10H4z" />
        {muted ? <path d="M17 9l4 6M21 9l-4 6" /> : <path d="M16.5 9a4 4 0 010 6M19 6.5a8 8 0 010 11" />}
      </svg>
      {muted ? t('polo.soundOff') : t('polo.soundOn')}
    </button>
  )
}
