import { and, eq } from 'drizzle-orm';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Field, FormError, PageHeader, Panel } from '@/components/page';
import { SubmitButton } from '@/components/ui/submit-button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { db } from '@/db';
import { contacts, deals, notes, tasks } from '@/db/schema';
import { money } from '@/i18n/format';
import { getCopy } from '@/i18n/locale';
import { createNote, createTask, toggleTask, updateDeal } from '@/server/crm';
import { requireMember } from '@/server/tenant';

export const instant = false;

export default async function DealPage({ params, searchParams }: PageProps<'/[orgSlug]/deals/[dealId]'>) {
  const { orgSlug, dealId } = await params;
  const { error } = await searchParams;
  const { organization, member } = await requireMember(orgSlug);
  const { locale, dictionary } = await getCopy();
  const canEdit = member.role !== 'viewer';

  const rows = await db
    .select()
    .from(deals)
    .where(and(eq(deals.id, dealId), eq(deals.organizationId, organization.id)))
    .limit(1);
  const deal = rows[0];
  if (!deal) notFound();

  const people = await db.select().from(contacts).where(eq(contacts.organizationId, organization.id));
  const dealNotes = await db.select().from(notes).where(eq(notes.dealId, deal.id));
  const dealTasks = await db.select().from(tasks).where(eq(tasks.dealId, deal.id));
  const contact = people.find((item) => item.id === deal.contactId);

  return (
    <div className="mx-auto flex w-full max-w-5xl min-w-0 flex-col gap-6">
      <div className="flex min-w-0 flex-col gap-2">
        <Link href={`/${orgSlug}/deals`} className="text-sm text-muted-foreground hover:text-foreground">
          {dictionary.deals.back}
        </Link>
        <PageHeader title={deal.title} description={`${dictionary.stages[deal.stage]} · ${money(deal.value, locale)}`} />
        <p className="text-sm text-muted-foreground">{contact ? contact.name : dictionary.deals.noContact}</p>
      </div>

      <div className="grid min-w-0 items-start gap-6 lg:grid-cols-2">
        <Panel>
          <h2 className="font-heading text-lg font-medium">{dictionary.deals.fields}</h2>
          {canEdit ? (
            <form action={updateDeal.bind(null, orgSlug, deal.id)} className="flex flex-col gap-3">
              <Field label={dictionary.deals.titleField}>
                <Input name="title" defaultValue={deal.title} required />
              </Field>
              <Field label={dictionary.deals.amount}>
                <Input name="rubles" type="number" min={0} step={1} defaultValue={deal.value / 100} required />
              </Field>
              <Field label={dictionary.deals.contact}>
                <NativeSelect name="contactId" defaultValue={deal.contactId ?? ''}>
                  <option value="">{dictionary.deals.noContact}</option>
                  {people.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
              <FormError>{error === 'deal' || error === 'contact' ? dictionary.deals.checkFields : null}</FormError>
              <SubmitButton type="submit" className="w-full sm:w-auto sm:self-start">
                {dictionary.deals.save}
              </SubmitButton>
            </form>
          ) : (
            <p className="font-heading text-3xl font-medium">{money(deal.value, locale)}</p>
          )}
        </Panel>

        <div className="flex min-w-0 flex-col gap-6">
          <Panel>
            <h2 className="font-heading text-lg font-medium">{dictionary.deals.notes}</h2>
            {dealNotes.length === 0 ? <p className="text-sm text-muted-foreground">{dictionary.deals.noNotes}</p> : null}
            <ul className="flex flex-col gap-2">
              {dealNotes.map((note) => (
                <li key={note.id} className="rounded-xl bg-background px-3 py-2 text-sm break-words shadow-neo-in">
                  {note.body}
                </li>
              ))}
            </ul>
            {canEdit ? (
              <form action={createNote.bind(null, orgSlug, deal.id)} className="flex flex-col gap-3">
                <Field label={dictionary.deals.note}>
                  <Input name="body" required />
                </Field>
                <FormError>{error === 'note' ? dictionary.deals.emptyNote : null}</FormError>
                <SubmitButton type="submit" variant="outline" className="w-full sm:w-auto sm:self-start">
                  {dictionary.deals.addNote}
                </SubmitButton>
              </form>
            ) : null}
          </Panel>

          <Panel>
            <h2 className="font-heading text-lg font-medium">{dictionary.deals.tasks}</h2>
            {dealTasks.length === 0 ? <p className="text-sm text-muted-foreground">{dictionary.deals.noTasks}</p> : null}
            <ul className="flex flex-col gap-2">
              {dealTasks.map((task) => (
                <li key={task.id}>
                  <form action={toggleTask.bind(null, orgSlug, deal.id, task.id)} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <span className={task.done ? 'text-sm break-words text-muted-foreground line-through' : 'text-sm break-words'}>
                      {task.title}
                    </span>
                    {canEdit ? (
                      <SubmitButton type="submit" variant="outline" size="sm" className="w-full sm:w-auto">
                        {task.done ? dictionary.deals.undo : dictionary.deals.done}
                      </SubmitButton>
                    ) : null}
                  </form>
                </li>
              ))}
            </ul>
            {canEdit ? (
              <form action={createTask.bind(null, orgSlug, deal.id)} className="flex flex-col gap-3">
                <Field label={dictionary.deals.task}>
                  <Input name="title" required />
                </Field>
                <FormError>{error === 'task' ? dictionary.deals.emptyTask : null}</FormError>
                <SubmitButton type="submit" variant="outline" className="w-full sm:w-auto sm:self-start">
                  {dictionary.deals.addTask}
                </SubmitButton>
              </form>
            ) : null}
          </Panel>
        </div>
      </div>
    </div>
  );
}
