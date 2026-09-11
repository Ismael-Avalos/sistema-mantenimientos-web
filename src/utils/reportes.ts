import type { Equipo } from '../types/Equipo';
import type { MaintenanceResponse } from '../types/Maintenance';

export interface DatosReporte {
  equipo: Equipo;
  mantenimientos: MaintenanceResponse[];
  individual?: boolean;
  emitidoPor?: string;
}

const texto = (valor?: string | null) => valor?.trim() || 'No registrado';

// Preserve calendar dates and backend LocalDateTime values without timezone shifts.
export function fechaReporte(valor?: string | null): Date | null {
  if (!valor) return null;
  const fecha = new Date(/^\d{4}-\d{2}-\d{2}$/.test(valor) ? `${valor}T00:00:00` : valor);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

const fechaTexto = (valor?: string | null) => {
  const fecha = fechaReporte(valor);
  return fecha ? new Intl.DateTimeFormat('es-SV', { dateStyle: 'medium' }).format(fecha) : 'No registrada';
};

export function ordenarHistorial(items: MaintenanceResponse[]) {
  return [...items].sort((a, b) => (fechaReporte(b.fecha)?.getTime() ?? 0) - (fechaReporte(a.fecha)?.getTime() ?? 0));
}

export function nombreReporte({ equipo, mantenimientos, individual }: DatosReporte) {
  const codigo = (equipo.codigoInventario || 'sin-codigo').replace(/[^a-zA-Z0-9_-]/g, '_');
  return `${individual ? `mantenimiento-${mantenimientos[0]?.numeroReporte ?? 'sin-numero'}` : 'historial-mantenimientos'}-${codigo}`;
}

function ficha(equipo: Equipo): [string, string][] {
  return [
    ['Código de equipo', texto(equipo.codigoInventario)], ['Equipo', texto(equipo.nombre)],
    ['Marca / modelo', texto([equipo.marca, equipo.modelo].filter(Boolean).join(' '))],
    ['Número de serie', texto(equipo.serialEquipo)], ['Categoría', texto(equipo.categoria?.nombre)],
    ['Ubicación actual', texto(equipo.ubicacion?.nombre)], ['Estado actual', texto(equipo.estado).replace(/_/g, ' ')],
    ['Fecha de adquisición', fechaTexto(equipo.fechaAdquisicion)],
  ];
}

export async function crearPdf(datos: DatosReporte) {
  const { dibujarPdf } = await import('./reportes-pdf');
  // Same institutional emblem as the favicon, in its existing print-friendly resolution.
  const respuesta = await fetch(`${import.meta.env.BASE_URL}android-chrome-512x512.png`);
  if (!respuesta.ok) throw new Error('No se pudo cargar el logo institucional');
  return dibujarPdf(datos, new Uint8Array(await respuesta.arrayBuffer()));
}

export async function crearExcel(datos: DatosReporte) {
  const { default: ExcelJS } = await import('exceljs');
  const libro = new ExcelJS.Workbook();
  libro.creator = 'Sistema de Mantenimientos';
  libro.created = new Date();
  const items = ordenarHistorial(datos.mantenimientos);
  const resumen = libro.addWorksheet('Resumen');
  resumen.columns = [{ width: 28 }, { width: 75 }];
  resumen.addRow(['REPORTE DE MANTENIMIENTOS', '']);
  resumen.addRows(ficha(datos.equipo));
  resumen.addRow(['Alcance', datos.individual ? 'Intervención seleccionada' : 'Historial completo del equipo']);
  resumen.addRow(['Fecha de emisión', new Date()]).getCell(2).numFmt = 'yyyy-mm-dd hh:mm';
  resumen.addRow(['Intervenciones', items.length]);
  const total = resumen.addRow(['Costo total (USD)', 0]).getCell(2);
  resumen.addRow(['Nota', 'La ubicación y el estado del equipo corresponden a sus datos actuales.']);
  const hoja = libro.addWorksheet('Mantenimientos', { views: [{ state: 'frozen', ySplit: 1 }] });
  const columnas: [string, number][] = [
    ['N.º de reporte', 16], ['Código de equipo', 22], ['Equipo', 28], ['Fecha de inicio', 22], ['Fecha de entrega', 22],
    ['Tipo', 18], ['Sede', 24], ['Unidad', 24], ['Responsable', 32], ['Solicitante', 32],
    ['Falla / motivo', 50], ['Actividades realizadas', 60], ['Observaciones técnicas', 50], ['Recomendaciones', 50], ['Costo (USD)', 18],
  ];
  hoja.columns = columnas.map(([header, width]) => ({ header, width }));
  for (const m of items) {
    hoja.addRow([m.numeroReporte, texto(datos.equipo.codigoInventario), texto(datos.equipo.nombre),
      fechaReporte(m.fecha), fechaReporte(m.fechaEntrega), m.tipo, texto(m.sede), texto(m.unidad),
      texto(m.responsableNombre), texto(m.solicitanteNombre), texto(m.descripcionFalla), texto(m.actividadesRealizadas),
      texto(m.observacionesTecnicas), texto(m.recomendaciones), Number(m.costo || 0)]);
  }
  hoja.getColumn(4).numFmt = 'yyyy-mm-dd hh:mm';
  hoja.getColumn(5).numFmt = 'yyyy-mm-dd hh:mm';
  hoja.getColumn(15).numFmt = '"$"#,##0.00';
  hoja.autoFilter = { from: 'A1', to: { row: Math.max(1, hoja.rowCount), column: 15 } };
  total.value = items.length ? { formula: `SUM('Mantenimientos'!O2:O${items.length + 1})`, result: items.reduce((sum, m) => sum + Number(m.costo || 0), 0) } : 0;
  total.numFmt = '"$"#,##0.00';
  for (const sheet of [resumen, hoja]) {
    sheet.eachRow((row, index) => {
      row.alignment = { vertical: 'top', wrapText: true };
      row.font = { name: 'Calibri', size: 11, color: { argb: 'FF1E293B' } };
      if (index === 1) {
        row.height = 32;
        row.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
        row.eachCell(cell => { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF991B1B' } }; });
      }
    });
  }
  return libro;
}

export async function exportarReporte(datos: DatosReporte, formato: 'pdf' | 'xlsx') {
  if (formato === 'pdf') {
    (await crearPdf(datos)).save(`${nombreReporte(datos)}.pdf`);
    return;
  }
  const buffer = await (await crearExcel(datos)).xlsx.writeBuffer();
  const blob = new Blob([new Uint8Array(buffer)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = `${nombreReporte(datos)}.xlsx`;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
