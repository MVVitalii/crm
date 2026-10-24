'use client';

import { CreateDialog } from '@/components/create-dialog';
import { Field, FormError } from '@/components/page';
import { SubmitButton } from '@/components/ui/submit-button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { useI18n } from '@/components/i18n-provider';
import { createDeal } from '@/server/crm';

export type DealContact = { id: string; name: string };

export function NewDealDialog({
  orgSlug,
  contacts,
  invalid,
}: {
  orgSlug: string;
  contacts: DealContact[];
  invalid: boolean;
}) {
  const { dictionary } = useI18n();

  return (
    <CreateDialog label={dictionary.deals.newDeal} title={dictionary.deals.newDeal} invalid={invalid}>
      <form action={createDeal.bind(null, orgSlug)} className="flex flex-col gap-3">
        <Field label={dictionary.deals.titleField}>
          <Input name="title" required />
        </Field>
        <Field label={dictionary.deals.amount}>
          <Input name="rubles" type="number" min={0} step={1} required />
        </Field>
        <Field label={dictionary.deals.contact}>
          <NativeSelect name="contactId" defaultValue="">
            <option value="">{dictionary.deals.noContact}</option>
            {contacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.name}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <FormError>{invalid ? dictionary.deals.check : null}</FormError>
        <SubmitButton className="w-full">{dictionary.deals.create}</SubmitButton>
      </form>
    </CreateDialog>
  );
}
