import type { Equipo } from '../types/Equipo';
import type { Ubicacion } from '../types/Ubicacion';
import type { Categoria } from '../types/Categoria';
import type { MaintenanceResponse } from '../types/Maintenance';

export interface DatosDashboard {
  equipos: Equipo[];
  categorias: Categoria[];
  ubicaciones: Ubicacion[];
  mantenimientos: (MaintenanceResponse & { equipoId: string })[];
}
export interface FiltroDashboard { anio: number | 'todos'; ciclo: 0 | 1 | 2; edificio: string }
export const dineroDashboard = (valor: number) => new Intl.NumberFormat('es-SV', { style: 'currency', currency: 'USD' }).format(valor);
export const edificioEquipo = (equipo: Equipo) => equipo.ubicacion?.edificio?.trim() || 'Sin edificio';
const centavos = (m: MaintenanceResponse) => Math.round(Number(m.costo || 0) * 100);
export function periodoMantenimiento(fecha: string) {
  const partes = /^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/.exec(fecha);
  if (!partes) return null;
  const anio = Number(partes[1]), mes = Number(partes[2]), dia = Number(partes[3]);
  if (mes < 1 || mes > 12 || dia < 1 || dia > new Date(anio, mes, 0).getDate()) return null;
  return { anio, mes, ciclo: mes <= 6 ? 1 : 2 };
}
export function etiquetaPeriodo(f: FiltroDashboard) {
  return f.anio === 'todos' ? 'Todo el historial' : f.ciclo ? `Ciclo 0${f.ciclo}-${f.anio}` : `Año ${f.anio}`;
}
export function calcularDashboard(datos: DatosDashboard, filtro: FiltroDashboard) {
  const equipos = datos.equipos.filter(e => !filtro.edificio || edificioEquipo(e) === filtro.edificio);
  const equiposSeleccionados = new Set(equipos.map(e => e.id));
  const historial = datos.mantenimientos.filter(m => equiposSeleccionados.has(m.equipoId));
  const fechados = historial.map(m => ({ m, periodo: periodoMantenimiento(m.fecha) }));
  const seleccionados = fechados.filter(({ periodo }) => filtro.anio === 'todos' ||
    (periodo?.anio === filtro.anio && (!filtro.ciclo || periodo.ciclo === filtro.ciclo)));
  const total = seleccionados.reduce((s, { m }) => s + centavos(m), 0) / 100;
  const anios = [...new Set([new Date().getFullYear(), ...datos.mantenimientos.flatMap(m => {
    const p = periodoMantenimiento(m.fecha); return p ? [p.anio] : [];
  })])].sort((a, b) => b - a);
  const edificios = [...new Set([...datos.ubicaciones.flatMap(u => u.edificio?.trim() ? [u.edificio.trim()] : []), ...datos.equipos.map(edificioEquipo)])].sort();
  const categorias = [...new Set([...datos.categorias.map(c => c.nombre), ...equipos.map(e => e.categoria?.nombre || 'Sin categoría')])].sort();
  const inventario = categorias.map(categoria => ({ categoria, total:
    equipos.filter(e => (e.categoria?.nombre || 'Sin categoría') === categoria).length }));
  const estados = [
    { nombre: 'Activos', cantidad: equipos.filter(e => e.estado === 'ACTIVO').length, color: '#991B1B' },
    { nombre: 'En mantenimiento', cantidad: equipos.filter(e => e.estado === 'EN_MANTENIMIENTO').length, color: '#D97706' },
    { nombre: 'Dados de baja', cantidad: equipos.filter(e => ['DADO_DE_BAJA', 'BAJA'].includes(e.estado)).length, color: '#64748B' },
  ];
  const otros = equipos.length - estados.reduce((s, e) => s + e.cantidad, 0);
  if (otros) estados.push({ nombre: 'Otros estados', cantidad: otros, color: '#CBD5E1' });
  const resumenAnios = (filtro.anio === 'todos' ? anios : [filtro.anio]).map(anio => {
    const suma = (ciclo: number) => fechados.filter(v => v.periodo?.anio === anio && v.periodo.ciclo === ciclo).reduce((s, { m }) => s + centavos(m), 0) / 100;
    const ciclo1 = suma(1), ciclo2 = suma(2);
    return { anio, ciclo1, ciclo2, total: Math.round((ciclo1 + ciclo2) * 100) / 100 };
  });
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sept', 'Oct', 'Nov', 'Dic'];
  const serie = filtro.anio === 'todos'
    ? resumenAnios.slice().reverse().map(a => ({ etiqueta: String(a.anio), costo: a.total, cantidad: fechados.filter(v => v.periodo?.anio === a.anio).length }))
    : meses.flatMap((etiqueta, i) => {
      if (filtro.ciclo && (i < 6 ? 1 : 2) !== filtro.ciclo) return [];
      const registros = seleccionados.filter(v => v.periodo?.mes === i + 1);
      return [{ etiqueta, costo: registros.reduce((s, { m }) => s + centavos(m), 0) / 100, cantidad: registros.length }];
    });
  return { filtro: { ...filtro }, periodo: etiquetaPeriodo(filtro), anios, edificios, equipos: equipos.length, estados, inventario,
    cantidad: seleccionados.length, costo: total, promedio: seleccionados.length ? total / seleccionados.length : 0,
    historico: historial.reduce((s, m) => s + centavos(m), 0) / 100,
    sinFecha: fechados.filter(v => !v.periodo).length, resumenAnios, serie };
}
export type ResumenDashboard = ReturnType<typeof calcularDashboard>;
