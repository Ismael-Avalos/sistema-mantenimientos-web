/// <reference types="node" />
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { crearExcel, crearPdf, fechaReporte, nombreReporte, ordenarHistorial } from './reportes';
import type { DatosReporte } from './reportes';

const datos: DatosReporte = {
  equipo: { id: 'interno-equipo', qrUuid: 'uuid-no-publicar', codigoInventario: 'PROY-001', nombre: 'Cañón A01',
    marca: 'EPSON', modelo: 'POWERLITE E20', serialEquipo: 'X8B24100471', estado: 'ACTIVO', fechaAdquisicion: '2024-01-01', createdAt: '',
    categoria: { nombre: 'Proyectores' } as DatosReporte['equipo']['categoria'],
    ubicacion: { nombre: 'Aula 01' } as DatosReporte['equipo']['ubicacion'] },
  mantenimientos: [{ id: 'interno-mantenimiento', numeroReporte: 4, tipo: 'CORRECTIVO', fecha: '2026-09-10T08:30:00',
    fechaEntrega: '2026-09-10T11:00:00', sede: 'Sede central', unidad: 'Informática', solicitanteNombre: 'María López',
    solicitanteCorreo: 'correo-no-exportar@example.com', responsableNombre: 'René Pinto Ávalos', costo: 25.5,
    descripcionFalla: 'Cristal del cañón roto.', actividadesRealizadas: 'Cambio de cristal. Limpieza interna.',
    observacionesTecnicas: 'Se verificó el funcionamiento del equipo.', recomendaciones: 'Realizar limpieza periódica.' }],
};

describe('reportes de mantenimiento', () => {
  beforeEach(() => {
    const logo = readFileSync('public/android-chrome-512x512.png');
    vi.stubGlobal('fetch', vi.fn(async () => new Response(logo)));
  });
  afterEach(() => vi.unstubAllGlobals());
  it('preserva fechas de calendario y ordena sin mutar el historial', () => {
    expect(fechaReporte('2024-01-01')?.getDate()).toBe(1);
    expect(fechaReporte('inválida')).toBeNull();
    const original = [datos.mantenimientos[0], { ...datos.mantenimientos[0], fecha: '2026-09-11' }];
    expect(ordenarHistorial(original)[0].fecha).toBe('2026-09-11');
    expect(original[0].fecha).toBe('2026-09-10T08:30:00');
    expect(nombreReporte({ ...datos, individual: true })).toBe('mantenimiento-4-PROY-001');
  });

  it('genera un XLSX reabrible con fechas, costos, filtros y total, sin UUID ni fórmulas procedentes del usuario', async () => {
    const libro = await crearExcel({ ...datos, mantenimientos: [{ ...datos.mantenimientos[0], descripcionFalla: '=1+1' }] });
    const buffer = await libro.xlsx.writeBuffer();
    const { default: ExcelJS } = await import('exceljs');
    const copia = new ExcelJS.Workbook();
    await copia.xlsx.load(buffer);
    const hoja = copia.getWorksheet('Mantenimientos')!;
    expect(hoja.getCell('K2').value).toBe('=1+1');
    expect(hoja.getCell('D2').value).toBeInstanceOf(Date);
    expect(hoja.getCell('O2').value).toBe(25.5);
    expect(hoja.autoFilter).toBeTruthy();
    expect(hoja.views[0].state).toBe('frozen');
    expect(copia.getWorksheet('Resumen')!.getCell('B13').value).toEqual({ formula: "SUM('Mantenimientos'!O2:O2)", result: 25.5 });
    expect(JSON.stringify(copia.model)).not.toContain('uuid-no-publicar');
    expect(JSON.stringify(copia.model)).not.toContain('interno-mantenimiento');
  }, 20000);

  it('genera un PDF paginado sin identificadores internos, incluso con textos extensos', async () => {
    const doc = await crearPdf({ ...datos, mantenimientos: [{ ...datos.mantenimientos[0], actividadesRealizadas: 'Revisión técnica y limpieza del equipo. '.repeat(400) }] });
    expect(doc.getNumberOfPages()).toBeGreaterThan(2);
    const contenido = doc.output();
    expect(contenido).not.toContain('uuid-no-publicar');
    expect(contenido).not.toContain('interno-mantenimiento');
    expect(contenido).toContain('PROY-001');
  });

  it('resume el historial con falla y actividades sin anexar intervenciones individuales', async () => {
    const doc = await crearPdf(datos);
    const contenido = doc.output();
    expect(doc.getNumberOfPages()).toBe(1);
    expect(contenido).toContain('Cristal del cañón roto.');
    expect(contenido).toContain('Cambio de cristal. Limpieza interna.');
    expect(contenido).not.toContain('Se verificó el funcionamiento del equipo.');
    expect(contenido).not.toContain('Realizar limpieza periódica.');
    expect(contenido).not.toContain('INTERVENCIÓN');
  });

  it('permite exportar equipos sin mantenimientos', async () => {
    const vacio = { ...datos, mantenimientos: [] };
    expect((await crearExcel(vacio)).getWorksheet('Resumen')!.getCell('B13').value).toBe(0);
    expect((await crearPdf(vacio)).output()).toContain('Este equipo no registra mantenimientos.');
  });

  it('incluye el logo institucional y las dos firmas del mantenimiento individual en una página', async () => {
    const doc = await crearPdf({ ...datos, individual: true, emitidoPor: 'Usuario que exporta' });
    const contenido = doc.output();
    expect(doc.getNumberOfPages()).toBe(1);
    expect(contenido).toContain('/Subtype /Image');
    expect(contenido).toContain('UNIVERSIDAD MODULAR ABIERTA');
    expect(contenido).toContain('Regional Sonsonate');
    expect(contenido).toContain('(Solicitante del mantenimiento)');
    expect(contenido).toContain('(María López)');
    expect(contenido).toContain('(René Pinto Ávalos)');
    expect(contenido).not.toContain('Usuario que exporta');
  });

  it('firma el histórico con el usuario que exporta y mantiene las firmas después de textos largos', async () => {
    const doc = await crearPdf({ ...datos, emitidoPor: 'Ana Emisora', mantenimientos: [{ ...datos.mantenimientos[0], actividadesRealizadas: 'Texto largo. '.repeat(500) }] });
    const contenido = doc.output();
    expect(contenido).toContain('(Ana Emisora)');
    expect(contenido).toContain('(Emitido por)');
    expect(contenido).not.toContain('(Solicitante del mantenimiento)');
    expect(contenido.lastIndexOf('(Ana Emisora)')).toBeGreaterThan(contenido.lastIndexOf('Texto largo.'));
  });

  it('avisa si no es posible cargar el logo para evitar un reporte institucional incompleto', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 404 })));
    await expect(crearPdf(datos)).rejects.toThrow('No se pudo cargar el logo institucional');
  });
});
