import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, expect, test, vi } from 'vitest';

const { getSession } = vi.hoisted(() => ({ getSession: vi.fn() }));

vi.mock('next/headers', () => ({
  headers: async () => new Headers(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
  redirect: (url: string) => {
    throw new Error(`redirect:${url}`);
  },
}));

vi.mock('@/lib/auth', () => ({
  auth: { api: { getSession } },
}));

import { db } from '@/db';
import { auditLogs, deals, members, organizations, user } from '@/db/schema';
import { moveDeal } from '@/server/crm';
import { requireMember } from '@/server/tenant';

const ids: string[] = [];
let orgId = '';
let slug = '';
let ownerId = '';
let viewerId = '';
let outsiderId = '';
let viewerDealId = '';
let ownerDealId = '';

async function seedUser(email: string) {
  const id = crypto.randomUUID();
  ids.push(id);
  await db.insert(user).values({
    id,
    name: email,
    email,
    emailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return id;
}

beforeAll(async () => {
  ownerId = await seedUser(`owner-${crypto.randomUUID()}@test.local`);
  viewerId = await seedUser(`viewer-${crypto.randomUUID()}@test.local`);
  outsiderId = await seedUser(`outsider-${crypto.randomUUID()}@test.local`);
  orgId = crypto.randomUUID();
  slug = `org-${orgId.slice(0, 8)}`;

  await db.insert(organizations).values({ id: orgId, name: 'Test', slug });
  await db.insert(members).values([
    { id: crypto.randomUUID(), organizationId: orgId, userId: ownerId, role: 'owner' },
    { id: crypto.randomUUID(), organizationId: orgId, userId: viewerId, role: 'viewer' },
  ]);

  viewerDealId = crypto.randomUUID();
  ownerDealId = crypto.randomUUID();
  await db.insert(deals).values([
    {
      id: viewerDealId,
      organizationId: orgId,
      title: 'Чужая',
      value: 100,
      stage: 'lead',
      position: 0,
      ownerId,
    },
    {
      id: ownerDealId,
      organizationId: orgId,
      title: 'Своя',
      value: 200,
      stage: 'lead',
      position: 1,
      ownerId,
    },
  ]);
});

afterAll(async () => {
  if (orgId) await db.delete(organizations).where(eq(organizations.id, orgId));
  for (const id of ids) await db.delete(user).where(eq(user.id, id));
});

test('чужой пользователь не читает сделки организации', async () => {
  getSession.mockResolvedValue({
    user: { id: outsiderId, email: 'outsider@test.local', name: 'Outsider' },
  });

  await expect(requireMember(slug)).rejects.toThrow('NEXT_NOT_FOUND');
});

test('viewer не переносит сделку', async () => {
  getSession.mockResolvedValue({
    user: { id: viewerId, email: 'viewer@test.local', name: 'Viewer' },
  });

  const result = await moveDeal(slug, viewerDealId, 'negotiation', 0);

  expect(result.error).toBe('Недостаточно прав');
  const [deal] = await db.select().from(deals).where(eq(deals.id, viewerDealId));
  expect(deal?.stage).toBe('lead');
  const logs = await db.select().from(auditLogs).where(eq(auditLogs.entityId, viewerDealId));
  expect(logs).toHaveLength(0);
});

test('смена стадии пишет одну строку аудита', async () => {
  getSession.mockResolvedValue({
    user: { id: ownerId, email: 'owner@test.local', name: 'Owner' },
  });

  const result = await moveDeal(slug, ownerDealId, 'negotiation', 0);

  expect(result.error).toBeUndefined();
  const logs = await db.select().from(auditLogs).where(eq(auditLogs.entityId, ownerDealId));
  expect(logs).toHaveLength(1);
  expect(logs[0]?.action).toBe('deal.stage_changed');
  expect(logs[0]?.metadata).toEqual({ from: 'lead', to: 'negotiation' });
});
