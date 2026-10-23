import { desc, eq } from 'drizzle-orm';

import { EmptyState, Page, PageHeader } from '@/components/page';
import { db } from '@/db';
import { auditLogs, user } from '@/db/schema';
import { type Dictionary } from '@/i18n/dictionary';
import { dateTime } from '@/i18n/format';
import { getCopy } from '@/i18n/locale';
import { requireMember } from '@/server/tenant';

export const instant = false;

function roleName(value: unknown, dictionary: Dictionary) {
  if (value === 'owner' || value === 'manager' || value === 'viewer') return dictionary.roles[value];
  return String(value ?? '');
}

function details(action: string, metadata: unknown, dictionary: Dictionary) {
  if (!metadata || typeof metadata !== 'object') return '';
  const data = metadata as Record<string, unknown>;

  if (action === 'deal.stage_changed') {
    const from = data.from === 'lead' || data.from === 'negotiation' || data.from === 'won' ? dictionary.stages[data.from] : data.from;
    const to = data.to === 'lead' || data.to === 'negotiation' || data.to === 'won' ? dictionary.stages[data.to] : data.to;
    return `${from} → ${to}`;
  }

  if (action === 'member.role_changed') return `${roleName(data.from, dictionary)} → ${roleName(data.to, dictionary)}`;
  if (action === 'member.invited') return `${data.email} · ${roleName(data.role, dictionary)}`;
  if (action === 'member.removed') return roleName(data.role, dictionary);
  return '';
}

export default async function AuditPage({ params }: PageProps<'/[orgSlug]/audit'>) {
  const { orgSlug } = await params;
  const { organization } = await requireMember(orgSlug);
  const { locale, dictionary } = await getCopy();
  const actionLabel: Record<string, string> = {
    'deal.stage_changed': dictionary.audit.stageChanged,
    'member.invited': dictionary.audit.invited,
    'member.role_changed': dictionary.audit.roleChanged,
    'member.removed': dictionary.audit.removed,
  };

  const rows = await db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      metadata: auditLogs.metadata,
      createdAt: auditLogs.createdAt,
      actor: user.email,
    })
    .from(auditLogs)
    .leftJoin(user, eq(auditLogs.actorId, user.id))
    .where(eq(auditLogs.organizationId, organization.id))
    .orderBy(desc(auditLogs.createdAt));

  return (
    <Page>
      <PageHeader title={dictionary.audit.title} description={dictionary.audit.hint} />
      {rows.length === 0 ? <EmptyState>{dictionary.audit.empty}</EmptyState> : null}
      <ol className="flex flex-col gap-2">
        {rows.map((row) => (
          <li key={row.id} className="rounded-2xl bg-background px-4 py-3 shadow-neo-sm">
            <p className="font-medium">{actionLabel[row.action] ?? row.action}</p>
            <p className="text-sm break-words text-muted-foreground">
              {dateTime(row.createdAt, locale)}
              {row.actor ? ` · ${row.actor}` : ''}
              {details(row.action, row.metadata, dictionary) ? ` · ${details(row.action, row.metadata, dictionary)}` : ''}
            </p>
          </li>
        ))}
      </ol>
    </Page>
  );
}
