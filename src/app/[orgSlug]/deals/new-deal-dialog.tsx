'use client';

import { useState } from 'react';

import { CreateDialog } from '@/components/create-dialog';
import { OptionList } from '@/components/option-list';
import { Field, FormError } from '@/components/page';
import { SubmitButton } from '@/components/ui/submit-button';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/components/i18n-provider';
import { createDeal } from '@/server/crm';

export type DealContact = { id: string; name: string };

const newContact = 'new';

export function NewDealDialog({
  orgSlug,
  contacts,
  invalid,
  contactError,
}: {
  orgSlug: string;
  contacts: DealContact[];
  invalid: boolean;
  contactError: 'name' | 'email' | null;
}) {
  const { dictionary } = useI18n();
  const [value, setValue] = useState(contactError ? newContact : '');
  const [listKey, setListKey] = useState(0);
  const options = [
    { id: '', name: dictionary.deals.noContact },
    ...contacts,
    { id: newContact, name: dictionary.contacts.newContact },
  ];

  function resetContact() {
    setValue(contactError ? newContact : '');
    setListKey((key) => key + 1);
  }

  return (
    <CreateDialog
      label={dictionary.deals.newDeal}
      title={dictionary.deals.newDeal}
      invalid={invalid}
      onOpenChange={(open) => {
        if (!open) resetContact();
      }}
    >
      <form action={createDeal.bind(null, orgSlug)} className="flex flex-col gap-3">
        <Field label={dictionary.deals.titleField}>
          <Input name="title" required />
        </Field>
        <Field label={dictionary.deals.amount}>
          <Input name="rubles" type="number" min={0} step={1} required />
        </Field>
        <div className="flex flex-col gap-3">
          {value && value !== newContact ? <input type="hidden" name="contactId" value={value} /> : null}
          <OptionList
            key={listKey}
            label={dictionary.deals.contact}
            options={options}
            value={value}
            onValueChange={setValue}
          />
          {value === newContact ? (
            <>
              <Field label={dictionary.contacts.name}>
                <Input name="contactName" required />
              </Field>
              <Field label={dictionary.contacts.email}>
                <Input name="contactEmail" type="email" />
              </Field>
              <Field label={dictionary.contacts.phone}>
                <Input name="contactPhone" />
              </Field>
            </>
          ) : null}
        </div>
        <FormError>
          {contactError === 'name'
            ? dictionary.contacts.nameError
            : contactError === 'email'
              ? dictionary.contacts.emailError
              : invalid
                ? dictionary.deals.check
                : null}
        </FormError>
        <SubmitButton className="w-full">{dictionary.deals.create}</SubmitButton>
      </form>
    </CreateDialog>
  );
}
