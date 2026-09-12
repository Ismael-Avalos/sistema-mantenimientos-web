import { describe, expect, it } from 'vitest';
import { calcularDashboard, periodoMantenimiento } from './dashboard';
import type { DatosDashboard, FiltroDashboard } from './dashboard';
import type { Equipo } from '../types/Equipo';
import type { MaintenanceResponse } from '../types/Maintenance';
import { readFileSync } from 'node:fs';
import { dibujarPdfDashboard } from './dashboard-pdf';
const equipo = (id: string, edificio: string, categoria: string, estado: string): Equipo => ({ id, qrUuid: id, codigoInventario: id, nombre: id, marca: '', modelo: '', serialEquipo: '', estado, fechaAdquisicion: '', createdAt: '', ubicacion: { id, nombre: `Aula ${id}`, edificio }, categoria: { id: categoria, nombre: categoria } });
const mantenimiento = (id: string, equipoId: string, fecha: string, costo: number): MaintenanceResponse & { equipoId: string } => ({ id, equipoId, numeroReporte: Number(id), fecha, costo, tipo: 'PREVENTIVO', sede: 'Sonsonate', unidad: '', solicitanteNombre: '', solicitanteCorreo: '', responsableNombre: '', descripcionFalla: '', actividadesRealizadas: '' });
const datos: DatosDashboard = {
  equipos: [equipo('a', 'Masferrer', 'Proyectores', 'ACTIVO'), equipo('b', 'Salarrué', 'Laptops', 'EN_MANTENIMIENTO'), equipo('c', 'Masferrer', 'Laptops', 'DADO_DE_BAJA')],
  categorias: [{ id: 'Monitores', nombre: 'Monitores' }],
  ubicaciones: [{ id: 'nueva', nombre: 'Biblioteca', edificio: 'Nuevo edificio' }],
  mantenimientos: [mantenimiento('1', 'a', '2025-06-30T23:59:00', 10.1), mantenimiento('2', 'a', '2025-07-01T00:00:00', 20.2), mantenimiento('3', 'b', '2025-01-01', 50), mantenimiento('4', 'c', '2024-12-31', 100)],
};
const filtro: FiltroDashboard = { anio: 2025, ciclo: 1, edificio: 'Masferrer' };
describe('dashboard', () => {
  it('separa junio y julio en ciclos sin desplazar la fecha por zona horaria', () => {
    expect(periodoMantenimiento('2025-06-30T23:59:00')?.ciclo).toBe(1);
    expect(periodoMantenimiento('2025-07-01T00:00:00')?.ciclo).toBe(2);
    expect(periodoMantenimiento('2025-02-30')).toBeNull();
    expect(periodoMantenimiento('')).toBeNull();
  });
  it('filtra costos por ciclo y edificio manteniendo inventario e histórico independientes del período', () => {
    const r = calcularDashboard(datos, filtro);
    expect(r.periodo).toBe('Ciclo 01-2025');
    expect(r.equipos).toBe(2);
    expect(r.estados.map(e => e.cantidad)).toEqual([1, 0, 1]);
    expect(r.costo).toBe(10.1);
    expect(r.promedio).toBe(10.1);
    expect(r.historico).toBe(130.3);
    expect(r.serie).toHaveLength(6);
    expect(r.resumenAnios).toEqual([{ anio: 2025, ciclo1: 10.1, ciclo2: 20.2, total: 30.3 }]);
    expect(calcularDashboard(datos, { ...filtro, ciclo: 2 }).costo).toBe(20.2);
    expect(calcularDashboard(datos, { ...filtro, ciclo: 0 }).cantidad).toBe(2);
  });
  it('agrupa aulas por edificio y suma categorías sin columnas de ubicación', () => {
    const r = calcularDashboard({ ...datos, equipos: [...datos.equipos, { ...datos.equipos[0], id: 'd', ubicacion: null }] }, { ...filtro, edificio: '' });
    expect(r.edificios).toEqual(['Masferrer', 'Nuevo edificio', 'Salarrué', 'Sin edificio']);
    expect(r.edificios).not.toContain('Aula a');
    expect(r.inventario.find(c => c.categoria === 'Proyectores')?.total).toBe(2);
    expect(r.inventario.find(c => c.categoria === 'Monitores')?.total).toBe(0);
    expect(r.inventario.reduce((s, c) => s + c.total, 0)).toBe(4);
    expect(calcularDashboard(datos, { ...filtro, edificio: 'Nuevo edificio' }).equipos).toBe(0);
    expect(calcularDashboard(datos, filtro).inventario.find(c => c.categoria === 'Laptops')?.total).toBe(1);
  });
  it('maneja cero registros y fechas inválidas sin generar NaN ni perder el costo histórico', () => {
    const vacio = calcularDashboard({ equipos: [], categorias: [], ubicaciones: [], mantenimientos: [] }, filtro);
    expect(vacio.costo).toBe(0); expect(vacio.promedio).toBe(0);
    const r = calcularDashboard({ ...datos, mantenimientos: [mantenimiento('1', 'a', 'inválida', 15)] }, filtro);
    expect(r.costo).toBe(0); expect(r.historico).toBe(15); expect(r.sinFecha).toBe(1);
    expect(calcularDashboard(datos, { ...filtro, anio: 'todos', ciclo: 0, edificio: '' }).costo).toBe(180.3);
  });
  it('exporta exactamente el período, edificio y agregados seleccionados, sin fichas individuales', () => {
    const resumen = calcularDashboard(datos, filtro);
    const doc = dibujarPdfDashboard(resumen, 'Ana Emisora', new Uint8Array(readFileSync('public/android-chrome-512x512.png')));
    const contenido = doc.output();
    expect(contenido).toContain('Ciclo 01-2025');
    expect(contenido).toContain('Masferrer');
    expect(contenido).not.toContain('Salarrué');
    expect(contenido).toContain('$10.10');
    expect(contenido).toContain('$130.30');
    expect(contenido).toContain('Ana Emisora');
    expect(contenido).not.toContain('FALLA');
    expect(doc.getNumberOfPages()).toBeGreaterThan(1);
  });
});
