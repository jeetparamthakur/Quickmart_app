import en from './en.json';
import hi from './hi.json';

type TranslationKey = keyof typeof en;

const translations = { en, hi };

let currentLocale: keyof typeof translations = 'en';

export function setLocale(locale: keyof typeof translations) {
  currentLocale = locale;
}

export function t(key: TranslationKey, vars?: Record<string, string | number>): string {
  let value: string = translations[currentLocale][key] ?? translations.en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      value = value.split(`{${k}}`).join(String(v));
    }
  }
  return value;
}

export function useTranslation() {
  return { t, locale: currentLocale };
}
