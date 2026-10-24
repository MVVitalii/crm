'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { BusyIcon } from '@/components/busy-icon';
import { useI18n } from '@/components/i18n-provider';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();
  const { dictionary } = useI18n();
  const [pending, setPending] = useState(false);

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={className}
      aria-busy={pending || undefined}
      disabled={pending}
      onClick={async () => {
        setPending(true);
        try {
          await authClient.signOut();
          router.push('/login');
          router.refresh();
        } catch {
          setPending(false);
        }
      }}
    >
      {pending ? <BusyIcon /> : null}
      {dictionary.signOut}
    </Button>
  );
}
