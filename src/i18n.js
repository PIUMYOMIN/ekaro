// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import my from './locales/my.json';

const resources = {
  en: { translation: en },
  my: { translation: my },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    supportedLngs: ['en', 'my'],
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      // 1. ?lang= query param  — Google Search crawl and hreflang links
      // 2. localStorage        — user's previously chosen language
      // 3. navigator           — browser's preferred language
      order: ['querystring', 'localStorage', 'navigator'],
      lookupQuerystring: 'lang',
      lookupLocalStorage: 'pyonea_language',
      caches: ['localStorage'],
      excludeCacheFor: ['querystring'],
    },
  });

export default i18n;