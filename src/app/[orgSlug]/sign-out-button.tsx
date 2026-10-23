'use client';

import { useRouter } from 'next/navigation';

import { useI18n } from '@/components/i18n-provider';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();
  const { dictionary } = useI18n();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={className}
      onClick={async () => {
        await authClient.signOut();
        router.push('/login');
        router.refresh();
      }}
    >
      {dictionary.signOut}
    </Button>
  );
}
