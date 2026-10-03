import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'theme';

type ThemeListener = () => void;

const listeners = new Set<ThemeListener>();

export function isDarkTheme() {
  return document.documentElement.classList.contains('dark');
}

function syncThemeColor() {
  const color = isDarkTheme() ? '#121110' : '#f3f1ee';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color);
}

export function toggleTheme() {
  const next = !isDarkTheme();
  document.documentElement.classList.toggle('dark', next);
  try {
    localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
  } catch {
    // Storage can be blocked in private browsing.
  }
  syncThemeColor();
  listeners.forEach((listener) => listener());
}

export function subscribeTheme(listener: ThemeListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useDark() {
  return useSyncExternalStore(subscribeTheme, isDarkTheme, () => false);
}
