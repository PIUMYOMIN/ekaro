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
  .use(LanguageDetector)   // detects from localStorage, navigator, etc.
  .use(initReactI18next)
  .init({
    resources,
    supportedLngs: ['en', 'my'],
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      // Check localStorage first, then browser language, then default to 'en'
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'pyonea_language',
      caches: ['localStorage'],
    },
  });

export default i18n;