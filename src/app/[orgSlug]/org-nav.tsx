'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { BusyIcon } from '@/components/busy-icon';
import { useI18n } from '@/components/i18n-provider';

export function OrgNav({ orgSlug }: { orgSlug: string }) {
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
    <nav className="flex gap-1 md:flex-col">
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
              active
                ? 'inline-flex shrink-0 items-center gap-1.5 rounded-full bg-background px-3 py-2 text-sm font-medium whitespace-nowrap text-primary shadow-neo-in'
                : 'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-sm whitespace-nowrap text-muted-foreground hover:text-foreground hover:shadow-neo-sm'
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
