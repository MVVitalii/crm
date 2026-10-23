'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useI18n } from '@/components/i18n-provider';

export function OrgNav({ orgSlug }: { orgSlug: string }) {
  const pathname = usePathname();
  const { dictionary } = useI18n();
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
            className={
              active
                ? 'shrink-0 rounded-full bg-background px-3 py-2 text-sm font-medium whitespace-nowrap text-primary shadow-neo-in'
                : 'shrink-0 rounded-full px-3 py-2 text-sm whitespace-nowrap text-muted-foreground hover:text-foreground hover:shadow-neo-sm'
            }
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
