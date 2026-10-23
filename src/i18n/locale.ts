import { cookies } from 'next/headers';

import { getDictionary, type Locale } from '@/i18n/dictionary';

export async function getLocale(): Promise<Locale> {
  const jar = await cookies();
  return jar.get('locale')?.value === 'en' ? 'en' : 'ru';
}

export async function getCopy() {
  const locale = await getLocale();
  return { locale, dictionary: getDictionary(locale) };
}
