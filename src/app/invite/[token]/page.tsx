import { createHash } from 'node:crypto';

import { and, eq, gt, isNull } from 'drizzle-orm';
import { headers } from 'next/headers';
import Link from 'next/link';

import { Brand } from '@/components/brand';
import { FormError } from '@/components/page';
import { Preferences } from '@/components/preferences';
import { SubmitButton } from '@/components/ui/submit-button';
import { db } from '@/db';
import { invitations } from '@/db/schema';
import { fill } from '@/i18n/format';
import { getCopy } from '@/i18n/locale';
import { auth } from '@/lib/auth';
import { acceptInvitation } from '@/server/members';

export const instant = false;

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export default async function InvitePage({ params, searchParams }: PageProps<'/invite/[token]'>) {
  const { token } = await params;
  const { error } = await searchParams;
  const { dictionary } = await getCopy();
  const session = await auth.api.getSession({ headers: await headers() });
  const rows = await db
    .select()
    .from(invitations)
    .where(and(eq(invitations.tokenHash, hashToken(token)), isNull(invitations.acceptedAt), gt(invitations.expiresAt, new Date())))
    .limit(1);
  const invite = rows[0];

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-8 sm:py-16">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Preferences />
        <div className="flex flex-col gap-4 rounded-2xl bg-background p-5 shadow-neo sm:p-6">
          <Brand />
          {!invite ? (
            <>
              <h1 className="font-heading text-3xl leading-tight font-medium sm:text-4xl">{dictionary.invite.invalidTitle}</h1>
              <p className="text-sm text-muted-foreground">{dictionary.invite.invalidHint}</p>
            </>
          ) : (
            <>
              <h1 className="font-heading text-3xl leading-tight font-medium break-words sm:text-4xl">
                {fill(dictionary.invite.forEmail, { email: invite.email })}
              </h1>
              <FormError>
                {error === 'email' ? dictionary.invite.wrongEmail : error === 'member' ? dictionary.invite.alreadyMember : null}
              </FormError>
              {!session ? (
                <div className="flex flex-wrap gap-4 text-sm">
                  <Link href="/login" className="underline-offset-4 hover:underline">
                    {dictionary.invite.login}
                  </Link>
                  <Link href="/register" className="underline-offset-4 hover:underline">
                    {dictionary.invite.register}
                  </Link>
                </div>
              ) : session.user.email.toLowerCase() === invite.email ? (
                <form action={acceptInvitation.bind(null, token)}>
                  <SubmitButton className="w-full sm:w-auto">{dictionary.invite.accept}</SubmitButton>
                </form>
              ) : (
                <p className="text-sm break-words text-muted-foreground">
                  {fill(dictionary.invite.wrongAccount, { current: session.user.email, needed: invite.email })}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
