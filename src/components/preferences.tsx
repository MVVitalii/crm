'use client';

import { useRouter } from 'next/navigation';
import { useSyncExternalStore } from 'react';

import { useI18n } from '@/components/i18n-provider';
import { applyTheme, readThemeChoice, subscribeTheme, themeChoiceOnServer, type ThemeChoice } from '@/components/theme';
import { type Locale } from '@/i18n/dictionary';

const themes: ThemeChoice[] = ['system', 'light', 'dark'];
const locales: Locale[] = ['ru', 'en'];

function writeLocale(locale: Locale) {
  document.cookie = `locale=${locale}; path=/; max-age=31536000; samesite=lax`;
}

export function Preferences() {
  const router = useRouter();
  const { locale, dictionary } = useI18n();
  const theme = useSyncExternalStore(subscribeTheme, readThemeChoice, themeChoiceOnServer);
  const themeLabel: Record<ThemeChoice, string> = {
    system: dictionary.prefs.system,
    light: dictionary.prefs.light,
    dark: dictionary.prefs.dark,
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <div className="flex rounded-full bg-background p-1 shadow-neo-in" role="group" aria-label={dictionary.prefs.theme}>
        {themes.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={theme === item}
            className={
              theme === item
                ? 'rounded-full bg-background px-2.5 py-1 text-xs font-medium text-primary shadow-neo-sm'
                : 'rounded-full px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground'
            }
            onClick={() => applyTheme(item)}
          >
            {themeLabel[item]}
          </button>
        ))}
      </div>
      <div className="flex rounded-full bg-background p-1 shadow-neo-in" role="group" aria-label={dictionary.prefs.language}>
        {locales.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={locale === item}
            className={
              locale === item
                ? 'rounded-full bg-background px-2.5 py-1 text-xs font-medium text-primary uppercase shadow-neo-sm'
                : 'rounded-full px-2.5 py-1 text-xs uppercase text-muted-foreground hover:text-foreground'
            }
            onClick={() => {
              writeLocale(item);
              router.refresh();
            }}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
