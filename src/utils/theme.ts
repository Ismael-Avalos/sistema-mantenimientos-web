export type ThemePreference = 'system' | 'light' | 'dark';
const storageKey = 'mantenimientos-theme';
let preference: ThemePreference = readPreference();
const listeners = new Set<() => void>();

function readPreference(): ThemePreference {
  try {
    const value = localStorage.getItem(storageKey);
    return value === 'light' || value === 'dark' ? value : 'system';
  } catch { return 'system'; }
}

export function resolveTheme(value: ThemePreference, systemDark: boolean): 'light' | 'dark' {
  return value === 'system' ? (systemDark ? 'dark' : 'light') : value;
}

function applyTheme() {
  const theme = resolveTheme(preference, window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.style.colorScheme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0a0a0a' : '#ffffff');
}

export function initializeTheme() {
  applyTheme();
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
  window.addEventListener('storage', (event) => {
    if (event.key !== storageKey && event.key !== null) return;
    preference = readPreference();
    applyTheme();
    listeners.forEach((listener) => listener());
  });
}

export const getThemePreference = () => preference;
export function subscribeTheme(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
export function setThemePreference(value: ThemePreference) {
  preference = value;
  try { localStorage.setItem(storageKey, value); } catch { /* El tema funciona también sin almacenamiento. */ }
  applyTheme();
  listeners.forEach((listener) => listener());
}
