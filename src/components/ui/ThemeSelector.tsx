import { useSyncExternalStore } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { getThemePreference, setThemePreference, subscribeTheme, type ThemePreference } from '../../utils/theme';

export function ThemeSelector() {
  const theme = useSyncExternalStore(subscribeTheme, getThemePreference);
  const Icon = theme === 'system' ? Monitor : theme === 'dark' ? Moon : Sun;
  return (
    <label className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-slate-700 dark:text-slate-200">
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="sr-only">Tema de apariencia</span>
      <select
        aria-label="Tema de apariencia"
        value={theme}
        onChange={(event) => setThemePreference(event.target.value as ThemePreference)}
        className="min-h-9 max-w-24 rounded-lg bg-white dark:bg-slate-900 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 dark:focus-visible:ring-red-400"
      >
        <option value="system">Sistema</option>
        <option value="light">Claro</option>
        <option value="dark">Oscuro</option>
      </select>
    </label>
  );
}
