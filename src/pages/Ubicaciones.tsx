import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Loader2, MapPin, Building2, Pencil, Trash2 } from "lucide-react";
import { obtenerUbicaciones, eliminarUbicacion } from "../services/ubicaciones.service";
import { ModalUbicacion } from "../components/ui/ModalUbicacion";
import { ModalConfirmar } from "../components/ui/ModalConfirmar";
import type { Ubicacion } from "../types/Ubicacion";
import { useAuth } from "@/hooks/useAuth";
import { hasRole } from "@/utils/roles";

function Ubicaciones() {
  const { user } = useAuth();
  const esAdmin = hasRole(user?.rol, ["ADMIN"]);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [searchParams] = useSearchParams();
  const [cargando, setCargando] = useState(true);

  // Estados para modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ubicacionAEditar, setUbicacionAEditar] = useState<Ubicacion | null>(null);

  const [ubicacionAEliminar, setUbicacionAEliminar] = useState<Ubicacion | null>(null);
  const [eliminando, setEliminando] = useState(false);

  const cargar = async () => {
    setCargando(true);
    try {
      const datos = await obtenerUbicaciones();
      setUbicaciones(datos);
    } catch (error) {
      console.error("Error al cargar ubicaciones:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const consulta = searchParams.get("q")?.trim() ?? "";
  const normalizarTexto = (texto: string) =>
    texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es-SV");
  const ubicacionesFiltradas = ubicaciones.filter((ubicacion) =>
    normalizarTexto(ubicacion.nombre).includes(normalizarTexto(consulta))
  );

  const handleNuevaUbicacion = () => {
    setUbicacionAEditar(null);
    setIsModalOpen(true);
  };

  const handleEditar = (ubicacion: Ubicacion) => {
    setUbicacionAEditar(ubicacion);
    setIsModalOpen(true);
  };

  const handleConfirmarEliminar = async () => {
    if (!ubicacionAEliminar) return;
    setEliminando(true);
    try {
      await eliminarUbicacion(ubicacionAEliminar.id);
      await cargar();
      setUbicacionAEliminar(null);
    } catch (error) {
      console.error("Error al eliminar:", error);
    } finally {
      setEliminando(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Encabezado Responsivo */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">Ubicaciones</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Total registradas: {ubicaciones.length}</p>
        </div>

        {esAdmin && <button
          onClick={handleNuevaUbicacion}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-800 hover:bg-red-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 dark:focus-visible:ring-red-400"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Ubicación</span>
        </button>}
      </div>

      {/* Contenedor Principal */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        {cargando ? (
          <div className="flex justify-center p-8 text-red-800 dark:text-red-300">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : ubicacionesFiltradas.length === 0 ? (
          <div className="p-12 text-center text-slate-400 dark:text-slate-400">
            <MapPin className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">{consulta ? "No se encontraron ubicaciones con esa búsqueda." : "No hay ubicaciones registradas aún."}</p>
          </div>
        ) : (
          <>
            {/* VISTA MÓVIL (Tarjetas) */}
            <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {ubicacionesFiltradas.map((ubi) => (
                <div key={ubi.id} className="p-4 space-y-3 hover:bg-slate-50/50 dark:hover:bg-slate-950/50">
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-100 text-sm">
                        <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-400 shrink-0" />
                        <span>{ubi.nombre}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400 shrink-0" />
                        {ubi.edificio ? (
                          <span>{ubi.edificio}</span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-400 italic">Sin edificio asignado</span>
                        )}
                      </div>
                    </div>

                    {esAdmin && <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleEditar(ubi)}
                        className="p-2.5 text-slate-400 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:focus-visible:ring-blue-400"
                        title="Editar ubicación"
                        aria-label={`Editar ${ubi.nombre}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setUbicacionAEliminar(ubi)}
                        className="p-2.5 text-slate-400 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 dark:focus-visible:ring-red-400"
                        title="Eliminar ubicación"
                        aria-label={`Eliminar ${ubi.nombre}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>}
                  </div>
                </div>
              ))}
            </div>

            {/* VISTA ESCRITORIO (Tabla) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold">
                  <tr>
                    <th className="p-4">Nombre / Unidad</th>
                    <th className="p-4">Edificio</th>
                    {esAdmin && <th className="p-4 text-right">Acciones</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {ubicacionesFiltradas.map((ubi) => (
                    <tr key={ubi.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/50">
                      <td className="p-4 font-medium text-slate-800 dark:text-slate-100">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-400" />
                          <span>{ubi.nombre}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-300">
                        {ubi.edificio ? (
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-slate-400 dark:text-slate-400" />
                            <span>{ubi.edificio}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-400 italic text-xs">Sin edificio asignado</span>
                        )}
                      </td>
                      {esAdmin && <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEditar(ubi)}
                            className="p-2 text-slate-400 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:focus-visible:ring-blue-400"
                            title="Editar ubicación"
                            aria-label={`Editar ${ubi.nombre}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setUbicacionAEliminar(ubi)}
                            className="p-2 text-slate-400 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 dark:focus-visible:ring-red-400"
                            title="Eliminar ubicación"
                            aria-label={`Eliminar ${ubi.nombre}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modales */}
      {esAdmin && <ModalUbicacion
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUbicacionGuardada={cargar}
        ubicacionAEditar={ubicacionAEditar}
      />}

      {esAdmin && <ModalConfirmar
        isOpen={!!ubicacionAEliminar}
        onClose={() => setUbicacionAEliminar(null)}
        onConfirm={handleConfirmarEliminar}
        titulo="Eliminar Ubicación"
        mensaje={`¿Estás seguro de que deseas eliminar la ubicación "${ubicacionAEliminar?.nombre}"?`}
        cargando={eliminando}
      />}
    </div>
  );
}

export default Ubicaciones;
