'use client';

export type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = 'diet-daily-theme';

export function getStoredTheme(): ThemeMode | null {
  if (typeof window === 'undefined') return null;
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === 'dark' || stored === 'light' ? stored : null;
}

export function getSystemTheme(): ThemeMode {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function getInitialTheme(): ThemeMode {
  return 'light';
}

export function applyTheme(theme: ThemeMode) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export function setTheme(theme: ThemeMode) {
  if (typeof window === 'undefined') return;
  applyTheme(theme);
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
}
