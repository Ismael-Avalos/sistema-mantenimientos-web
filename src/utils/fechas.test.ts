import { afterEach, describe, expect, it, vi } from 'vitest';
import { fechaActualLocal, validarFechaAdquisicion, validarFechasMantenimiento } from './fechas';

afterEach(() => vi.useRealTimers());

describe('validaciones de fechas', () => {
  it('permite adquirir hoy o antes y rechaza mañana', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 14, 23, 30));
    expect(fechaActualLocal()).toBe('2026-09-14');
    expect(validarFechaAdquisicion('2026-09-14')).toBeNull();
    expect(validarFechaAdquisicion('2026-09-13')).toBeNull();
    expect(validarFechaAdquisicion('2026-09-15')).toBeTruthy();
  });

  it('permite solicitud el día de adquisición y entrega opcional o simultánea', () => {
    expect(validarFechasMantenimiento('2026-09-14T00:00', '', '2026-09-14')).toBeNull();
    expect(validarFechasMantenimiento('2026-09-14T10:00', '2026-09-14T10:00', '2026-09-14')).toBeNull();
  });

  it('rechaza solicitud o entrega anteriores a la adquisición', () => {
    expect(validarFechasMantenimiento('2026-09-13T23:59', '', '2026-09-14')).toContain('solicitud');
    expect(validarFechasMantenimiento('2026-09-14T00:00', '2026-09-13T23:59', '2026-09-14')).toContain('entrega');
  });

  it('compara también la hora de solicitud y entrega', () => {
    expect(validarFechasMantenimiento('2026-09-14T10:01', '2026-09-14T10:00', '2026-09-01')).toBeTruthy();
    expect(validarFechasMantenimiento('2026-09-14T10:00', '2026-09-14T10:01', '2026-09-01')).toBeNull();
  });
});
