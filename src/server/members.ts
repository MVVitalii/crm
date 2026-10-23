'use server';

import { createHash, randomBytes } from 'node:crypto';

import { and, eq, gt, isNull } from 'drizzle-orm';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { db } from '@/db';
import { auditLogs, invitations, members, organizations } from '@/db/schema';
import { auth } from '@/lib/auth';
import { requireMember, requireRole } from '@/server/tenant';

const roleSchema = z.enum(['owner', 'manager', 'viewer']);

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

async function ownerContext(slug: string) {
  const context = await requireMember(slug);
  requireRole(context.member, 'owner');
  return context;
}

export async function inviteMember(slug: string, formData: FormData) {
  const { organization, session } = await ownerContext(slug);
  const email = z.string().trim().email().safeParse(formData.get('email'));
  const role = roleSchema.safeParse(formData.get('role'));
  if (!email.success || !role.success) redirect(`/${slug}/settings/members?error=invite`);

  const token = randomBytes(32).toString('base64url');
  const normalizedEmail = email.data.toLowerCase();

  await db.transaction(async (tx) => {
    await tx.insert(invitations).values({
      id: crypto.randomUUID(),
      organizationId: organization.id,
      email: normalizedEmail,
      role: role.data,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    await tx.insert(auditLogs).values({
      id: crypto.randomUUID(),
      organizationId: organization.id,
      actorId: session.user.id,
      action: 'member.invited',
      entityType: 'invitation',
      entityId: normalizedEmail,
      metadata: { email: normalizedEmail, role: role.data },
    });
  });

  console.info(`[invite] ${process.env.BETTER_AUTH_URL}/invite/${token}`);
  revalidatePath(`/${slug}/settings/members`);
}

export async function acceptInvitation(token: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/login');

  const tokenHash = hashToken(token);
  let slug = '';

  await db.transaction(async (tx) => {
    const rows = await tx
      .select()
      .from(invitations)
      .where(and(eq(invitations.tokenHash, tokenHash), isNull(invitations.acceptedAt), gt(invitations.expiresAt, new Date())))
      .limit(1);
    const invite = rows[0];
    if (!invite) redirect(`/invite/${token}?error=invalid`);
    if (session.user.email.toLowerCase() !== invite.email) redirect(`/invite/${token}?error=email`);

    const existing = await tx
      .select({ id: members.id })
      .from(members)
      .where(and(eq(members.organizationId, invite.organizationId), eq(members.userId, session.user.id)))
      .limit(1);
    if (existing[0]) redirect(`/invite/${token}?error=member`);

    const [organization] = await tx.select({ slug: organizations.slug }).from(organizations).where(eq(organizations.id, invite.organizationId)).limit(1);
    if (!organization) redirect(`/invite/${token}?error=invalid`);

    await tx.insert(members).values({
      id: crypto.randomUUID(),
      organizationId: invite.organizationId,
      userId: session.user.id,
      role: invite.role,
    });
    await tx.update(invitations).set({ acceptedAt: new Date() }).where(eq(invitations.id, invite.id));
    slug = organization.slug;
  });

  redirect(`/${slug}`);
}

export async function changeMemberRole(slug: string, memberId: string, formData: FormData) {
  const { organization, session } = await ownerContext(slug);
  const role = roleSchema.safeParse(formData.get('role'));
  if (!role.success) redirect(`/${slug}/settings/members?error=role`);

  const result = await db.transaction(async (tx) => {
    const rows = await tx
      .select()
      .from(members)
      .where(and(eq(members.id, memberId), eq(members.organizationId, organization.id)))
      .limit(1);
    const target = rows[0];
    if (!target) return { error: 'missing' as const };

    if (target.role === 'owner' && role.data !== 'owner') {
      const owners = await tx
        .select({ id: members.id })
        .from(members)
        .where(and(eq(members.organizationId, organization.id), eq(members.role, 'owner')));
      if (owners.length === 1) return { error: 'last-owner' as const };
    }

    await tx.update(members).set({ role: role.data }).where(eq(members.id, target.id));
    await tx.insert(auditLogs).values({
      id: crypto.randomUUID(),
      organizationId: organization.id,
      actorId: session.user.id,
      action: 'member.role_changed',
      entityType: 'member',
      entityId: target.id,
      metadata: { from: target.role, to: role.data },
    });
    return { error: null };
  });

  revalidatePath(`/${slug}/settings/members`);
  redirect(`/${slug}/settings/members${result.error ? `?error=${result.error}` : ''}`);
}

export async function removeMember(slug: string, memberId: string) {
  const { organization, session } = await ownerContext(slug);

  const result = await db.transaction(async (tx) => {
    const rows = await tx
      .select()
      .from(members)
      .where(and(eq(members.id, memberId), eq(members.organizationId, organization.id)))
      .limit(1);
    const target = rows[0];
    if (!target) return { error: 'missing' as const };

    if (target.role === 'owner') {
      const owners = await tx
        .select({ id: members.id })
        .from(members)
        .where(and(eq(members.organizationId, organization.id), eq(members.role, 'owner')));
      if (owners.length === 1) return { error: 'last-owner' as const };
    }

    await tx.delete(members).where(eq(members.id, target.id));
    await tx.insert(auditLogs).values({
      id: crypto.randomUUID(),
      organizationId: organization.id,
      actorId: session.user.id,
      action: 'member.removed',
      entityType: 'member',
      entityId: target.id,
      metadata: { role: target.role },
    });
    return { error: null };
  });

  revalidatePath(`/${slug}/settings/members`);
  redirect(`/${slug}/settings/members${result.error ? `?error=${result.error}` : ''}`);
}
