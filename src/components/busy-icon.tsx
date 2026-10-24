import { LoaderCircle } from 'lucide-react';

import { cn } from 'cn';

export function BusyIcon({ className }: { className?: string }) {
  return <LoaderCircle className={cn('size-4 animate-spin', className)} aria-hidden />;
}
