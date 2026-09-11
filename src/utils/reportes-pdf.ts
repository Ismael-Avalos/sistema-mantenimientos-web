import { jsPDF } from 'jspdf';
import type { DatosReporte } from './reportes';
import { fechaReporte, ordenarHistorial } from './reportes';
import type { MaintenanceResponse } from '../types/Maintenance';

const ROJO = '#991B1B';
const TINTA = '#18181B';
const GRIS = '#62626B';
const BORDE = '#D9D9DE';
const FONDO = '#F7F7F8';
const texto = (valor?: string | null) => valor?.trim() || 'No registrado';
const moneda = (valor: number) => new Intl.NumberFormat('es-SV', { style: 'currency', currency: 'USD' }).format(Number(valor || 0));
const fecha = (valor?: string | null) => {
  const d = fechaReporte(valor);
  return d ? new Intl.DateTimeFormat('es-SV', { day: '2-digit', month: 'short', year: 'numeric' }).format(d) : 'No registrada';
};
type Campo = [etiqueta: string, valor: string];

/** All dimensions are millimetres. Blocks grow with their content and split before the footer. */
export function dibujarPdf(datos: DatosReporte, logo: Uint8Array) {
  const doc = new jsPDF({ format: 'a4' });
  const items = ordenarHistorial(datos.mantenimientos);
  if (datos.individual && items.length !== 1) throw new Error('El reporte individual requiere un mantenimiento');
  const e = datos.equipo;
  const titulo = datos.individual ? 'REPORTE DE MANTENIMIENTO' : 'HISTORIAL DE MANTENIMIENTOS';
  const margen = 15;
  const ancho = 180;
  const limite = 270;
  const emision = new Date().toLocaleString('es-SV');
  let y = 51;
  let contexto = '';

  doc.setProperties({ title: titulo, subject: e.codigoInventario, author: 'Universidad Modular Abierta - Regional Sonsonate' });
  function fuente(tamano = 9, negrita = false, color = TINTA) {
    doc.setFont('helvetica', negrita ? 'bold' : 'normal').setFontSize(tamano).setTextColor(color);
  }
  function lineas(valor: string, espacio: number, tamano = 9, negrita = false): string[] {
    fuente(tamano, negrita);
    return doc.splitTextToSize(valor, espacio);
  }
  function cabecera() {
    doc.addImage(logo, 'PNG', 16, 12, 25, 25, 'uma', 'FAST');
    fuente(13, true);
    doc.text('UNIVERSIDAD MODULAR ABIERTA', 47, 19);
    fuente(10, false, GRIS);
    doc.text('Regional Sonsonate', 47, 25);
    fuente(8, false, GRIS);
    doc.text('Gestión institucional de equipos y mantenimientos', 47, 31);
    doc.setDrawColor(ROJO).setLineWidth(0.7).line(margen, 40, 195, 40);
    fuente(11, true, ROJO);
    doc.text(titulo, margen, 47);
  }
  function nuevaPagina() {
    doc.addPage();
    cabecera();
    y = 54;
    if (contexto) {
      fuente(8, true, GRIS);
      doc.text(`${contexto} (continuación)`, margen, y);
      y += 7;
    }
  }
  function espacio(alto: number) {
    if (y + alto > limite) nuevaPagina();
  }
  function seccion(nombre: string, reserva = 20) {
    espacio(reserva);
    doc.setFillColor(ROJO).rect(margen, y, ancho, 7, 'F');
    fuente(8, true, '#FFFFFF');
    doc.text(nombre.toUpperCase(), margen + 3, y + 4.8);
    y += 7;
  }
  // Shared row renderer handles unusually long fields without clipping or shrinking text.
  function campos(celdas: Campo[], anchos = celdas.map(() => ancho / celdas.length)) {
    const pendientes = celdas.map(([, valor], i) => lineas(valor, anchos[i] - 6));
    let continuacion = false;
    do {
      const cantidad = Math.max(1, ...pendientes.map(p => p.length));
      const altoDeseado = 8 + cantidad * 4;
      if (altoDeseado <= limite - 65) espacio(altoDeseado);
      else espacio(16);
      const capacidad = Math.max(1, Math.floor((limite - y - 8) / 4));
      const tomar = Math.min(cantidad, capacidad);
      const alto = 8 + tomar * 4;
      let x = margen;
      celdas.forEach(([etiqueta], i) => {
        doc.setDrawColor(BORDE).setLineWidth(0.2).setFillColor('#FFFFFF').rect(x, y, anchos[i], alto, 'FD');
        fuente(6.8, true, GRIS);
        doc.text(`${etiqueta.toUpperCase()}${continuacion ? ' (CONT.)' : ''}`, x + 3, y + 4);
        const parte = pendientes[i].splice(0, tomar);
        fuente();
        parte.forEach((linea, n) => doc.text(linea, x + 3, y + 9 + n * 4));
        x += anchos[i];
      });
      y += alto;
      continuacion = true;
      if (pendientes.some(p => p.length)) nuevaPagina();
    } while (pendientes.some(p => p.length));
  }
  function nota(contenido: string) {
    const partes = lineas(contenido, ancho, 7.5);
    for (const linea of partes) {
      espacio(4);
      fuente(7.5, false, GRIS);
      doc.text(linea, margen, y + 3);
      y += 4;
    }
    y += 3;
  }
  function detalle(etiqueta: string, valor?: string | null) {
    const pendientes = lineas(texto(valor), ancho - 8);
    let continuacion = false;
    do {
      const altoDeseado = 10 + pendientes.length * 4;
      espacio(Math.min(altoDeseado, 35));
      const tomar = Math.min(pendientes.length, Math.floor((limite - y - 10) / 4));
      const parte = pendientes.splice(0, tomar);
      const alto = 10 + parte.length * 4;
      doc.setDrawColor(BORDE).setLineWidth(0.2).rect(margen, y, ancho, alto);
      doc.setFillColor(FONDO).rect(margen + 0.1, y + 0.1, ancho - 0.2, 6, 'F');
      fuente(7.5, true, ROJO);
      doc.text(`${etiqueta.toUpperCase()}${continuacion ? ' (CONTINUACIÓN)' : ''}`, margen + 4, y + 4.2);
      fuente();
      parte.forEach((linea, n) => doc.text(linea, margen + 4, y + 10 + n * 4));
      y += alto + 2;
      continuacion = true;
      if (pendientes.length) nuevaPagina();
    } while (pendientes.length);
  }
  function intervencion(m: MaintenanceResponse) {
    contexto = `Reporte #${m.numeroReporte}`;
    seccion(`Intervención · Reporte #${m.numeroReporte}`, 35);
    campos([['Tipo de mantenimiento', m.tipo], ['Fecha de inicio', fecha(m.fecha)], ['Fecha de entrega', fecha(m.fechaEntrega)]]);
    campos([['Sede', texto(m.sede)], ['Unidad / departamento', texto(m.unidad)], ['Costo de intervención', moneda(m.costo)]]);
    campos([['Técnico responsable', texto(m.responsableNombre)], ['Solicitante', texto(m.solicitanteNombre)]]);
    y += 3;
    detalle('Falla / motivo de atención', m.descripcionFalla);
    detalle('Actividades realizadas', m.actividadesRealizadas);
    detalle('Observaciones técnicas', m.observacionesTecnicas);
    detalle('Recomendaciones', m.recomendaciones);
    y += 3;
  }
  function tablaHistorial() {
    const anchos = [22, 30, 30, 70, 28];
    const titulos = ['Reporte', 'Fecha', 'Tipo', 'Técnico responsable', 'Costo (USD)'];
    const cabeceraTabla = () => {
      doc.setFillColor(FONDO).rect(margen, y, ancho, 8, 'F');
      let x = margen;
      fuente(7.5, true, GRIS);
      titulos.forEach((tituloColumna, i) => { doc.text(tituloColumna, x + 3, y + 5); x += anchos[i]; });
      y += 8;
    };
    contexto = 'Relación de intervenciones';
    seccion(contexto, 30);
    cabeceraTabla();
    for (const m of items) {
      const pendientes = [`#${m.numeroReporte}`, fecha(m.fecha), m.tipo, texto(m.responsableNombre), moneda(m.costo)]
        .map((valor, i) => lineas(valor, anchos[i] - 6, 8));
      do {
        const restantes = Math.max(...pendientes.map(p => p.length));
        if (y + Math.min(6 + restantes * 4, 25) > limite) { nuevaPagina(); cabeceraTabla(); }
        const tomar = Math.min(restantes, Math.floor((limite - y - 6) / 4));
        const alto = 6 + tomar * 4;
        let x = margen;
        pendientes.forEach((partes, i) => {
          fuente(8);
          partes.splice(0, tomar).forEach((linea, n) => doc.text(linea, i === 4 ? x + anchos[i] - 3 : x + 3, y + 5 + n * 4, { align: i === 4 ? 'right' : 'left' }));
          x += anchos[i];
        });
        y += alto;
        doc.setDrawColor(BORDE).setLineWidth(0.2).line(margen, y, 195, y);
        if (pendientes.some(p => p.length)) { nuevaPagina(); cabeceraTabla(); }
      } while (pendientes.some(p => p.length));
    }
  }
  function firmas(personas: Campo[]) {
    const anchoFirma = personas.length === 1 ? 95 : 80;
    const nombres = personas.map(([, nombre]) => lineas(texto(nombre), anchoFirma - 4, 9, true));
    const alto = 33 + Math.max(...nombres.map(n => n.length)) * 4;
    contexto = 'Firmas';
    espacio(alto);
    y += 20;
    personas.forEach(([rol], i) => {
      const x = personas.length === 1 ? 105 - anchoFirma / 2 : margen + i * 100;
      doc.setDrawColor(TINTA).setLineWidth(0.3).line(x, y, x + anchoFirma, y);
      fuente(9, true);
      nombres[i].forEach((linea, n) => doc.text(linea, x + anchoFirma / 2, y + 5 + n * 4, { align: 'center' }));
      fuente(8, false, GRIS);
      doc.text(rol, x + anchoFirma / 2, y + 9 + nombres[i].length * 4, { align: 'center' });
    });
    y += alto - 20;
  }

  cabecera();
  y = 53;
  nota(`Emisión: ${emision}${datos.individual ? `    |    Reporte #${items[0].numeroReporte}` : ''}`);
  seccion('Identificación del equipo');
  campos([['Código de equipo', texto(e.codigoInventario)], ['Equipo', texto(e.nombre)], ['Número de serie', texto(e.serialEquipo)]]);
  campos([['Marca / modelo', texto([e.marca, e.modelo].filter(Boolean).join(' '))], ['Categoría', texto(e.categoria?.nombre)], ['Fecha de adquisición', fecha(e.fechaAdquisicion)]]);
  campos([['Ubicación actual', texto(e.ubicacion?.nombre)], ['Estado actual', texto(e.estado).replace(/_/g, ' ')]]);
  y += 2;
  if (!datos.individual) {
    nota('La ficha corresponde a los datos actuales del equipo. Historial ordenado de la intervención más reciente a la más antigua.');
    seccion('Resumen del historial');
    campos([
      ['Intervenciones', String(items.length)],
      ['Preventivos', String(items.filter(m => m.tipo === 'PREVENTIVO').length)],
      ['Correctivos', String(items.filter(m => m.tipo === 'CORRECTIVO').length)],
      ['Costo acumulado', moneda(items.reduce((s, m) => s + Number(m.costo || 0), 0))],
    ]);
    campos([['Desde', items.length ? fecha(items.at(-1)?.fecha) : 'Sin registros'], ['Hasta', items.length ? fecha(items[0].fecha) : 'Sin registros']]);
    y += 5;
    if (!items.length) nota('Este equipo no registra mantenimientos.');
    else {
      tablaHistorial();
      // Each intervention starts on a new page, keeping the history easy to file and read.
      contexto = '';
      nuevaPagina();
    }
  }
  items.forEach((m, i) => {
    if (i > 0) { contexto = ''; nuevaPagina(); }
    intervencion(m);
  });
  if (datos.individual) {
    firmas([['Técnico responsable', items[0].responsableNombre], ['Solicitante del mantenimiento', items[0].solicitanteNombre]]);
  } else {
    firmas([['Emitido por', datos.emitidoPor || 'Nombre no registrado']]);
  }
  const paginas = doc.getNumberOfPages();
  for (let pagina = 1; pagina <= paginas; pagina++) {
    doc.setPage(pagina);
    doc.setDrawColor(ROJO).setLineWidth(0.4).line(margen, 279, 195, 279);
    fuente(7, false, GRIS);
    doc.text('UMA · Regional Sonsonate', margen, 285);
    doc.text(`Página ${pagina} de ${paginas}`, 195, 285, { align: 'right' });
  }
  return doc;
}
