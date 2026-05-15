import { Language, translations } from '@/lib/translations';
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type TranslationKey = keyof typeof translations['en'];
export type TranslationDictionary = Record<Language, Partial<Record<TranslationKey, string>>>;

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey | string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);
const EMPTY_TRANSLATIONS_OVERRIDE: Partial<TranslationDictionary> = {};
const EMPTY_LANGUAGE_TRANSLATIONS: Partial<Record<TranslationKey, string>> = {};

export type LanguageProviderProps = {
  children: React.ReactNode;
  defaultLanguage?: Language;
  language?: Language;
  onLanguageChange?: (language: Language) => void;
  translationsOverride?: Partial<TranslationDictionary>;
};

const getBrowserLanguage = (): Language => {
  if (typeof navigator === 'undefined') return 'en';
  return navigator.language.toLowerCase().startsWith('tr') ? 'tr' : 'en';
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
  defaultLanguage,
  language: controlledLanguage,
  onLanguageChange,
  translationsOverride = EMPTY_TRANSLATIONS_OVERRIDE,
}) => {
  const [uncontrolledLanguage, setUncontrolledLanguage] = useState<Language>(() => defaultLanguage ?? getBrowserLanguage());
  const language = controlledLanguage ?? uncontrolledLanguage;

  const mergedTranslations = useMemo(() => ({
    en: { ...translations.en, ...(translationsOverride.en ?? EMPTY_LANGUAGE_TRANSLATIONS) },
    tr: { ...translations.tr, ...(translationsOverride.tr ?? EMPTY_LANGUAGE_TRANSLATIONS) },
  }), [translationsOverride]);

  const setLanguage = useCallback((nextLanguage: Language) => {
    if (controlledLanguage === undefined) {
      setUncontrolledLanguage(nextLanguage);
    }
    onLanguageChange?.(nextLanguage);
  }, [controlledLanguage, onLanguageChange]);

  const t = useCallback((key: TranslationKey | string) => {
    return mergedTranslations[language][key as TranslationKey] || key;
  }, [language, mergedTranslations]);

  const value = useMemo(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    console.warn('useLanguage: LanguageProvider not found. Using default English. Wrap your app with <LanguageProvider> for full functionality.');
    return { language: 'en' as const, setLanguage: () => { }, t: (key: string) => key };
  }
  return context;
};