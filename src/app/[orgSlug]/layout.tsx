import { Brand } from '@/components/brand';
import { Preferences } from '@/components/preferences';
import { requireMember } from '@/server/tenant';

import { OrgNav } from './org-nav';
import { SignOutButton } from './sign-out-button';

export const instant = false;

export default async function OrgLayout({ children, params }: LayoutProps<'/[orgSlug]'>) {
  const { orgSlug } = await params;
  const { organization } = await requireMember(orgSlug);

  return (
    <div className="flex min-h-svh">
      <aside className="sticky top-0 hidden h-svh w-56 shrink-0 flex-col bg-background px-3 py-5 text-sidebar-foreground md:flex lg:w-60">
        <div className="px-3">
          <Brand />
        </div>
        <p className="mx-3 mt-6 truncate rounded-full bg-background px-3 py-1.5 text-sm font-medium shadow-neo-sm">
          {organization.name}
        </p>
        <div className="mt-4 min-h-0 flex-1 overflow-y-auto">
          <OrgNav orgSlug={orgSlug} />
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <Preferences />
          <SignOutButton className="w-full" />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-background px-3 py-3 md:hidden">
          <div className="min-w-0">
            <Brand />
            <p className="mt-1 truncate text-sm text-muted-foreground">{organization.name}</p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Preferences />
            <SignOutButton />
          </div>
        </div>
        <div className="overflow-x-auto px-2 py-2 md:hidden">
          <OrgNav orgSlug={orgSlug} />
        </div>
        <div className="min-w-0 flex-1 px-3 py-5 sm:px-4 sm:py-6 md:px-8 md:py-8">{children}</div>
      </div>
    </div>
  );
}
