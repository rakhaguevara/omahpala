import { useTranslation } from 'react-i18next'
import { useLocale } from '@/lib/useLocale'
import { cn } from '@/lib/utils'

export function LanguageSwitch({ className }: { className?: string }) {
  const { t } = useTranslation()
  const { locale, setLocale } = useLocale()

  return (
    <div
      role="group"
      aria-label={t('common.switchLanguage')}
      className={cn(
        'flex items-center gap-0.5 rounded-pill border border-line bg-white p-0.5 text-meta font-medium',
        className,
      )}
    >
      {(['id', 'en'] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          aria-pressed={locale === l}
          className={cn(
            'rounded-pill px-2.5 py-1 transition-colors duration-200',
            locale === l ? 'bg-ink text-white' : 'text-muted hover:text-ink',
          )}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
