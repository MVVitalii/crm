import { eq } from 'drizzle-orm';
import { Pencil } from 'lucide-react';

import { CreateDialog } from '@/components/create-dialog';
import { EmptyState, Field, FormError, Page, PageHeader, Panel } from '@/components/page';
import { SubmitButton } from '@/components/ui/submit-button';
import { Input } from '@/components/ui/input';
import { db } from '@/db';
import { contacts } from '@/db/schema';
import { type Dictionary } from '@/i18n/dictionary';
import { getCopy } from '@/i18n/locale';
import { createContact, updateContact } from '@/server/crm';
import { requireMember } from '@/server/tenant';

export const instant = false;

function ContactForm({
  orgSlug,
  error,
  dictionary,
  className,
}: {
  orgSlug: string;
  error: string | string[] | undefined;
  dictionary: Dictionary;
  className: string;
}) {
  return (
    <form action={createContact.bind(null, orgSlug)} className={className}>
      <Field label={dictionary.contacts.name}>
        <Input name="name" required />
      </Field>
      <Field label={dictionary.contacts.email}>
        <Input name="email" type="email" />
      </Field>
      <Field label={dictionary.contacts.phone}>
        <Input name="phone" />
      </Field>
      <div className="flex flex-col items-stretch gap-3 sm:col-span-2 sm:items-start">
        <FormError>
          {error === 'name' ? dictionary.contacts.nameError : error === 'email' ? dictionary.contacts.emailError : null}
        </FormError>
        <SubmitButton className="w-full sm:w-auto">{dictionary.contacts.add}</SubmitButton>
      </div>
    </form>
  );
}

function EditContact({
  orgSlug,
  contact,
  error,
  dictionary,
}: {
  orgSlug: string;
  contact: { id: string; name: string; email: string | null; phone: string | null };
  error: string | string[] | undefined;
  dictionary: Dictionary;
}) {
  return (
    <CreateDialog
      label={`${dictionary.contacts.edit} ${contact.name}`}
      title={dictionary.contacts.edit}
      invalid={error === 'name' || error === 'email'}
      icon={<Pencil className="size-4" aria-hidden />}
    >
      <form
        key={`${contact.name}:${contact.email ?? ''}:${contact.phone ?? ''}`}
        action={updateContact.bind(null, orgSlug, contact.id)}
        className="flex flex-col gap-3"
      >
        <Field label={dictionary.contacts.name}>
          <Input name="name" required defaultValue={contact.name} />
        </Field>
        <Field label={dictionary.contacts.email}>
          <Input name="email" type="email" defaultValue={contact.email ?? ''} />
        </Field>
        <Field label={dictionary.contacts.phone}>
          <Input name="phone" defaultValue={contact.phone ?? ''} />
        </Field>
        <FormError>
          {error === 'name' ? dictionary.contacts.nameError : error === 'email' ? dictionary.contacts.emailError : null}
        </FormError>
        <SubmitButton className="w-full">{dictionary.contacts.save}</SubmitButton>
      </form>
    </CreateDialog>
  );
}

export default async function ContactsPage({ params, searchParams }: PageProps<'/[orgSlug]/contacts'>) {
  const { orgSlug } = await params;
  const { error, contact } = await searchParams;
  const editing = typeof contact === 'string' ? contact : undefined;
  const { organization, member } = await requireMember(orgSlug);
  const { dictionary } = await getCopy();
  const canEdit = member.role !== 'viewer';

  const rows = await db.select().from(contacts).where(eq(contacts.organizationId, organization.id));
  const invalid = !editing && (error === 'name' || error === 'email');

  return (
    <Page>
      <PageHeader
        title={dictionary.contacts.title}
        description={dictionary.contacts.hint}
        action={
          canEdit && rows.length > 0 ? (
            <CreateDialog label={dictionary.contacts.newContact} title={dictionary.contacts.newContact} invalid={invalid}>
              <ContactForm orgSlug={orgSlug} error={invalid ? error : undefined} dictionary={dictionary} className="flex flex-col gap-3" />
            </CreateDialog>
          ) : null
        }
      />
      {rows.length === 0 ? <EmptyState>{dictionary.contacts.empty}</EmptyState> : null}
      <ul className="flex flex-col gap-2">
        {rows.map((row) => (
          <li key={row.id} className="flex items-start justify-between gap-3 rounded-2xl bg-background px-4 py-3 shadow-neo-sm">
            <div className="min-w-0">
              <p className="font-medium break-words">{row.name}</p>
              <p className="text-sm break-words text-muted-foreground">
                {[row.email, row.phone].filter(Boolean).join(' · ') || dictionary.contacts.noDetails}
              </p>
            </div>
            {canEdit ? (
              <EditContact
                orgSlug={orgSlug}
                contact={row}
                error={editing === row.id ? error : undefined}
                dictionary={dictionary}
              />
            ) : null}
          </li>
        ))}
      </ul>
      {canEdit && rows.length === 0 ? (
        <Panel>
          <h2 className="font-heading text-lg font-medium">{dictionary.contacts.newContact}</h2>
          <ContactForm
            orgSlug={orgSlug}
            error={error}
            dictionary={dictionary}
            className="grid gap-3 sm:grid-cols-2"
          />
        </Panel>
      ) : null}
    </Page>
  );
}
