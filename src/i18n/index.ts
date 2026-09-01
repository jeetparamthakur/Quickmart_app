import en from './en.json';
import hi from './hi.json';

type TranslationKey = keyof typeof en;

const translations = { en, hi };

let currentLocale: keyof typeof translations = 'en';

export function setLocale(locale: keyof typeof translations) {
  currentLocale = locale;
}

export function t(key: TranslationKey): string {
  return translations[currentLocale][key] ?? translations.en[key] ?? key;
}

export function useTranslation() {
  return { t, locale: currentLocale };
}
