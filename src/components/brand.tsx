import Link from 'next/link';

export function Brand({ href = '/' }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 font-heading text-lg leading-none">
      <span className="grid size-7 place-items-center rounded-full bg-background text-xs font-medium text-primary shadow-neo-sm" aria-hidden>
        C
      </span>
      CRM
    </Link>
  );
}
