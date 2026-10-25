'use client';

import { Plus } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export function CreateDialog({
  label,
  title,
  invalid,
  onOpenChange,
  icon,
  children,
}: {
  label: string;
  title: string;
  invalid: boolean;
  onOpenChange?: (open: boolean) => void;
  icon?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(invalid);
  const [seenInvalid, setSeenInvalid] = useState(invalid);
  const settleTimer = useRef<number | null>(null);
  if (invalid !== seenInvalid) {
    setSeenInvalid(invalid);
    if (invalid) setOpen(true);
  }

  useEffect(() => {
    return () => {
      if (settleTimer.current) window.clearInterval(settleTimer.current);
    };
  }, []);

  function closeAfterSubmit(event: FormEvent<HTMLDivElement>) {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    if (settleTimer.current) window.clearInterval(settleTimer.current);
    let sawBusy = false;
    const started = performance.now();
    settleTimer.current = window.setInterval(() => {
      const busy = form.querySelector('button[type="submit"]')?.getAttribute('aria-busy') === 'true';
      if (busy) {
        sawBusy = true;
        return;
      }
      if (!sawBusy && performance.now() - started < 800) return;
      if (settleTimer.current) window.clearInterval(settleTimer.current);
      if (sawBusy) change(false);
    }, 40);
  }

  function change(next: boolean) {
    setOpen(next);
    onOpenChange?.(next);
  }

  return (
    <Dialog open={open} onOpenChange={change}>
      <DialogTrigger
        aria-label={label}
        className="inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full bg-background text-primary shadow-neo-sm active:shadow-neo-in"
      >
        {icon ?? <Plus className="size-4" aria-hidden />}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="pr-8">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div onSubmit={closeAfterSubmit}>{children}</div>
      </DialogContent>
    </Dialog>
  );
}
