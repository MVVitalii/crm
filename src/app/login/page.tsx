'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Brand } from '@/components/brand';
import { useI18n } from '@/components/i18n-provider';
import { Field, FormError } from '@/components/page';
import { Preferences } from '@/components/preferences';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth-client';

export default function LoginPage() {
  const router = useRouter();
  const { dictionary } = useI18n();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    const result = await authClient.signIn.email({
      email: String(formData.get('email')),
      password: String(formData.get('password')),
    });

    if (result.error) {
      setError(result.error.message ?? dictionary.auth.signInFailed);
      return;
    }

    router.push('/');
    router.refresh();
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-8 sm:py-16">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Preferences />
        <form action={onSubmit} className="flex flex-col gap-5 rounded-2xl bg-background p-5 shadow-neo sm:p-6">
          <div className="flex flex-col gap-3">
            <Brand />
            <h1 className="font-heading text-3xl leading-tight font-medium sm:text-4xl">{dictionary.auth.loginTitle}</h1>
            <p className="text-sm text-muted-foreground">{dictionary.auth.loginHint}</p>
          </div>
          <Field label={dictionary.auth.email}>
            <Input name="email" type="email" autoComplete="email" required />
          </Field>
          <Field label={dictionary.auth.password}>
            <Input name="password" type="password" autoComplete="current-password" required />
          </Field>
          <FormError>{error}</FormError>
          <Button type="submit">{dictionary.auth.signIn}</Button>
          <Link href="/register" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
            {dictionary.auth.toRegister}
          </Link>
        </form>
      </div>
    </main>
  );
}
