// Los campos de la API son fechas locales, sin conversión a UTC.
export function fechaActualLocal(ahora = new Date()): string {
  return `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`;
}

export function validarFechaAdquisicion(fecha: string): string | null {
  if (!fecha) return 'Ingresa la fecha de adquisición.';
  return fecha.slice(0, 10) > fechaActualLocal()
    ? 'La fecha de adquisición no puede ser posterior al día actual.' : null;
}

export function validarFechasMantenimiento(fecha: string, entrega: string, adquisicion: string): string | null {
  if (!fecha) return 'Ingresa la fecha de solicitud.';
  const diaAdquisicion = adquisicion.slice(0, 10);
  if (fecha.slice(0, 10) < diaAdquisicion) return 'La fecha de solicitud no puede ser anterior a la fecha de adquisición del equipo.';
  if (entrega && entrega.slice(0, 10) < diaAdquisicion) return 'La fecha de entrega no puede ser anterior a la fecha de adquisición del equipo.';
  if (entrega && fecha > entrega) return 'La fecha de solicitud no puede ser posterior a la fecha de entrega.';
  return null;
}
