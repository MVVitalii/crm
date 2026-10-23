'use server';

import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { db } from '@/db';
import { members, organizations } from '@/db/schema';
import { auth } from '@/lib/auth';

const schema = z.object({
  name: z.string().trim().min(2).max(80),
});

function slugify(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function createOrganization(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/login');

  const parsed = schema.safeParse({ name: formData.get('name') });
  if (!parsed.success) redirect('/?error=name');

  const base = slugify(parsed.data.name);
  const id = crypto.randomUUID();
  let slug = base || `org-${id.slice(0, 8)}`;

  await db.transaction(async (tx) => {
    const taken = await tx.select({ id: organizations.id }).from(organizations).where(eq(organizations.slug, slug)).limit(1);

    if (taken.length > 0) slug = `${slug}-${id.slice(0, 8)}`;

    await tx.insert(organizations).values({
      id,
      name: parsed.data.name,
      slug,
    });
    await tx.insert(members).values({
      id: crypto.randomUUID(),
      organizationId: id,
      userId: session.user.id,
      role: 'owner',
    });
  });

  redirect('/');
}
