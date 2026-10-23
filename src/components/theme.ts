export type ThemeChoice = 'light' | 'dark' | 'system';

const eventName = 'crm-theme';
const transitionMs = 450;
let transitionTimer = 0;

export const themeBootScript = `(function(){try{var m=document.cookie.match(/(?:^|; )theme=(light|dark|system)(?:;|$)/);var t=m?m[1]:'system';var dark=t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',dark);document.documentElement.dataset.theme=t;}catch(e){}})();`;

export function readThemeChoice(): ThemeChoice {
  const value = document.documentElement.dataset.theme;
  if (value === 'light' || value === 'dark' || value === 'system') return value;
  return 'system';
}

export function themeChoiceOnServer(): ThemeChoice {
  return 'system';
}

export function subscribeTheme(onChange: () => void) {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const onMedia = () => {
    if (readThemeChoice() === 'system') applyTheme('system');
    onChange();
  };
  media.addEventListener('change', onMedia);
  window.addEventListener(eventName, onChange);
  return () => {
    media.removeEventListener('change', onMedia);
    window.removeEventListener(eventName, onChange);
  };
}

export function applyTheme(theme: ThemeChoice) {
  const root = document.documentElement;
  const dark = theme === 'dark' || (theme !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  root.classList.add('theme-transition');
  void root.offsetWidth;
  root.classList.toggle('dark', dark);
  root.dataset.theme = theme;
  document.cookie = `theme=${theme}; path=/; max-age=31536000; samesite=lax`;
  window.dispatchEvent(new Event(eventName));
  window.clearTimeout(transitionTimer);
  transitionTimer = window.setTimeout(() => root.classList.remove('theme-transition'), transitionMs);
}
