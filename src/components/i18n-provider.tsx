'use client';

import { createContext, useContext, type ReactNode } from 'react';

import { type Dictionary, type Locale } from '@/i18n/dictionary';

const I18nContext = createContext<{ locale: Locale; dictionary: Dictionary } | null>(null);

export function I18nProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary;
  children: ReactNode;
}) {
  return <I18nContext.Provider value={{ locale, dictionary }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error('I18nProvider missing');
  return value;
}
