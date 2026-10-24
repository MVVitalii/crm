'use client';

import { type ComponentProps } from 'react';
import { useFormStatus } from 'react-dom';

import { BusyIcon } from '@/components/busy-icon';
import { Button } from '@/components/ui/button';
import { cn } from 'cn';

export function SubmitButton({ className, children, disabled, ...props }: ComponentProps<typeof Button>) {
  const { pending } = useFormStatus();

  return (
    <Button
      aria-busy={pending || undefined}
      disabled={disabled || pending}
      className={cn(pending && 'disabled:opacity-100', className)}
      {...props}
      type="submit"
    >
      {pending ? <BusyIcon /> : null}
      {children}
    </Button>
  );
}
