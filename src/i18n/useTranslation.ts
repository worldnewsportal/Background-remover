import { useCallback, useEffect, useState } from 'react';
import type { Language } from '../types/studio';
import { BRAND_CONFIG } from '../config';
import { TRANSLATIONS, type TranslationDictionary } from './translations';

const STORAGE_KEY = 'noorcut_lang';

function readInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'ar';
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'ar' || saved === 'en' || saved === 'pt' || saved === 'fr') {
      return saved;
    }
  } catch {
    // Ignore storage access errors in restricted contexts
  }
  return 'ar';
}

export function applyDocumentDirection(lang: Language): void {
  if (typeof document === 'undefined') return;
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = lang;
  document.title = `${BRAND_CONFIG.names[lang]} — ${TRANSLATIONS[lang].heroTitle}`;
}

export function useTranslation() {
  const [lang, setLangState] = useState<Language>(readInitialLanguage);

  useEffect(() => {
    applyDocumentDirection(lang);
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore storage errors
    }
  }, [lang]);

  const setLanguage = useCallback((nextLang: Language) => {
    setLangState(nextLang);
    applyDocumentDirection(nextLang);
    try {
      window.localStorage.setItem(STORAGE_KEY, nextLang);
    } catch {
      // Ignore
    }
  }, []);

  const t: TranslationDictionary = TRANSLATIONS[lang];
  const isRtl = lang === 'ar';

  return { lang, setLanguage, t, isRtl };
}
