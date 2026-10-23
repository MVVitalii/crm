import { eq } from 'drizzle-orm';

import { PageHeader } from '@/components/page';
import { db } from '@/db';
import { contacts, deals } from '@/db/schema';
import { getCopy } from '@/i18n/locale';
import { requireMember } from '@/server/tenant';

import { DealBoard } from './board';

export const instant = false;

export default async function DealsPage({ params, searchParams }: PageProps<'/[orgSlug]/deals'>) {
  const { orgSlug } = await params;
  const { error } = await searchParams;
  const { organization, member } = await requireMember(orgSlug);
  const { dictionary } = await getCopy();
  const canEdit = member.role !== 'viewer';

  const rows = await db.select().from(deals).where(eq(deals.organizationId, organization.id));
  const people = await db.select().from(contacts).where(eq(contacts.organizationId, organization.id));

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <PageHeader title={dictionary.deals.title} description={dictionary.deals.hint} />
      <DealBoard
        key={rows.map((deal) => `${deal.id}:${deal.stage}:${deal.position}`).join('|')}
        orgSlug={orgSlug}
        canEdit={canEdit}
        invalid={error === 'deal' || error === 'contact'}
        contacts={people.map((contact) => ({ id: contact.id, name: contact.name }))}
        deals={rows.map((deal) => ({
          id: deal.id,
          title: deal.title,
          value: deal.value,
          stage: deal.stage,
          position: deal.position,
        }))}
      />
    </div>
  );
}
