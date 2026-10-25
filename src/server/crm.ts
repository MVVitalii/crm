'use server';

import { and, eq, max, asc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { notFound, redirect } from 'next/navigation';
import { z } from 'zod';

import { db } from '@/db';
import { auditLogs, contacts, deals, notes, tasks } from '@/db/schema';
import { requireMember, requireRole } from '@/server/tenant';

async function managerContext(slug: string) {
  const context = await requireMember(slug);
  requireRole(context.member, 'manager');
  return context;
}

async function orgDeal(organizationId: string, dealId: string) {
  const rows = await db
    .select()
    .from(deals)
    .where(and(eq(deals.id, dealId), eq(deals.organizationId, organizationId)))
    .limit(1);
  const deal = rows[0];
  if (!deal) notFound();
  return deal;
}

const titleSchema = z.string().trim().min(1).max(160);
const rublesSchema = z.coerce.number().int().nonnegative().max(100_000_000);

export async function createContact(slug: string, formData: FormData) {
  const { organization } = await managerContext(slug);
  const name = z.string().trim().min(1).max(120).safeParse(formData.get('name'));
  if (!name.success) redirect(`/${slug}/contacts?error=name`);

  const emailRaw = String(formData.get('email') ?? '').trim();
  const email = emailRaw.length === 0 ? null : emailRaw;
  if (email && !z.string().email().safeParse(email).success) {
    redirect(`/${slug}/contacts?error=email`);
  }

  const phoneRaw = String(formData.get('phone') ?? '').trim();

  await db.insert(contacts).values({
    id: crypto.randomUUID(),
    organizationId: organization.id,
    name: name.data,
    email,
    phone: phoneRaw.length === 0 ? null : phoneRaw,
  });

  revalidatePath(`/${slug}/contacts`);
}

export async function updateContact(slug: string, contactId: string, formData: FormData) {
  const { organization } = await managerContext(slug);
  const rows = await db
    .select({ id: contacts.id })
    .from(contacts)
    .where(and(eq(contacts.id, contactId), eq(contacts.organizationId, organization.id)))
    .limit(1);
  if (!rows[0]) notFound();

  const back = `/${slug}/contacts?contact=${contactId}`;
  const name = z.string().trim().min(1).max(120).safeParse(formData.get('name'));
  if (!name.success) redirect(`${back}&error=name`);

  const emailRaw = String(formData.get('email') ?? '').trim();
  const email = emailRaw.length === 0 ? null : emailRaw;
  if (email && !z.string().email().safeParse(email).success) redirect(`${back}&error=email`);

  const phoneRaw = String(formData.get('phone') ?? '').trim();

  await db
    .update(contacts)
    .set({ name: name.data, email, phone: phoneRaw.length === 0 ? null : phoneRaw })
    .where(eq(contacts.id, contactId));

  revalidatePath(`/${slug}/contacts`);
  revalidatePath(`/${slug}/deals`);
}

export async function createDeal(slug: string, formData: FormData) {
  const { organization, session } = await managerContext(slug);
  const title = titleSchema.safeParse(formData.get('title'));
  const rubles = rublesSchema.safeParse(formData.get('rubles'));
  if (!title.success || !rubles.success) redirect(`/${slug}/deals?error=deal`);

  const nameRaw = String(formData.get('contactName') ?? '').trim();
  let contactId: string | null = null;
  let newContact: {
    id: string;
    organizationId: string;
    name: string;
    email: string | null;
    phone: string | null;
  } | null = null;

  if (nameRaw.length > 0) {
    const name = z.string().trim().min(1).max(120).safeParse(nameRaw);
    if (!name.success) redirect(`/${slug}/deals?error=name`);
    const emailRaw = String(formData.get('contactEmail') ?? '').trim();
    const email = emailRaw.length === 0 ? null : emailRaw;
    if (email && !z.string().email().safeParse(email).success) redirect(`/${slug}/deals?error=email`);
    const phoneRaw = String(formData.get('contactPhone') ?? '').trim();
    newContact = {
      id: crypto.randomUUID(),
      organizationId: organization.id,
      name: name.data,
      email,
      phone: phoneRaw.length === 0 ? null : phoneRaw,
    };
    contactId = newContact.id;
  } else {
    const contactRaw = String(formData.get('contactId') ?? '');
    contactId = contactRaw.length === 0 ? null : contactRaw;
    if (contactId) {
      const found = await db
        .select({ id: contacts.id })
        .from(contacts)
        .where(and(eq(contacts.id, contactId), eq(contacts.organizationId, organization.id)))
        .limit(1);
      if (!found[0]) redirect(`/${slug}/deals?error=contact`);
    }
  }

  const id = crypto.randomUUID();

  await db.transaction(async (tx) => {
    if (newContact) await tx.insert(contacts).values(newContact);

    const [last] = await tx
      .select({ position: max(deals.position) })
      .from(deals)
      .where(and(eq(deals.organizationId, organization.id), eq(deals.stage, 'lead')));

    await tx.insert(deals).values({
      id,
      organizationId: organization.id,
      title: title.data,
      value: rubles.data * 100,
      contactId,
      stage: 'lead',
      position: Number(last?.position ?? -1) + 1,
      ownerId: session.user.id,
    });
  });

  revalidatePath(`/${slug}/contacts`);
  revalidatePath(`/${slug}/deals`);
  redirect(`/${slug}/deals/${id}`);
}

export async function updateDeal(slug: string, dealId: string, formData: FormData) {
  const { organization } = await managerContext(slug);
  const deal = await orgDeal(organization.id, dealId);
  const title = titleSchema.safeParse(formData.get('title'));
  const rubles = rublesSchema.safeParse(formData.get('rubles'));
  if (!title.success || !rubles.success) redirect(`/${slug}/deals/${dealId}?error=deal`);

  const contactRaw = String(formData.get('contactId') ?? '');
  const contactId = contactRaw.length === 0 ? null : contactRaw;
  if (contactId) {
    const found = await db
      .select({ id: contacts.id })
      .from(contacts)
      .where(and(eq(contacts.id, contactId), eq(contacts.organizationId, organization.id)))
      .limit(1);
    if (!found[0]) redirect(`/${slug}/deals/${dealId}?error=contact`);
  }

  await db
    .update(deals)
    .set({ title: title.data, value: rubles.data * 100, contactId })
    .where(eq(deals.id, deal.id));

  revalidatePath(`/${slug}/deals/${dealId}`);
}

export async function createNote(slug: string, dealId: string, formData: FormData) {
  const { organization, session } = await managerContext(slug);
  const deal = await orgDeal(organization.id, dealId);
  const body = z.string().trim().min(1).max(2000).safeParse(formData.get('body'));
  if (!body.success) redirect(`/${slug}/deals/${dealId}?error=note`);

  await db.insert(notes).values({
    id: crypto.randomUUID(),
    organizationId: organization.id,
    dealId: deal.id,
    authorId: session.user.id,
    body: body.data,
  });

  revalidatePath(`/${slug}/deals/${dealId}`);
}

export async function createTask(slug: string, dealId: string, formData: FormData) {
  const { organization } = await managerContext(slug);
  const deal = await orgDeal(organization.id, dealId);
  const title = titleSchema.safeParse(formData.get('title'));
  if (!title.success) redirect(`/${slug}/deals/${dealId}?error=task`);

  await db.insert(tasks).values({
    id: crypto.randomUUID(),
    organizationId: organization.id,
    dealId: deal.id,
    title: title.data,
  });

  revalidatePath(`/${slug}/deals/${dealId}`);
}

export async function toggleTask(slug: string, dealId: string, taskId: string) {
  const { organization } = await managerContext(slug);
  await orgDeal(organization.id, dealId);

  const rows = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.dealId, dealId), eq(tasks.organizationId, organization.id)))
    .limit(1);
  const task = rows[0];
  if (!task) notFound();

  await db.update(tasks).set({ done: !task.done }).where(eq(tasks.id, task.id));
  revalidatePath(`/${slug}/deals/${dealId}`);
}

