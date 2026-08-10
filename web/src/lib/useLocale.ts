import { useTranslation } from 'react-i18next'
import type { Locale } from '@/types'

/** Normalisasi i18next language (bisa 'en-US' dsb.) jadi 'id' | 'en'. */
export function useLocale(): {
  locale: Locale
  setLocale: (l: Locale) => void
} {
  const { i18n } = useTranslation()
  const locale: Locale = i18n.language?.toLowerCase().startsWith('id') ? 'id' : 'en'

  const setLocale = (l: Locale) => {
    void i18n.changeLanguage(l)
  }

  return { locale, setLocale }
}
