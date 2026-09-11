import { useState } from 'react';
import { FileDown, Sheet, Loader2 } from 'lucide-react';
import type { DatosReporte } from '../../utils/reportes';
import { useAuth } from '../../hooks/useAuth';

export function BotonesReporte({ obtenerDatos }: { obtenerDatos: () => DatosReporte | Promise<DatosReporte> }) {
  const { user } = useAuth();
  const [exportando, setExportando] = useState<'pdf' | 'xlsx' | null>(null);
  const [error, setError] = useState('');
  async function exportar(formato: 'pdf' | 'xlsx') {
    if (exportando) return;
    setExportando(formato);
    setError('');
    try {
      const { exportarReporte } = await import('../../utils/reportes');
      await exportarReporte({ ...await obtenerDatos(), emitidoPor: user?.nombre }, formato);
    } catch {
      setError('No se pudo generar el reporte. Intenta nuevamente.');
    } finally {
      setExportando(null);
    }
  }
  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap gap-2" aria-busy={Boolean(exportando)}>
        {(['pdf', 'xlsx'] as const).map(formato => {
          const Icono = exportando === formato ? Loader2 : formato === 'pdf' ? FileDown : Sheet;
          return <button key={formato} type="button" disabled={Boolean(exportando)} onClick={() => void exportar(formato)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-red-700 disabled:opacity-50 disabled:cursor-wait">
            <Icono className={`h-4 w-4 ${exportando === formato ? 'animate-spin' : ''}`} />
            {exportando === formato ? 'Generando...' : formato === 'pdf' ? 'Exportar PDF' : 'Exportar Excel'}
          </button>;
        })}
      </div>
      {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
    </div>
  );
}
