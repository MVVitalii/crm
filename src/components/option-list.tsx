'use client';

import { cn } from 'cn';
import { ChevronDown } from 'lucide-react';
import { useEffect, useId, useRef, useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from 'react';

export type ListOption = { id: string; name: string };

export function OptionList({
  name,
  label,
  ariaLabel,
  options,
  value,
  defaultValue = '',
  onValueChange,
  className,
}: {
  name?: string;
  label?: string;
  ariaLabel?: string;
  options: ListOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  className?: string;
}) {
  const labelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const selected = value ?? uncontrolled;
  const current = options.find((option) => option.id === selected)?.name ?? '';

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (rootRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  function commit(id: string) {
    if (value === undefined) setUncontrolled(id);
    onValueChange?.(id);
    setOpen(false);
  }

  function press(event: ReactPointerEvent<HTMLButtonElement>, run: () => void) {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.dataset.pointer = '1';
    run();
  }

  function keyClick(event: ReactMouseEvent<HTMLButtonElement>, run: () => void) {
    if (event.currentTarget.dataset.pointer === '1') {
      delete event.currentTarget.dataset.pointer;
      return;
    }
    run();
  }

  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5 text-sm font-medium', className)}>
      {label ? <span id={labelId}>{label}</span> : null}
      <div className={cn('relative', open && 'z-30')} ref={rootRef}>
        {name ? <input type="hidden" name={name} value={selected} /> : null}
        <button
          type="button"
          data-press="off"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabel || !label ? undefined : labelId}
          aria-expanded={open}
          aria-haspopup="listbox"
          className="flex h-8 w-full items-center justify-between gap-2 rounded-xl bg-background px-2.5 text-left text-sm font-normal shadow-neo-in"
          onPointerDown={(event) => press(event, () => setOpen((next) => !next))}
          onClick={(event) => keyClick(event, () => setOpen((next) => !next))}
        >
          <span className="truncate">{current}</span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        </button>
        {open ? (
          <div
            role="listbox"
            aria-label={ariaLabel}
            aria-labelledby={ariaLabel || !label ? undefined : labelId}
            className="absolute top-[calc(100%+4px)] left-0 z-20 max-h-48 w-full overflow-y-auto rounded-xl bg-background p-1 shadow-neo"
          >
            {options.map((option) => (
              <button
                key={option.id || 'none'}
                type="button"
                role="option"
                data-press="off"
                aria-selected={selected === option.id}
                className={
                  selected === option.id
                    ? 'w-full rounded-lg px-2.5 py-1.5 text-left text-sm font-normal text-primary'
                    : 'w-full rounded-lg px-2.5 py-1.5 text-left text-sm font-normal text-muted-foreground hover:text-foreground'
                }
                onClick={() => commit(option.id)}
              >
                {option.name}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
