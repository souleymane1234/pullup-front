import { create } from 'zustand';

const THEME_KEY = 'pullup_theme';

/** @param {'light'|'dark'} theme */
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* stockage indisponible */
  }
}

export const useUiStore = create((set, get) => ({
  theme: /** @type {'light'|'dark'} */ ('light'),
  setTheme: (theme) => {
    applyTheme(theme);
    set({ theme });
  },
  toggleTheme: () => {
    const current = document.documentElement.dataset.theme;
    const isDark = current ? current === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    get().setTheme(isDark ? 'light' : 'dark');
  },
}));

export function initTheme() {
  let stored = null;
  try {
    stored = localStorage.getItem(THEME_KEY);
  } catch {
    stored = null;
  }
  if (stored === 'light' || stored === 'dark') {
    applyTheme(stored);
    useUiStore.setState({ theme: stored });
    return;
  }
  const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  useUiStore.setState({ theme: dark ? 'dark' : 'light' });
}
