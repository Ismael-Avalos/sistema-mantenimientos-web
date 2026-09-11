import type { Equipo } from '../types/Equipo';
import type { MaintenanceResponse } from '../types/Maintenance';

export interface DatosReporte {
  equipo: Equipo;
  mantenimientos: MaintenanceResponse[];
  individual?: boolean;
}

const texto = (valor?: string | null) => valor?.trim() || 'No registrado';
const dinero = (valor: number) => new Intl.NumberFormat('es-SV', { style: 'currency', currency: 'USD' }).format(valor);

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
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ format: 'a4' });
  const items = ordenarHistorial(datos.mantenimientos);
  const titulo = datos.individual ? 'Reporte de mantenimiento' : 'Historial de mantenimientos';
  doc.setProperties({ title: titulo, subject: datos.equipo.codigoInventario, author: 'Sistema de Mantenimientos' });
  let y = 42;
  const encabezado = () => {
    doc.setFillColor(153, 27, 27);
    doc.rect(0, 0, 210, 3, 'F');
    doc.setFont('helvetica', 'bold').setFontSize(10).setTextColor(153, 27, 27);
    doc.text('SISTEMA DE MANTENIMIENTOS', 18, 16);
    doc.setFontSize(19).setTextColor(15, 23, 42);
    doc.text(titulo, 18, 27);
    doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(100, 116, 139);
    doc.text(`Emitido: ${new Date().toLocaleString('es-SV')}`, 18, 34);
  };
  encabezado();
  const espacio = (alto: number) => {
    if (y + alto > 276) { doc.addPage(); encabezado(); y = 44; }
  };
  const parrafo = (contenido: string, negrita = false) => {
    doc.setFont('helvetica', negrita ? 'bold' : 'normal').setFontSize(10).setTextColor(30, 41, 59);
    const lineas: string[] = doc.splitTextToSize(contenido, 174);
    for (const linea of lineas) {
      espacio(5);
      // A page break redraws the header and changes the font.
      doc.setFont('helvetica', negrita ? 'bold' : 'normal').setFontSize(10).setTextColor(30, 41, 59);
      doc.text(linea, 18, y);
      y += 5;
    }
    y += 2;
  };
  const seccion = (tituloSeccion: string) => {
    espacio(20);
    y += 3;
    doc.setDrawColor(226, 232, 240).line(18, y, 192, y);
    y += 8;
    parrafo(tituloSeccion, true);
  };
  seccion('Ficha del equipo');
  ficha(datos.equipo).forEach(([clave, valor]) => parrafo(`${clave}: ${valor}`));
  seccion('Resumen del reporte');
  parrafo(`Intervenciones: ${items.length}    |    Costo total: ${dinero(items.reduce((sum, m) => sum + Number(m.costo || 0), 0))}`, true);
  if (items.length) parrafo(`Período: ${fechaTexto(items.at(-1)?.fecha)} al ${fechaTexto(items[0].fecha)}`);
  else parrafo('Este equipo no registra mantenimientos.');
  parrafo('La ficha refleja los datos actuales del equipo. Las intervenciones se presentan de la más reciente a la más antigua.');
  for (const m of items) {
    seccion(`Reporte #${m.numeroReporte} - ${m.tipo}`);
    parrafo(`Inicio: ${fechaTexto(m.fecha)}    |    Entrega: ${fechaTexto(m.fechaEntrega)}`);
    parrafo(`Sede: ${texto(m.sede)}    |    Unidad: ${texto(m.unidad)}`);
    parrafo(`Responsable: ${texto(m.responsableNombre)}    |    Costo: ${dinero(Number(m.costo || 0))}`);
    parrafo(`Solicitante: ${texto(m.solicitanteNombre)}`);
    for (const [etiqueta, valor] of [
      ['Falla / motivo', m.descripcionFalla], ['Actividades realizadas', m.actividadesRealizadas],
      ['Observaciones técnicas', m.observacionesTecnicas], ['Recomendaciones', m.recomendaciones],
    ]) {
      espacio(16);
      parrafo(`${etiqueta}:`, true);
      parrafo(texto(valor));
    }
  }
  const paginas = doc.getNumberOfPages();
  for (let pagina = 1; pagina <= paginas; pagina++) {
    doc.setPage(pagina);
    doc.setDrawColor(226, 232, 240).line(18, 282, 192, 282);
    doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(100, 116, 139);
    doc.text('Sistema de Mantenimientos Institucional', 18, 288);
    doc.text(`Página ${pagina} de ${paginas}`, 192, 288, { align: 'right' });
  }
  return doc;
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
