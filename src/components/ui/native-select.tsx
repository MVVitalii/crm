import type { ComponentProps } from 'react';
import { cn } from 'cn';

export function NativeSelect({ className, ...props }: ComponentProps<'select'>) {
  return (
    <select
      className={cn(
        'h-8 w-full rounded-xl border border-transparent bg-background px-2.5 text-sm shadow-neo-in outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
        className,
      )}
      {...props}
    />
  );
}
