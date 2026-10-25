import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { SignOutButton } from '@/app/[orgSlug]/sign-out-button';
import { Brand } from '@/components/brand';
import { PreferencesMenu } from '@/components/preferences';

function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-background text-primary shadow-neo-sm"
    >
      <ChevronLeft className="size-4" aria-hidden />
    </Link>
  );
}

export function WorkspaceChrome({
  title,
  back,
  navBar,
  navSidebar,
  children,
}: {
  title: string;
  back?: { href: string; label: string };
  navBar?: ReactNode;
  navSidebar?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-svh">
      <aside className="sticky top-0 hidden h-svh w-56 shrink-0 flex-col bg-background px-3 py-5 text-sidebar-foreground md:flex lg:w-60">
        <div className="flex items-center gap-2 px-3">
          {back ? <BackLink href={back.href} label={back.label} /> : null}
          <Brand />
        </div>
        <p className="mx-3 mt-6 truncate rounded-2xl bg-background px-3 py-2 text-center text-sm font-medium text-primary shadow-neo">
          {title}
        </p>
        <div className="mt-4 min-h-0 flex-1 overflow-y-auto">{navSidebar}</div>
        <div className="mt-4 flex flex-col items-start gap-2">
          <PreferencesMenu />
          <SignOutButton className="w-full" />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-col gap-3 bg-background px-3 py-3 md:hidden">
          <div className="grid h-7 grid-cols-[1fr_auto_1fr] items-center">
            <div className="flex justify-start">{back ? <BackLink href={back.href} label={back.label} /> : null}</div>
            <Brand />
            <div className="flex justify-end">
              <PreferencesMenu side="bottom" align="end">
                <SignOutButton className="w-full" />
              </PreferencesMenu>
            </div>
          </div>
          <p className="truncate rounded-2xl bg-background px-4 py-3 text-center font-heading text-lg font-medium text-primary shadow-neo">
            {title}
          </p>
          {navBar}
        </div>
        <div className="min-w-0 flex-1 px-3 py-5 sm:px-4 sm:py-6 md:px-8 md:py-8">{children}</div>
      </div>
    </div>
  );
}
