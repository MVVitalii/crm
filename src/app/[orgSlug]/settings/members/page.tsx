import { and, eq, gt, isNull } from 'drizzle-orm';

import { CreateDialog } from '@/components/create-dialog';
import { Field, FormError, Page, PageHeader, Panel } from '@/components/page';
import { SubmitButton } from '@/components/ui/submit-button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { db } from '@/db';
import { invitations, members, user } from '@/db/schema';
import { fill } from '@/i18n/format';
import { getCopy } from '@/i18n/locale';
import { changeMemberRole, inviteMember, removeMember } from '@/server/members';
import { requireMember } from '@/server/tenant';

export const instant = false;

export default async function MembersPage({ params, searchParams }: PageProps<'/[orgSlug]/settings/members'>) {
  const { orgSlug } = await params;
  const { error } = await searchParams;
  const { organization, member } = await requireMember(orgSlug);
  const { dictionary } = await getCopy();
  const isOwner = member.role === 'owner';

  const people = await db
    .select({ id: members.id, role: members.role, email: user.email, name: user.name })
    .from(members)
    .innerJoin(user, eq(members.userId, user.id))
    .where(eq(members.organizationId, organization.id));

  const pending = await db
    .select()
    .from(invitations)
    .where(and(eq(invitations.organizationId, organization.id), isNull(invitations.acceptedAt), gt(invitations.expiresAt, new Date())));

  return (
    <Page>
      <PageHeader
        title={dictionary.members.title}
        description={dictionary.members.hint}
        action={
          isOwner ? (
            <CreateDialog label={dictionary.members.invite} title={dictionary.members.invite} invalid={error === 'invite'}>
              <form action={inviteMember.bind(null, orgSlug)} className="flex flex-col gap-3">
                <Field label={dictionary.members.email}>
                  <Input name="email" type="email" required />
                </Field>
                <Field label={dictionary.members.role}>
                  <NativeSelect name="role" defaultValue="viewer">
                    <option value="viewer">{dictionary.roles.viewer}</option>
                    <option value="manager">{dictionary.roles.manager}</option>
                    <option value="owner">{dictionary.roles.owner}</option>
                  </NativeSelect>
                </Field>
                <FormError>{error === 'invite' ? dictionary.members.inviteError : null}</FormError>
                <SubmitButton type="submit" className="w-full">
                  {dictionary.members.send}
                </SubmitButton>
              </form>
            </CreateDialog>
          ) : null
        }
      />
      <FormError>{error === 'last-owner' ? dictionary.members.lastOwner : null}</FormError>
      <ul className="flex flex-col gap-3">
        {people.map((person) => (
          <li key={person.id} className="flex flex-col gap-3 rounded-2xl bg-background p-4 shadow-neo-sm">
            <div className="min-w-0">
              <p className="font-medium break-words">{person.name}</p>
              <p className="text-sm break-words text-muted-foreground">
                {person.email} · {dictionary.roles[person.role]}
              </p>
            </div>
            {isOwner ? (
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                <form action={changeMemberRole.bind(null, orgSlug, person.id)} className="flex flex-col gap-2 sm:flex-row">
                  <NativeSelect
                    name="role"
                    defaultValue={person.role}
                    aria-label={fill(dictionary.members.roleOf, { name: person.name })}
                    className="w-full sm:w-40"
                  >
                    <option value="owner">{dictionary.roles.owner}</option>
                    <option value="manager">{dictionary.roles.manager}</option>
                    <option value="viewer">{dictionary.roles.viewer}</option>
                  </NativeSelect>
                  <SubmitButton type="submit" variant="outline" className="w-full sm:w-auto">
                    {dictionary.members.save}
                  </SubmitButton>
                </form>
                <form action={removeMember.bind(null, orgSlug, person.id)} className="sm:w-auto">
                  <SubmitButton type="submit" variant="outline" className="w-full sm:w-auto">
                    {dictionary.members.remove}
                  </SubmitButton>
                </form>
              </div>
            ) : null}
          </li>
        ))}
      </ul>

      {pending.length > 0 ? (
        <Panel>
          <h2 className="font-heading text-lg font-medium">{dictionary.members.pending}</h2>
          <ul className="flex flex-col gap-2">
            {pending.map((invite) => (
              <li key={invite.id} className="text-sm break-words">
                {invite.email} · {dictionary.roles[invite.role]}
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}

    </Page>
  );
}
