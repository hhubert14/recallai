import { useState, useEffect } from 'react';
import { browser } from 'wxt/browser';

export type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load saved preference from browser.storage
    browser.storage.local.get(['theme']).then((result) => {
      if (result.theme) {
        setThemeState(result.theme as Theme);
      }
      setMounted(true);
    });
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const applyTheme = () => {
      const isDark =
        theme === 'dark' ||
        (theme === 'system' &&
          window.matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.classList.toggle('dark', isDark);
    };

    applyTheme();

    // Listen for system changes if using system preference
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', applyTheme);
      return () => mediaQuery.removeEventListener('change', applyTheme);
    }
  }, [theme, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    browser.storage.local.set({ theme: newTheme });
  };

  return { theme, setTheme, mounted };
}
