'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { BusyIcon } from '@/components/busy-icon';
import { useI18n } from '@/components/i18n-provider';

export function OrgNav({ orgSlug, placement }: { orgSlug: string; placement: 'bar' | 'sidebar' }) {
  const pathname = usePathname();
  const { dictionary } = useI18n();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [pendingPath, setPendingPath] = useState(pathname);
  if (pathname !== pendingPath) {
    setPendingPath(pathname);
    setPendingHref(null);
  }
  const items = [
    [dictionary.nav.deals, 'deals'],
    [dictionary.nav.contacts, 'contacts'],
    [dictionary.nav.members, 'settings/members'],
    [dictionary.nav.audit, 'audit'],
  ] as const;

  return (
    <nav className={placement === 'bar' ? 'grid grid-cols-2 gap-2' : 'flex flex-col gap-1'}>
      {items.map(([label, path]) => {
        const href = `/${orgSlug}/${path}`;
        const active = pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={path}
            href={href}
            aria-current={active ? 'page' : undefined}
            aria-busy={pendingHref === href || undefined}
            onClick={() => {
              if (!active) setPendingHref(href);
            }}
            className={
              placement === 'bar'
                ? active
                  ? 'inline-flex min-w-0 items-center justify-center gap-1.5 rounded-2xl bg-background px-3 py-3 text-center text-sm font-medium text-primary shadow-neo-in'
                  : 'inline-flex min-w-0 items-center justify-center gap-1.5 rounded-2xl bg-background px-3 py-3 text-center text-sm font-medium shadow-neo-sm'
                : active
                  ? 'inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-2 text-sm font-medium whitespace-nowrap text-primary shadow-neo-in'
                  : 'inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm whitespace-nowrap text-muted-foreground hover:text-foreground hover:shadow-neo-sm'
            }
          >
            {pendingHref === href ? <BusyIcon className="size-3.5" /> : null}
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
