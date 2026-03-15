'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api';

type Theme = 'dark' | 'light' | 'system';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  setTheme: () => {},
});

function resolveTheme(theme: Theme): 'dark' | 'light' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
}

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', resolveTheme(theme));
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');

  // On mount, read from stored user preference
  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const user = JSON.parse(stored);
        const t = (user?.theme as Theme) || 'dark';
        setThemeState(t);
        applyTheme(t);
      }
    } catch {
      applyTheme('dark');
    }
  }, []);

  // Listen for system theme changes when theme is 'system'
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = useCallback(async (newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);

    // Persist to localStorage
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const user = JSON.parse(stored);
        user.theme = newTheme;
        localStorage.setItem('user', JSON.stringify(user));
      }
    } catch {}

    // Persist to server
    apiFetch('/api/auth/preferences', {
      method: 'PATCH',
      body: JSON.stringify({ theme: newTheme }),
    }).catch(() => {});
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
