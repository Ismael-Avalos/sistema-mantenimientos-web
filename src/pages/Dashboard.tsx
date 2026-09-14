import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Activity, Archive, ArrowDownToLine, CircleDollarSign, Cpu, Loader2, RefreshCw, ShieldCheck, Wrench } from 'lucide-react';
import { obtenerDatosDashboard } from '../services/dashboard.service';
import { calcularDashboard, dineroDashboard as dinero } from '../utils/dashboard';
import type { DatosDashboard, FiltroDashboard, ResumenDashboard } from '../utils/dashboard';
import { useAuth } from '../hooks/useAuth';

const panel = 'rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-900 shadow-sm';
const control = 'min-h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-700 dark:focus:ring-red-400';
function Tarjeta({ titulo, valor, detalle, icono, destacada = false }: { titulo: string; valor: string | number; detalle: string; icono: ReactNode; destacada?: boolean }) {
  return <div className={`${panel} p-5 ${destacada ? 'border-red-200 dark:border-red-900 bg-gradient-to-br from-red-50 dark:from-red-950/50 to-white dark:to-slate-900' : ''}`}>
    <div className="flex items-center justify-between gap-2"><p className="text-xs font-medium text-slate-500 dark:text-slate-400">{titulo}</p><span className="rounded-lg bg-red-50 dark:bg-red-950/50 p-2 text-red-800 dark:text-red-300">{icono}</span></div>
    <p className={`mt-2 break-words text-2xl font-bold tracking-tight tabular-nums xl:text-3xl ${destacada ? 'text-red-800 dark:text-red-300' : 'text-slate-800 dark:text-slate-100'}`}>{valor}</p>
    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{detalle}</p>
  </div>;
}
function Grafica({ resumen }: { resumen: ResumenDashboard }) {
  const [metrica, setMetrica] = useState<'costo' | 'cantidad'>('costo');
  const valores = resumen.serie.map(p => p[metrica]);
  const maximo = Math.max(1, ...valores);
  const techo = Math.ceil(maximo / (maximo > 10 ? 10 : 1)) * (maximo > 10 ? 10 : 1);
  const puntos = valores.map((v, i) => `${60 + i * 610 / Math.max(1, valores.length - 1)},${210 - v / techo * 175}`);
  const formatear = (v: number) => metrica === 'costo' ? dinero(v) : String(v);
  return <section className={`${panel} min-w-0 p-5 sm:p-6`}>
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-semibold text-slate-800 dark:text-slate-100">Actividad de mantenimiento</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{resumen.periodo} · {resumen.filtro.anio === 'todos' ? 'Evolución anual' : 'Evolución mensual'}</p></div>
      <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1">{(['costo', 'cantidad'] as const).map(v => <button key={v} onClick={() => setMetrica(v)} aria-pressed={metrica === v} className={`rounded-md px-3 py-2 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-red-700 ${metrica === v ? 'bg-white dark:bg-slate-900 text-red-800 dark:text-red-300 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>{v === 'costo' ? 'Costo' : 'Mantenimientos'}</button>)}</div>
    </div>
    {!resumen.cantidad && <p className="mt-4 rounded-lg bg-slate-50 dark:bg-slate-950 p-3 text-sm text-slate-500 dark:text-slate-400">No hay mantenimientos registrados en este período.</p>}
    <svg viewBox="0 0 710 250" role="img" aria-label={`${metrica === 'costo' ? 'Costo' : 'Mantenimientos'} por período. Los valores exactos están en Ver datos de la gráfica.`} className="mt-5 w-full">
      <defs><linearGradient id="dashboard-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-line)" stopOpacity=".3"/><stop offset="100%" stopColor="var(--chart-line)" stopOpacity=".02"/></linearGradient></defs>
      {[0, 1, 2, 3, 4].map(i => <g key={i}><line x1="60" x2="680" y1={210 - i * 43.75} y2={210 - i * 43.75} stroke="var(--chart-grid)" strokeDasharray="3 4"/><text x="52" y={214 - i * 43.75} textAnchor="end" fontSize="10" fill="var(--chart-label)">{new Intl.NumberFormat('es-SV', { notation: 'compact', maximumFractionDigits: 1 }).format(techo * i / 4)}</text></g>)}
      {puntos.length > 1 && <><polygon points={`60,210 ${puntos.join(' ')} ${60 + (valores.length - 1) * 610 / Math.max(1, valores.length - 1)},210`} fill="url(#dashboard-area)"/><polyline points={puntos.join(' ')} fill="none" stroke="var(--chart-line)" strokeWidth="2.5" strokeLinejoin="round"/></>}
      {resumen.serie.map((p, i) => <g key={p.etiqueta}><circle cx={60 + i * 610 / Math.max(1, valores.length - 1)} cy={210 - valores[i] / techo * 175} r="4" fill="var(--chart-line)" stroke="var(--chart-surface)" strokeWidth="2"><title>{p.etiqueta}: {formatear(valores[i])}</title></circle>{(i % Math.max(1, Math.ceil(valores.length / 12)) === 0 || i === valores.length - 1) && <text x={60 + i * 610 / Math.max(1, valores.length - 1)} y="235" textAnchor="middle" fontSize="11" fill="var(--chart-label)">{p.etiqueta}</text>}</g>)}
    </svg>
    <details className="mt-2 text-xs text-slate-500 dark:text-slate-400"><summary className="cursor-pointer rounded py-2 focus-visible:outline-2 focus-visible:outline-red-700">Ver datos de la gráfica</summary><div className="max-h-60 overflow-auto"><table className="mt-2 w-full text-left"><thead><tr><th className="py-2">Período</th><th>Costo</th><th>Mantenimientos</th></tr></thead><tbody>{resumen.serie.map(p => <tr key={p.etiqueta} className="border-t border-slate-100 dark:border-slate-800"><td className="py-2">{p.etiqueta}</td><td>{dinero(p.costo)}</td><td>{p.cantidad}</td></tr>)}</tbody></table></div></details>
  </section>;
}
function Estados({ resumen }: { resumen: ResumenDashboard }) {
  let inicio = 0;
  const segmentos = resumen.estados.map(e => { const fin = inicio + e.cantidad / Math.max(1, resumen.equipos) * 100; const parte = `${e.color} ${inicio}% ${fin}%`; inicio = fin; return parte; });
  return <section className={`${panel} p-5 sm:p-6`}><h2 className="font-semibold">Estado del inventario</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Distribución actual de equipos</p>
    <div className="mx-auto my-6 flex h-40 w-40 items-center justify-center rounded-full" style={{ background: resumen.equipos ? `conic-gradient(${segmentos.join(',')})` : 'var(--chart-grid)' }} aria-hidden="true"><div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white dark:bg-slate-900"><strong className="text-3xl tracking-tight">{resumen.equipos}</strong><span className="text-xs text-slate-500 dark:text-slate-400">equipos</span></div></div>
    <ul className="space-y-3">{resumen.estados.map(e => <li key={e.nombre} className="flex items-center gap-2 text-sm"><span className="h-2.5 w-2.5 rounded-full" style={{ background: e.color }}/><span className="flex-1 text-slate-600 dark:text-slate-300">{e.nombre}</span><strong className="tabular-nums">{e.cantidad}</strong><span className="w-12 text-right text-xs text-slate-400 dark:text-slate-400">{resumen.equipos ? Math.round(e.cantidad / resumen.equipos * 100) : 0}%</span></li>)}</ul>
  </section>;
}
export default function Dashboard() {
  const { user } = useAuth();
  const [datos, setDatos] = useState<DatosDashboard | null>(null);
  const [error, setError] = useState('');
  const [intento, setIntento] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [exportando, setExportando] = useState(false);
  const [errorPdf, setErrorPdf] = useState('');
  const [filtro, setFiltro] = useState<FiltroDashboard>({ anio: new Date().getFullYear(), ciclo: 0, edificio: '' });
  useEffect(() => {
    const controlador = new AbortController();
    obtenerDatosDashboard(controlador.signal).then(d => { if (!controlador.signal.aborted) setDatos(d); })
      .catch(() => { if (!controlador.signal.aborted) setError('No se pudo cargar el dashboard completo. Reintenta para consultar totales confiables.'); })
      .finally(() => { if (!controlador.signal.aborted) setCargando(false); });
    return () => controlador.abort();
  }, [intento]);
  const resumen = useMemo(() => datos ? calcularDashboard(datos, filtro) : null, [datos, filtro]);
  function actualizar() { setCargando(true); setError(''); setIntento(v => v + 1); }
  async function exportar() {
    if (!resumen || exportando) return;
    setExportando(true); setErrorPdf('');
    try {
      const { crearPdfDashboard } = await import('../utils/dashboard-pdf');
      const doc = await crearPdfDashboard(resumen, user?.nombre || 'Nombre no registrado');
      doc.save(`dashboard-${resumen.filtro.anio}-${resumen.filtro.ciclo ? `ciclo-0${resumen.filtro.ciclo}` : 'general'}.pdf`);
    } catch { setErrorPdf('No se pudo generar el PDF. Intenta nuevamente.'); }
    finally { setExportando(false); }
  }
  return <div className="mx-auto max-w-[1600px] space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-red-800 dark:text-red-300">Gestión institucional</p><h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Inventario, actividad y costos de mantenimiento.</p></div><div className="flex gap-2"><button onClick={actualizar} disabled={cargando} className={`${control} inline-flex items-center gap-2 disabled:opacity-50`}><RefreshCw className={`h-4 w-4 ${cargando ? 'animate-spin' : ''}`}/>Actualizar</button><button onClick={() => void exportar()} disabled={!resumen || cargando || !!error || exportando} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-red-800 px-4 text-sm font-semibold text-white shadow-sm hover:bg-red-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-800 disabled:opacity-50">{exportando ? <Loader2 className="h-4 w-4 animate-spin"/> : <ArrowDownToLine className="h-4 w-4"/>}{exportando ? 'Generando...' : 'Exportar PDF'}</button></div></div>
    {errorPdf && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{errorPdf}</p>}
    {cargando ? <div role="status" className={`${panel} flex items-center justify-center gap-3 p-16 text-slate-500 dark:text-slate-400`}><Loader2 className="h-5 w-5 animate-spin"/>Cargando inventario e historial de mantenimientos...</div> : error ? <div role="alert" className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/50 p-6 text-red-800 dark:text-red-300"><p>{error}</p><button onClick={actualizar} className="mt-3 font-semibold underline">Reintentar</button></div> : resumen && <>
      <div className={`${panel} flex flex-wrap items-end gap-4 p-4`}>
        <label className="flex min-w-40 flex-1 flex-col gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">Edificio<select className={control} value={filtro.edificio} onChange={e => setFiltro({ ...filtro, edificio: e.target.value })}><option value="">Todos los edificios</option>{resumen.edificios.map(u => <option key={u}>{u}</option>)}</select></label>
        <label className="flex min-w-36 flex-col gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">Año<select className={control} value={filtro.anio} onChange={e => setFiltro({ ...filtro, anio: e.target.value === 'todos' ? 'todos' : Number(e.target.value), ciclo: 0 })}><option value="todos">Todo el historial</option>{resumen.anios.map(a => <option key={a}>{a}</option>)}</select></label>
        <label className="flex min-w-56 flex-1 flex-col gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">Ciclo académico<select className={`${control} disabled:bg-slate-50 dark:disabled:bg-slate-950 disabled:text-slate-400 dark:disabled:text-slate-400`} disabled={filtro.anio === 'todos'} value={filtro.ciclo} onChange={e => setFiltro({ ...filtro, ciclo: Number(e.target.value) as 0 | 1 | 2 })}><option value="0">{filtro.anio === 'todos' ? 'Todos los ciclos' : 'Año completo'}</option><option value="1">Ciclo 01-{filtro.anio} · enero–junio</option><option value="2">Ciclo 02-{filtro.anio} · julio–diciembre</option></select></label>
        <span className="mb-1 rounded-lg bg-red-50 dark:bg-red-950/50 px-3 py-2 text-xs font-semibold text-red-800 dark:text-red-300">{resumen.periodo}</span>
      </div>
      <div><div className="mb-3 flex flex-wrap items-baseline justify-between gap-2"><h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Inventario actual</h2><p className="text-xs text-slate-500 dark:text-slate-400">{filtro.edificio || 'Todos los edificios'} · independiente del período</p></div><div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 xl:grid-cols-4"><Tarjeta titulo="Total de equipos" valor={resumen.equipos} detalle="Equipos registrados" icono={<Cpu className="h-4 w-4"/>}/><Tarjeta titulo="Equipos activos" valor={resumen.estados[0].cantidad} detalle="Estado actual: activo" icono={<ShieldCheck className="h-4 w-4"/>}/><Tarjeta titulo="En mantenimiento" valor={resumen.estados[1].cantidad} detalle="Equipos en intervención" icono={<Wrench className="h-4 w-4"/>}/><Tarjeta titulo="Dados de baja" valor={resumen.estados[2].cantidad} detalle="Fuera de servicio" icono={<Archive className="h-4 w-4"/>}/></div></div>
      <div><h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Costos y actividad · {resumen.periodo}</h2><div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 xl:grid-cols-4"><Tarjeta titulo="Costo del período" valor={dinero(resumen.costo)} detalle={resumen.periodo} icono={<CircleDollarSign className="h-4 w-4"/>} destacada/><Tarjeta titulo="Mantenimientos registrados" valor={resumen.cantidad} detalle="Intervenciones del período" icono={<Wrench className="h-4 w-4"/>}/><Tarjeta titulo="Promedio por mantenimiento" valor={dinero(resumen.promedio)} detalle="Costo del período / intervenciones" icono={<Activity className="h-4 w-4"/>}/><Tarjeta titulo="Costo histórico acumulado" valor={dinero(resumen.historico)} detalle="Todos los años · edificio seleccionado" icono={<CircleDollarSign className="h-4 w-4"/>}/></div></div>
      {resumen.sinFecha > 0 && <p role="status" className="rounded-xl bg-amber-50 dark:bg-amber-950/50 p-3 text-sm text-amber-800 dark:text-amber-300">{resumen.sinFecha} mantenimiento(s) sin fecha válida: incluidos en el histórico, excluidos del desglose por año y ciclo.</p>}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]"><Grafica resumen={resumen}/><Estados resumen={resumen}/></div>
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <section className={`${panel} min-w-0 overflow-hidden`}><div className="p-5"><h2 className="font-semibold">Equipos por categoría</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Inventario actual · incluye todos los estados</p></div>{resumen.equipos ? <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 dark:bg-slate-950 text-xs text-slate-500 dark:text-slate-400"><tr><th className="px-5 py-3">Categoría</th><th className="px-5 py-3 text-right">Total</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{resumen.inventario.map(c => <tr key={c.categoria} className="hover:bg-slate-50 dark:hover:bg-slate-950"><th className="px-5 py-3 font-medium text-slate-600 dark:text-slate-300">{c.categoria}</th><td className="px-5 py-3 text-right font-semibold tabular-nums">{c.total}</td></tr>)}</tbody><tfoot className="border-t border-red-100 dark:border-red-900 bg-red-50/60 dark:bg-red-950/60 font-semibold text-red-900 dark:text-red-300"><tr><th className="px-5 py-3">Total de equipos</th><td className="px-5 py-3 text-right">{resumen.equipos}</td></tr></tfoot></table></div> : <p className="px-5 pb-6 text-sm text-slate-500 dark:text-slate-400">No hay equipos registrados en esta selección.</p>}</section>
        <section className={`${panel} min-w-0 overflow-hidden`}><div className="p-5"><h2 className="font-semibold">Costo por ciclo y año</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Comparativo anual · ambos ciclos del año seleccionado</p></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 dark:bg-slate-950 text-xs text-slate-500 dark:text-slate-400"><tr><th className="px-5 py-3">Año</th><th className="px-3 py-3 text-right">Ciclo 01<br/><span className="font-normal">Ene–jun</span></th><th className="px-3 py-3 text-right">Ciclo 02<br/><span className="font-normal">Jul–dic</span></th><th className="px-5 py-3 text-right">Total anual</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{resumen.resumenAnios.map(a => <tr key={a.anio}><th className="px-5 py-4 font-medium">{a.anio}</th><td className={`px-3 py-4 text-right tabular-nums ${filtro.ciclo === 1 ? 'bg-red-50 dark:bg-red-950/50 font-semibold text-red-800 dark:text-red-300' : ''}`} title={`Ciclo 01-${a.anio}`}>{dinero(a.ciclo1)}</td><td className={`px-3 py-4 text-right tabular-nums ${filtro.ciclo === 2 ? 'bg-red-50 dark:bg-red-950/50 font-semibold text-red-800 dark:text-red-300' : ''}`} title={`Ciclo 02-${a.anio}`}>{dinero(a.ciclo2)}</td><td className="px-5 py-4 text-right font-semibold tabular-nums">{dinero(a.total)}</td></tr>)}</tbody></table></div></section>
      </div><p className="text-xs leading-relaxed text-slate-400 dark:text-slate-400">Costos en USD, agrupados por fecha de inicio del mantenimiento y edificio actual del equipo. El PDF conserva esta selección, el inventario actual y los comparativos identificados como anuales e históricos.</p>
    </>}
  </div>;
}
