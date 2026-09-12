import { jsPDF } from 'jspdf';
import { dineroDashboard as dinero } from './dashboard';
import type { ResumenDashboard } from './dashboard';

/** Export the same immutable summary used by the dashboard, including its filter context. */
export async function crearPdfDashboard(resumen: ResumenDashboard, emitidoPor: string) {
  const respuesta = await fetch(`${import.meta.env.BASE_URL}android-chrome-512x512.png`);
  if (!respuesta.ok) throw new Error('No se pudo cargar el logo institucional');
  const logo = new Uint8Array(await respuesta.arrayBuffer());
  return dibujarPdfDashboard(resumen, emitidoPor, logo);
}
export function dibujarPdfDashboard(r: ResumenDashboard, emitidoPor: string, logo: Uint8Array) {
  const doc = new jsPDF({ format: 'a4' });
  const rojo = '#991B1B', gris = '#64748B', borde = '#E2E8F0';
  let y = 55;
  const limite = 270;
  const emision = new Date().toLocaleString('es-SV');
  doc.setProperties({ title: `Dashboard - ${r.periodo}`, author: 'Universidad Modular Abierta', subject: r.filtro.edificio || 'Todos los edificios' });
  function fuente(size = 9, bold = false, color = '#1E293B') { doc.setFont('helvetica', bold ? 'bold' : 'normal').setFontSize(size).setTextColor(color); }
  function cabecera() {
    doc.addImage(logo, 'PNG', 16, 12, 25, 25, 'uma', 'FAST');
    fuente(13, true); doc.text('UNIVERSIDAD MODULAR ABIERTA', 47, 19);
    fuente(10, false, gris); doc.text('Regional Sonsonate', 47, 26);
    fuente(8, false, gris); doc.text('Gestión institucional de equipos y mantenimientos', 47, 32);
    doc.setDrawColor(rojo).setLineWidth(.7).line(15, 40, 195, 40);
    fuente(11, true, rojo); doc.text('REPORTE GENERAL DEL DASHBOARD', 15, 47);
    fuente(8, false, gris); doc.text(r.periodo, 15, 53);
    y = 59;
  }
  function pagina() { doc.addPage(); cabecera(); }
  function espacio(alto: number) { if (y + alto > limite) pagina(); }
  function parrafo(texto: string, bold = false) {
    fuente(8, bold, gris);
    const lineas: string[] = doc.splitTextToSize(texto, 180);
    for (const linea of lineas) { espacio(5); fuente(8, bold, gris); doc.text(linea, 15, y + 3); y += 5; }
    y += 2;
  }
  function seccion(titulo: string) { espacio(28); doc.setFillColor(rojo).rect(15, y, 180, 7, 'F'); fuente(8, true, '#FFFFFF'); doc.text(titulo.toUpperCase(), 18, y + 4.8); y += 9; }
  function tabla(titulos: string[], filas: string[][], anchos: number[]) {
    function fila(valores: string[], encabezado = false) {
      fuente(8, encabezado);
      const pendientes = valores.map((v, i) => doc.splitTextToSize(v, anchos[i] - 6) as string[]);
      const altoCompleto = 5 + Math.max(1, ...pendientes.map(p => p.length)) * 4;
      if (altoCompleto <= 185 && y + altoCompleto > limite) { pagina(); if (!encabezado) fila(titulos, true); }
      do {
        if (y + 9 > limite) { pagina(); if (!encabezado) fila(titulos, true); }
        const tomar = Math.min(Math.max(1, ...pendientes.map(p => p.length)), Math.floor((limite - y - 5) / 4));
        const alto = 5 + tomar * 4;
        let x = 15;
        pendientes.forEach((p, i) => {
          doc.setFillColor(encabezado ? '#F1F5F9' : '#FFFFFF').setDrawColor(borde).setLineWidth(.2).rect(x, y, anchos[i], alto, 'FD');
          fuente(8, encabezado, encabezado ? gris : '#1E293B');
          p.splice(0, tomar).forEach((linea, n) => doc.text(linea, x + 3, y + 5 + n * 4));
          x += anchos[i];
        });
        y += alto;
      } while (pendientes.some(p => p.length));
    }
    espacio(20); fila(titulos, true); filas.forEach(f => fila(f)); y += 5;
  }
  cabecera();
  parrafo(`Emisión: ${emision}`);
  parrafo(`Edificio: ${r.filtro.edificio || 'Todos los edificios'}`, true);
  parrafo(`Período seleccionado: ${r.periodo}${r.filtro.ciclo ? (r.filtro.ciclo === 1 ? ' (enero a junio)' : ' (julio a diciembre)') : ''}`, true);
  parrafo('Inventario y edificio actuales del equipo. Costos en USD agrupados por fecha de inicio del mantenimiento.');
  seccion('Indicadores generales');
  tabla(['Indicador', 'Resultado', 'Alcance'], [
    ['Total de equipos', String(r.equipos), 'Inventario actual'],
    ...r.estados.map(e => [e.nombre, String(e.cantidad), 'Inventario actual']),
    ['Mantenimientos registrados', String(r.cantidad), r.periodo],
    ['Costo del período', dinero(r.costo), r.periodo],
    ['Promedio por mantenimiento', dinero(r.promedio), r.periodo],
    ['Costo histórico acumulado', dinero(r.historico), 'Todos los años del edificio seleccionado'],
  ], [72, 38, 70]);
  if (r.sinFecha) parrafo(`${r.sinFecha} mantenimiento(s) sin fecha válida incluidos en el histórico, excluidos de años, ciclos y gráfica.`);
  seccion('Costos por ciclo y año');
  parrafo('Comparativo anual: incluye ambos ciclos del año seleccionado, aunque el filtro principal sea un solo ciclo.');
  tabla(['Año', 'Ciclo 01 (ene-jun)', 'Ciclo 02 (jul-dic)', 'Total anual'], r.resumenAnios.map(a => [String(a.anio), `${dinero(a.ciclo1)}\n01-${a.anio}`, `${dinero(a.ciclo2)}\n02-${a.anio}`, dinero(a.total)]), [24, 54, 54, 48]);
  seccion(`Actividad de mantenimiento - ${r.periodo}`);
  tabla([r.filtro.anio === 'todos' ? 'Año' : 'Mes', 'Mantenimientos', 'Costo (USD)'], r.serie.map(p => [p.etiqueta, String(p.cantidad), dinero(p.costo)]), [60, 60, 60]);
  seccion('Equipos por categoría');
  parrafo('Inventario actual, con todos los estados. No se filtra por año ni ciclo.');
  if (!r.equipos) parrafo('No hay equipos registrados en esta selección.');
  tabla(['Categoría', 'Total de equipos'], [...r.inventario.map(c => [c.categoria, String(c.total)]), ['TOTAL', String(r.equipos)]], [140, 40]);
  espacio(20); parrafo(`Emitido por: ${emitidoPor}`, true);
  const paginas = doc.getNumberOfPages();
  for (let p = 1; p <= paginas; p++) {
    doc.setPage(p); doc.setDrawColor(rojo).setLineWidth(.4).line(15, 279, 195, 279);
    fuente(7, false, gris); doc.text('UMA · Regional Sonsonate', 15, 285); doc.text(`Página ${p} de ${paginas}`, 195, 285, { align: 'right' });
  }
  return doc;
}
