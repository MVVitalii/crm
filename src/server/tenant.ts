import { and, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

import { db } from '@/db';
import { members, organizations } from '@/db/schema';
import { auth } from '@/lib/auth';

const rank = { viewer: 0, manager: 1, owner: 2 } as const;
type Role = keyof typeof rank;

export async function requireMember(slug: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/login');

  const rows = await db
    .select({ organization: organizations, member: members })
    .from(organizations)
    .innerJoin(members, and(eq(members.organizationId, organizations.id), eq(members.userId, session.user.id)))
    .where(eq(organizations.slug, slug))
    .limit(1);

  const row = rows[0];
  if (!row) notFound();

  return { session, organization: row.organization, member: row.member };
}

export function requireRole(member: { role: Role }, role: Role) {
  if (rank[member.role] < rank[role]) {
    throw new Error('Недостаточно прав');
  }
}
