'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const PRESS_MS = 240;

export function PressFeedback() {
  const pathname = usePathname();

  useEffect(() => {
    delete document.documentElement.dataset.navigating;
  }, [pathname]);

  useEffect(() => {
    const timers = new WeakMap<HTMLElement, number>();

    function press(event: PointerEvent) {
      if (event.button !== 0) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const control = target.closest('button, a[href], [role="button"]');
      if (!(control instanceof HTMLElement)) return;
      if (control.matches(':disabled, [aria-disabled="true"], [data-press="off"]')) return;

      const previous = timers.get(control);
      if (previous) window.clearTimeout(previous);
      control.dataset.pressed = '';
      timers.set(
        control,
        window.setTimeout(() => {
          delete control.dataset.pressed;
        }, PRESS_MS),
      );
    }

    function navigate(event: MouseEvent) {
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest('a[href]');
      if (!(link instanceof HTMLAnchorElement)) return;
      if (link.target && link.target !== '_self') return;

      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return;

      document.documentElement.dataset.navigating = '';
      window.setTimeout(() => {
        if (location.pathname === url.pathname && location.search === url.search) return;
        delete document.documentElement.dataset.navigating;
      }, 8000);
    }

    document.addEventListener('pointerdown', press);
    document.addEventListener('click', navigate, true);
    return () => {
      document.removeEventListener('pointerdown', press);
      document.removeEventListener('click', navigate, true);
    };
  }, []);

  return null;
}
