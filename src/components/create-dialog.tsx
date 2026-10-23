'use client';

import { Plus } from 'lucide-react';
import { useState, type ReactNode } from 'react';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export function CreateDialog({
  label,
  title,
  invalid,
  children,
}: {
  label: string;
  title: string;
  invalid: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(invalid);
  const [seenInvalid, setSeenInvalid] = useState(invalid);
  if (invalid !== seenInvalid) {
    setSeenInvalid(invalid);
    if (invalid) setOpen(true);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        aria-label={label}
        className="inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full bg-background text-primary shadow-neo-sm active:shadow-neo-in"
      >
        <Plus className="size-4" aria-hidden />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="pr-8">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div onSubmit={() => setOpen(false)}>{children}</div>
      </DialogContent>
    </Dialog>
  );
}
