import { describe, expect, it } from 'vitest';
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

  it('permite exportar equipos sin mantenimientos', async () => {
    const vacio = { ...datos, mantenimientos: [] };
    expect((await crearExcel(vacio)).getWorksheet('Resumen')!.getCell('B13').value).toBe(0);
    expect((await crearPdf(vacio)).output()).toContain('Este equipo no registra mantenimientos.');
  });
});
