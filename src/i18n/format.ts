import type { Locale } from '@/i18n/dictionary';

export function fill(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? '');
}

export function money(kopecks: number, locale: Locale) {
  const formatted = (kopecks / 100).toLocaleString(locale === 'en' ? 'en-US' : 'ru-RU');
  return `${formatted} ₽`;
}

export function dateTime(value: Date, locale: Locale) {
  return value.toLocaleString(locale === 'en' ? 'en-GB' : 'ru-RU');
}
