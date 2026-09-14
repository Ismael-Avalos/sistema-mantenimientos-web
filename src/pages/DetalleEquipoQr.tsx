import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
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
  DollarSign,
  Clock,
  ChevronRight,
  Barcode,
  Hash,
  Pencil,
  Trash2,
  CheckCircle2
} from "lucide-react";

import { obtenerEquipoPorQrUuid } from "../services/equipos.service";
import { eliminarMantenimiento, obtenerMantenimientosPorQrUuid } from "../services/mantenimiento.service";
import { getSafeErrorMessage } from "../services/problem-details";
import { ModalCrearMantenimiento } from "../components/ui/ModalCrearMantenimiento";
import { ModalEditarMantenimiento } from "../components/ui/ModalEditarMantenimiento";
import { ModalConfirmar } from "../components/ui/ModalConfirmar";
import { useAuth } from "../hooks/useAuth";
import { hasRole } from "../utils/roles";
import type { Equipo } from "../types/Equipo";
import type { MaintenanceResponse } from "../types/Maintenance";
import { BotonesReporte } from '../components/ui/BotonesReporte';

export function DetalleEquipoQr() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [equipo, setEquipo] = useState<Equipo | null>(null);
  const [historial, setHistorial] = useState<MaintenanceResponse[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editando, setEditando] = useState<MaintenanceResponse | null>(null);
  const [eliminando, setEliminando] = useState<MaintenanceResponse | null>(null);
  const [procesandoEliminacion, setProcesandoEliminacion] = useState(false);
  const [notificacion, setNotificacion] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  const puedeEditar = hasRole(user?.rol, ['ADMIN', 'TECNICO']);
  const puedeEliminar = hasRole(user?.rol, ['ADMIN']);

  useEffect(() => {
    if (!notificacion) return;
    const timeout = window.setTimeout(() => setNotificacion(null), 4500);
    return () => window.clearTimeout(timeout);
  }, [notificacion]);

  const confirmarEliminacion = async () => {
    if (!eliminando || !puedeEliminar) return;
    try {
      setProcesandoEliminacion(true);
      await eliminarMantenimiento(eliminando.id);
      setHistorial((actual) => actual.filter((item) => item.id !== eliminando.id));
      setEliminando(null);
      setNotificacion({ tipo: 'ok', texto: 'Mantenimiento eliminado correctamente.' });
    } catch (err) {
      setNotificacion({ tipo: 'error', texto: getSafeErrorMessage(err, 'No se pudo eliminar el mantenimiento.') });
    } finally { setProcesandoEliminacion(false); }
  };

  const cargarDatos = useCallback(async () => {
    if (!uuid) {
      setCargando(false);
      setError("Identificador UUID no proporcionado.");
      return;
    }

    setCargando(true);
    setError(null);

    try {
      const [datosEquipo, listaMantenimientos] = await Promise.all([
        obtenerEquipoPorQrUuid(uuid),
        obtenerMantenimientosPorQrUuid(uuid)
      ]);

      setEquipo(datosEquipo);
      setHistorial(listaMantenimientos || []);
    } catch (err: unknown) {
      console.error("Error al obtener la información:", err);
      setError("No se pudo cargar la información del equipo o no existe.");
    } finally {
      setCargando(false);
    }
  }, [uuid]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Resumen operativo calculado dinámicamente desde el historial
  const totalMantenimientos = historial.length;
  const costoAcumulado = historial.reduce((acc, item) => acc + Number(item.costo || 0), 0);
  
  const ultimaAtencion = historial.length > 0
    ? [...historial].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())[0].fecha
    : null;

  const formatearFecha = (fechaStr?: string | null) => {
    if (!fechaStr) return "Sin registros";
    const fecha = new Date(fechaStr);
    if (isNaN(fecha.getTime())) return "Sin registros";
    return fecha.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const formatearMoneda = (monto: number) => {
    return new Intl.NumberFormat("es-SV", {
      style: "currency",
      currency: "USD"
    }).format(monto);
  };

  const obtenerBadgesEstado = (estado?: string) => {
    const estadoNormalizado = estado?.toUpperCase() || "";
    switch (estadoNormalizado) {
      case "OPERATIVO":
      case "ACTIVO":
      case "BUENO":
        return {
          clases: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900",
          dot: "bg-emerald-500"
        };
      case "EN_MANTENIMIENTO":
      case "REPARACION":
      case "REVISION":
        return {
          clases: "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900",
          dot: "bg-amber-500"
        };
      case "INOPERATIVO":
      case "BAJA":
      case "DANADO":
        return {
          clases: "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900",
          dot: "bg-rose-500"
        };
      default:
        return {
          clases: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700",
          dot: "bg-slate-400"
        };
    }
  };

  if (cargando) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-red-700 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Cargando ficha del activo...</p>
        </div>
      </div>
    );
  }

  if (error || !equipo) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4 text-center">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-sm w-full space-y-4 shadow-sm">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Equipo no encontrado</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{error || "Sin registros"}</p>
          <button
            onClick={() => navigate({ pathname: "/equipos", search: location.search })}
            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white text-xs px-4 py-2 rounded-xl font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a equipos
          </button>
        </div>
      </div>
    );
  }

  const badgeInfo = obtenerBadgesEstado(equipo.estado);

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4 sm:p-6 text-slate-800 dark:text-slate-100">
      {notificacion && <div role="status" className={`fixed right-4 top-4 z-[60] flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-xl border px-4 py-3 text-sm shadow-lg ${notificacion.tipo === 'ok' ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300' : 'border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-300'}`}><CheckCircle2 className="h-4 w-4 shrink-0" />{notificacion.texto}</div>}
      {/* Botón de navegación explícita a la lista de equipos */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => navigate({ pathname: "/equipos", search: location.search })}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-700 px-3.5 py-2 rounded-xl transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a equipos
        </button>

        <BotonesReporte obtenerDatos={() => ({ equipo, mantenimientos: historial })} />
      </div>

      {/* Grid Principal Adaptable */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna Izquierda: Ficha Técnica Completa */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 sm:p-6 shadow-sm space-y-6">
          {/* Encabezado con Nombre y Badge dinámico basado en equipo.estado */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
            <div className="space-y-1">
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-400">
                Ficha Técnica del Activo
              </span>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {equipo.nombre || "Sin nombre"}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Código de equipo: {equipo.codigoInventario || "Sin código"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold border rounded-full shrink-0 ${badgeInfo.clases}`}
              >
                <span className={`w-2 h-2 rounded-full ${badgeInfo.dot}`} />
                {equipo.estado ? equipo.estado.replace(/_/g, " ") : "Sin estado"}
              </span>
            </div>
          </div>

          {/* Ficha Técnica: Marca, Modelo, Serie, Categoría, Ubicación */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-950/70 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 dark:text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                Marca / Modelo
              </span>
              <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
                <Laptop className="w-4 h-4 text-slate-400 dark:text-slate-400 shrink-0" />
                <span className="truncate">
                  {equipo.marca || equipo.modelo
                    ? `${equipo.marca || ""} ${equipo.modelo || ""}`.trim()
                    : "Sin datos"}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-950/70 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 dark:text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                Nº de Serie
              </span>
              <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200 font-mono">
                <Barcode className="w-4 h-4 text-slate-400 dark:text-slate-400 shrink-0" />
                <span className="truncate">{equipo.serialEquipo || "Sin serie"}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-950/70 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 dark:text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                Categoría
              </span>
              <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
                <Tag className="w-4 h-4 text-slate-400 dark:text-slate-400 shrink-0" />
                <span className="truncate">{equipo.categoria?.nombre || "Sin categoría"}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-950/70 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 dark:text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                Ubicación
              </span>
              <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
                <MapPin className="w-4 h-4 text-red-700 dark:text-red-300 shrink-0" />
                <span className="truncate">{equipo.ubicacion?.nombre || "Sin ubicación"}</span>
              </div>
            </div>
          </div>

          {/* Fecha de Adquisición */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-400" />
              <span>Fecha de Adquisición:</span>
              <strong className="text-slate-700 dark:text-slate-200 font-medium">
                {formatearFecha(equipo.fechaAdquisicion)}
              </strong>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Resumen Operativo Calculado */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 px-1">
            Resumen Operativo
          </h2>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-400">
                Mantenimientos Realizados
              </p>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
                {totalMantenimientos}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-100 dark:border-red-900 flex items-center justify-center text-red-700 dark:text-red-300">
              <Wrench className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-400">
                Costo Acumulado
              </p>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
                {formatearMoneda(costoAcumulado)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-400">
                Última Atención
              </p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">
                {formatearFecha(ultimaAtencion)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Historial de Mantenimientos en Tarjetas */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-slate-700 dark:text-slate-200" />
            <h2 className="font-bold text-slate-800 dark:text-slate-100 text-base">
              Historial de Mantenimientos
            </h2>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 bg-red-700 hover:bg-red-800 text-white text-xs px-3.5 py-2 rounded-xl font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-red-700 dark:focus:ring-red-400"
          >
            <Plus className="w-4 h-4" />
            Nuevo Registro
          </button>
        </div>

        {historial.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl text-center border border-slate-200 dark:border-slate-700 space-y-2">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Sin registros</p>
            <p className="text-xs text-slate-400 dark:text-slate-400">
              Este equipo no registra mantenimientos aún.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {historial.map((item) => (
              <article
                key={item.id}
                className="group flex flex-col justify-between space-y-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm transition-all hover:border-red-200 dark:hover:border-red-900 hover:shadow-md sm:p-5"
              >
                <Link to={{ pathname: `/equipos/${uuid}/mantenimientos/${item.id}`, search: location.search }} className="space-y-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700 dark:focus:ring-red-400">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${
                          item.tipo === "PREVENTIVO"
                            ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900"
                            : "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900"
                        }`}
                      >
                        {item.tipo || "GENERAL"}
                      </span>
                      <span className="text-xs font-mono font-semibold text-slate-400 dark:text-slate-400 flex items-center gap-0.5">
                        <Hash className="w-3 h-3" />
                        {String(item.numeroReporte || 0).padStart(4, "0")}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-400 text-xs font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatearFecha(item.fecha)}</span>
                    </div>
                  </div>

                  {/* Descripción / Actividades */}
                  <div className="text-xs text-slate-700 dark:text-slate-200 space-y-1">
                    <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm group-hover:text-red-700 transition-colors">
                      {item.actividadesRealizadas || "Sin detalle de actividades"}
                    </p>
                    {item.descripcionFalla && (
                      <p className="text-slate-500 dark:text-slate-400 text-xs">
                        <strong className="font-semibold text-slate-600 dark:text-slate-300">Falla:</strong>{" "}
                        {item.descripcionFalla}
                      </p>
                    )}
                  </div>
                </Link>

                {/* Técnico, Costo y Chevron Clickeable */}
                <div className="flex flex-col gap-3 border-t border-slate-100 dark:border-slate-800 pt-3 text-xs sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
                    <UserCheck className="w-4 h-4 text-slate-400 dark:text-slate-400" />
                    <span className="truncate">{item.responsableNombre || "Sin responsable"}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-800">
                      {formatearMoneda(Number(item.costo || 0))}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-400 group-hover:text-red-700 group-hover:translate-x-0.5 transition-all" />
                    {puedeEditar && <button type="button" onClick={() => setEditando(item)} className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 font-semibold text-slate-600 dark:text-slate-300 hover:border-red-200 dark:hover:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-700 dark:hover:text-red-300"><Pencil className="h-3.5 w-3.5" />Editar</button>}
                    {puedeEliminar && <button type="button" onClick={() => setEliminando(item)} className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-red-200 dark:border-red-900 px-2.5 py-1.5 font-semibold text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/50"><Trash2 className="h-3.5 w-3.5" />Eliminar</button>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Registro de Mantenimiento */}
      {equipo && (
        <ModalCrearMantenimiento
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          equipo={equipo}
          onMantenimientoCreado={cargarDatos}
        />
      )}
      {editando && <ModalEditarMantenimiento isOpen fechaAdquisicion={equipo.fechaAdquisicion} mantenimiento={editando} onClose={() => setEditando(null)} onActualizado={(actualizado) => { setHistorial((lista) => lista.map((item) => item.id === actualizado.id ? actualizado : item)); setNotificacion({ tipo: 'ok', texto: 'Mantenimiento actualizado correctamente.' }); }} />}
      <ModalConfirmar isOpen={Boolean(eliminando)} onClose={() => !procesandoEliminacion && setEliminando(null)} onConfirm={confirmarEliminacion} cargando={procesandoEliminacion} titulo="Eliminar mantenimiento" mensaje={eliminando ? `¿Desea eliminar permanentemente el mantenimiento #${eliminando.numeroReporte}? Esta acción también eliminará sus archivos adjuntos.` : ''} textoConfirmar="Eliminar permanentemente" />
    </div>
  );
}
