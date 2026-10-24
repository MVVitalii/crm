import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { SignOutButton } from '@/app/[orgSlug]/sign-out-button';
import { Brand } from '@/components/brand';
import { CreateDialog } from '@/components/create-dialog';
import { Field, FormError, Page, PageHeader, Panel } from '@/components/page';
import { Preferences } from '@/components/preferences';
import { SubmitButton } from '@/components/ui/submit-button';
import { Input } from '@/components/ui/input';
import { db } from '@/db';
import { members, organizations } from '@/db/schema';
import { type Dictionary } from '@/i18n/dictionary';
import { fill } from '@/i18n/format';
import { getCopy } from '@/i18n/locale';
import { auth } from '@/lib/auth';
import { createOrganization } from '@/server/organization';

export const instant = false;

function OrgForm({ error, dictionary }: { error: string | string[] | undefined; dictionary: Dictionary }) {
  return (
    <form action={createOrganization} className="flex flex-col gap-3">
      <Field label={dictionary.home.name}>
        <Input name="name" required minLength={2} />
      </Field>
      <FormError>{error === 'name' ? dictionary.home.nameError : null}</FormError>
      <SubmitButton className="w-full sm:w-auto sm:self-start">{dictionary.home.create}</SubmitButton>
    </form>
  );
}

export default async function Home({ searchParams }: PageProps<'/'>) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/login');

  const { error } = await searchParams;
  const { dictionary } = await getCopy();
  const rows = await db
    .select({ name: organizations.name, slug: organizations.slug })
    .from(members)
    .innerJoin(organizations, eq(members.organizationId, organizations.id))
    .where(eq(members.userId, session.user.id));

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-6 sm:py-8 md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Brand />
        <div className="flex flex-wrap items-center gap-2">
          <Preferences />
          <SignOutButton />
        </div>
      </div>
      <PageHeader
        title={dictionary.home.title}
        description={fill(dictionary.home.greeting, { name: session.user.name })}
        action={
          rows.length > 0 ? (
            <CreateDialog label={dictionary.home.newOrg} title={dictionary.home.newOrg} invalid={error === 'name'}>
              <OrgForm error={error} dictionary={dictionary} />
            </CreateDialog>
          ) : null
        }
      />
      <Page>
        {rows.length === 0 ? <p className="text-sm text-muted-foreground">{dictionary.home.empty}</p> : null}
        <ul className="grid gap-3 sm:grid-cols-2">
          {rows.map((organization) => (
            <li key={organization.slug}>
              <Link
                href={`/${organization.slug}`}
                className="flex h-full flex-col gap-1 rounded-2xl bg-background p-4 shadow-neo"
              >
                <span className="font-medium break-words">{organization.name}</span>
                <span className="text-sm break-all text-muted-foreground">/{organization.slug}</span>
              </Link>
            </li>
          ))}
        </ul>
        {rows.length === 0 ? (
          <Panel>
            <h2 className="font-heading text-lg font-medium">{dictionary.home.newOrg}</h2>
            <OrgForm error={error} dictionary={dictionary} />
          </Panel>
        ) : null}
      </Page>
    </main>
  );
}
