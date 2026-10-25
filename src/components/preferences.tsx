'use client';

import { SlidersHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useSyncExternalStore, useTransition, type ReactNode } from 'react';

import { BusyIcon } from '@/components/busy-icon';
import { useI18n } from '@/components/i18n-provider';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
  const [isPending, startTransition] = useTransition();
  const [pendingLocale, setPendingLocale] = useState<Locale | null>(null);
  if (!isPending && pendingLocale) setPendingLocale(null);
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
            aria-busy={(isPending && pendingLocale === item) || undefined}
            onClick={() => {
              writeLocale(item);
              setPendingLocale(item);
              startTransition(() => router.refresh());
            }}
          >
            {isPending && pendingLocale === item ? <BusyIcon className="mr-1 inline size-3" /> : null}
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

export function PreferencesMenu({
  side = 'top',
  align = 'start',
  children,
}: {
  side?: 'top' | 'bottom';
  align?: 'start' | 'end';
  children?: ReactNode;
}) {
  const { dictionary } = useI18n();
  const label = children
    ? `${dictionary.prefs.theme}, ${dictionary.prefs.language}, ${dictionary.signOut}`
    : `${dictionary.prefs.theme}, ${dictionary.prefs.language}`;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        aria-label={label}
        className="inline-flex size-7 items-center justify-center rounded-full bg-background text-primary shadow-neo-sm"
      >
        <SlidersHorizontal className="size-4" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent side={side} align={align} sideOffset={8} className="w-auto p-3">
        <div className="flex flex-col gap-2">
          <Preferences />
          {children}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
