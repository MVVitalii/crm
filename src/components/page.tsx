import type { ReactNode } from 'react';

export function Page({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? 'flex w-full flex-col gap-6' : 'mx-auto flex w-full max-w-3xl flex-col gap-6'}>
      {children}
    </div>
  );
}

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <header className="flex flex-col gap-2">
      <span className="h-1.5 w-12 rounded-full bg-background shadow-neo-sm" aria-hidden />
      <div className="flex items-center justify-between gap-3">
        <h1 className="min-w-0 font-heading text-3xl leading-tight font-medium break-words sm:text-4xl">{title}</h1>
        {action}
      </div>
      {description ? <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
    </header>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium">
      {label}
      {children}
    </label>
  );
}

export function FormError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <p className="text-sm text-destructive">{children}</p>;
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-2xl bg-background px-4 py-10 text-center text-sm text-muted-foreground shadow-neo-in">
      {children}
    </p>
  );
}

export function Panel({ children }: { children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl bg-background p-4 shadow-neo sm:p-5">
      {children}
    </section>
  );
}
