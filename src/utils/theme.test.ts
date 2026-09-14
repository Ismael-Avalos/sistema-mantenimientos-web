import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => { vi.unstubAllGlobals(); vi.resetModules(); });

describe('preferencia de tema', () => {
  it('respeta el tema explícito y usa la preferencia del sistema solo en automático', async () => {
    const { resolveTheme } = await import('./theme');
    expect(resolveTheme('dark', false)).toBe('dark');
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
  });

  it('restaura la preferencia guardada', async () => {
    vi.stubGlobal('localStorage', { getItem: () => 'dark' });
    const { getThemePreference } = await import('./theme');
    expect(getThemePreference()).toBe('dark');
  });

  it('funciona si el almacenamiento está bloqueado', async () => {
    vi.stubGlobal('localStorage', { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } });
    const toggle = vi.fn();
    vi.stubGlobal('document', { documentElement: { classList: { toggle }, style: {} }, querySelector: () => null });
    vi.stubGlobal('window', { matchMedia: () => ({ matches: false }) });
    const { getThemePreference, setThemePreference, subscribeTheme } = await import('./theme');
    expect(getThemePreference()).toBe('system');
    const listener = vi.fn();
    const unsubscribe = subscribeTheme(listener);
    setThemePreference('dark');
    expect(getThemePreference()).toBe('dark');
    expect(toggle).toHaveBeenCalledWith('dark', true);
    expect(listener).toHaveBeenCalledOnce();
    unsubscribe();
    setThemePreference('light');
    expect(listener).toHaveBeenCalledOnce();
  });
});