const stageSchema = z.enum(['lead', 'negotiation', 'won']);

export async function moveDeal(slug: string, dealId: string, stage: 'lead' | 'negotiation' | 'won', index: number) {
  try {
    const { organization, session } = await managerContext(slug);
    const nextStage = stageSchema.safeParse(stage);
    const nextIndex = z.number().int().nonnegative().safeParse(index);
    if (!nextStage.success || !nextIndex.success) return { error: 'Некорректный перенос' };

    await db.transaction(async (tx) => {
      const rows = await tx
        .select()
        .from(deals)
        .where(and(eq(deals.id, dealId), eq(deals.organizationId, organization.id)))
        .limit(1);
      const deal = rows[0];
      if (!deal) throw new Error('Сделка не найдена');

      const fromStage = deal.stage;
      const source = await tx
        .select()
        .from(deals)
        .where(and(eq(deals.organizationId, organization.id), eq(deals.stage, fromStage)))
        .orderBy(asc(deals.position));
      const target =
        fromStage === nextStage.data
          ? source
          : await tx
              .select()
              .from(deals)
              .where(and(eq(deals.organizationId, organization.id), eq(deals.stage, nextStage.data)))
              .orderBy(asc(deals.position));

      const sourceWithout = source.filter((item) => item.id !== deal.id);
      const targetWithout = fromStage === nextStage.data ? sourceWithout : target;
      const insertAt = Math.min(nextIndex.data, targetWithout.length);
      const nextTarget = [...targetWithout.slice(0, insertAt), { ...deal, stage: nextStage.data }, ...targetWithout.slice(insertAt)];
      const affected = fromStage === nextStage.data ? source : [...source, ...target];

      for (const item of affected) {
        await tx
          .update(deals)
          .set({ position: item.position + 100000 })
          .where(and(eq(deals.id, item.id), eq(deals.organizationId, organization.id)));
      }

      for (const [position, item] of sourceWithout.entries()) {
        if (fromStage === nextStage.data) continue;
        await tx
          .update(deals)
          .set({ position })
          .where(and(eq(deals.id, item.id), eq(deals.organizationId, organization.id)));
      }

      for (const [position, item] of nextTarget.entries()) {
        await tx
          .update(deals)
          .set({ stage: item.id === deal.id ? nextStage.data : item.stage, position })
          .where(and(eq(deals.id, item.id), eq(deals.organizationId, organization.id)));
      }

      if (fromStage !== nextStage.data) {
        await tx.insert(auditLogs).values({
          id: crypto.randomUUID(),
          organizationId: organization.id,
          actorId: session.user.id,
          action: 'deal.stage_changed',
          entityType: 'deal',
          entityId: deal.id,
          metadata: { from: fromStage, to: nextStage.data },
        });
      }
    });

    revalidatePath(`/${slug}/deals`);
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Не удалось перенести' };
  }
}
