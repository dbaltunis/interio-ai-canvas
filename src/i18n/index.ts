import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

//import enCommon from './locales/en/common.json';
import enDashboard from './locales/en/dashboard.json';
import esDashboard from './locales/es/dashboard.json';
//import enSettings from './locales/en/settings.json';
// Import other language files...

// import esCommon from './locales/es/common.json';
// Import other Spanish files...

const resources = {
  en: {
    //common: enCommon,
    dashboard: enDashboard,
    // settings: enSettings,
    // Add other namespaces
  },
  es: {
    // common: esCommon,
    dashboard: esDashboard,
    // Add other namespaces
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',

    interpolation: {
      escapeValue: false, // React already escapes
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    // ns: ['common', 'dashboard', 'settings'], // Default namespaces
    ns: ['dashboard'], // Default namespaces
    defaultNS: 'dashboard',
  });

export default i18n;