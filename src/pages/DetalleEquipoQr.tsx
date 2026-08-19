import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { 
  Laptop, 
  MapPin, 
  Tag, 
  Calendar, 
  Wrench, 
  AlertTriangle, 
  Plus, 
  ArrowLeft,
  UserCheck,
  FileText
} from "lucide-react";

import { obtenerEquipoPorQrUuid } from "../services/equipos.service"; // Tu servicio existente de equipos
import { obtenerMantenimientosPorQrUuid } from "../services/mantenimiento.service";
import type { MaintenanceResponse } from "../types/Maintenance";

export function DetalleEquipoQr() {
  const { uuid } = useParams<{ uuid: string }>();

  const [equipo, setEquipo] = useState<any | null>(null);
  const [historial, setHistorial] = useState<MaintenanceResponse[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarDatos = async () => {
      if (!uuid) return;
      setCargando(true);
      setError(null);

      try {
        // Ejecutamos ambas peticiones al backend de forma simultánea
        const [datosEquipo, listaMantenimientos] = await Promise.all([
          obtenerEquipoPorQrUuid(uuid),
          obtenerMantenimientosPorQrUuid(uuid)
        ]);

        setEquipo(datosEquipo);
        setHistorial(listaMantenimientos);
      } catch (err: any) {
        console.error("Error al obtener la información:", err);
        setError("No se pudo cargar la información del equipo o no existe.");
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [uuid]);

  if (cargando) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-red-800 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-600">Cargando ficha del activo...</p>
        </div>
      </div>
    );
  }

  if (error || !equipo) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-center">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 max-w-sm w-full space-y-4">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">Equipo no encontrado</h2>
          <p className="text-xs text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Encabezado */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 py-3 flex items-center justify-between">
        <button 
          onClick={() => window.history.back()}
          className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Control de Activo
        </span>
        <div className="w-5" />
      </div>

      <div className="max-w-md mx-auto p-4 space-y-5">
        
        {/* Tarjeta del Activo */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="font-mono text-xs font-bold text-red-800 bg-red-50 px-2.5 py-1 rounded-md">
                {equipo.codigoInventario || equipo.codigo}
              </span>
              <h1 className="text-xl font-bold text-slate-800 mt-2">
                {equipo.nombre}
              </h1>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium border rounded-md shrink-0 bg-emerald-50 text-emerald-700 border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              OPERATIVO
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-slate-600 border-t border-slate-100">
            <div className="space-y-1">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Marca / Modelo</span>
              <div className="flex items-center gap-1.5 font-medium text-slate-700">
                <Laptop className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{equipo.marca} {equipo.modelo}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Categoría</span>
              <div className="flex items-center gap-1.5 font-medium text-slate-700">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{equipo.categoria?.nombre || "Sin categoría"}</span>
              </div>
            </div>

            <div className="space-y-1 col-span-2">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Ubicación</span>
              <div className="flex items-center gap-1.5 font-medium text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-red-800 shrink-0" />
                <span>{equipo.ubicacion?.nombre || "Sonsonate"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Historial de Mantenimientos Reales */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-slate-700" />
              <h2 className="font-bold text-slate-800 text-sm">Historial de Mantenimientos</h2>
            </div>
            
            <button
              onClick={() => alert("Abrir formulario de nuevo mantenimiento")}
              className="flex items-center gap-1 bg-red-800 hover:bg-red-900 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Nuevo
            </button>
          </div>

          {historial.length === 0 ? (
            <div className="bg-white p-6 rounded-2xl text-center border border-slate-100 text-slate-400 text-xs">
              Este equipo no registra mantenimientos aún.
            </div>
          ) : (
            <div className="space-y-3">
              {historial.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-2.5"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span 
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          item.tipo === "PREVENTIVO" 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {item.tipo}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        #{String(item.numeroReporte).padStart(4, '0')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-400 text-xs">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(item.fecha).toISOString().split('T')[0]}</span>
                    </div>
                  </div>

                  {/* Detalle del Trabajo */}
                  <div className="text-xs text-slate-700 space-y-1">
                    <p className="font-medium text-slate-800">{item.actividadesRealizadas}</p>
                    {item.descripcionFalla && (
                      <p className="text-slate-500 text-[11px]">Falla: {item.descripcionFalla}</p>
                    )}
                  </div>

                  {/* Técnico y Costo */}
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.responsableNombre}</span>
                    </div>
                    <span className="font-mono font-semibold text-slate-800">
                      ${Number(item.costo).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}