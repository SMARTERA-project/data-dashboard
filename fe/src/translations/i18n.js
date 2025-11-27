import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '@locales/en/translations.json';
import bg from '@locales/bg/translations.json';
import bs from '@locales/bs/translations.json';
import es from '@locales/es/translations.json';
import fi from '@locales/fi/translations.json';
import it from '@locales/it/translations.json';
import sl from '@locales/sl/translations.json';
const resources = {
  en: { translation: en },
  bg: { translation: bg },
  bs: { translation: bs },
  es: { translation: es },
  fi: { translation: fi },
  it: { translation: it },
  sl: { translation: sl },
};
const DEFAULT_LANGUAGE = 'en';
const FALLBACK_LANGUAGE = 'en';
i18n.use(initReactI18next).init({
  resources,
  lng: DEFAULT_LANGUAGE,
  fallbackLng: FALLBACK_LANGUAGE,
  interpolation: { escapeValue: false },
});
export default i18n;
