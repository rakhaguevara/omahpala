import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import id from './locales/id.json'
import en from './locales/en.json'

// PRD §9: EN default untuk pengunjung luar negeri (deteksi Accept-Language/navigator),
// ID untuk pengunjung Indonesia. Pengalih bahasa tetap selalu terlihat di navbar.
void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      id: { translation: id },
      en: { translation: en },
    },
    fallbackLng: 'en',
    supportedLngs: ['id', 'en'],
    nonExplicitSupportedLngs: true,
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'omahpala_locale',
    },
    interpolation: { escapeValue: false },
  })

export default i18n
