import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const STORAGE_KEY = 'cadence:theme';
const VALID = ['system', 'light', 'dark'];

const ThemeContext = createContext(null);

function resolveMode(pref) {
  if (pref === 'light' || pref === 'dark') return pref;
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }) {
  const [pref, setPref] = useState(() => {
    if (typeof window === 'undefined') return 'system';
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return VALID.includes(stored) ? stored : 'system';
  });
  const [mode, setMode] = useState(() => resolveMode(pref));

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  useEffect(() => {
    setMode(resolveMode(pref));
    if (pref === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e) => setMode(e.matches ? 'dark' : 'light');
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [pref]);

  const setPreference = useCallback((next) => {
    if (!VALID.includes(next)) return;
    setPref(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const toggle = useCallback(() => {
    setPreference(mode === 'dark' ? 'light' : 'dark');
  }, [mode, setPreference]);

  return (
    <ThemeContext.Provider value={{ pref, mode, setPreference, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
