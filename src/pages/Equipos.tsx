import { useEffect, useState } from "react";
import { Plus, Loader2, Tag, MapPin, Laptop, Pencil, Trash2, QrCode } from "lucide-react";
import { obtenerEquipos, eliminarEquipo } from "../services/equipos.service";
import { ModalCrearEquipo } from "../components/ui/ModalCrearEquipo";
import { ModalConfirmar } from "../components/ui/ModalConfirmar";
import { ModalQrEquipo } from "../components/ui/ModalQrEquipo"; // Modal QR
import { getEstadoBadge } from "../utils/formatters";
import type { Equipo } from "../types/Equipo";

function Equipos() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [cargando, setCargando] = useState(true);

  // Estados de modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [equipoAEditar, setEquipoAEditar] = useState<Equipo | null>(null);
  const [equipoAEliminar, setEquipoAEliminar] = useState<Equipo | null>(null);
  const [eliminando, setEliminando] = useState(false);

  // Estado para el modal de QR
  const [equipoParaQr, setEquipoParaQr] = useState<Equipo | null>(null);

  const cargar = async () => {
    setCargando(true);
    try {
      const datos = await obtenerEquipos();
      setEquipos(datos);
    } catch (error) {
      console.error("Error al cargar equipos:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleNuevoEquipo = () => {
    setEquipoAEditar(null);
    setIsModalOpen(true);
  };

  const handleEditar = (equipo: Equipo) => {
    setEquipoAEditar(equipo);
    setIsModalOpen(true);
  };

  const handleConfirmarEliminar = async () => {
    if (!equipoAEliminar) return;
    setEliminando(true);
    try {
      await eliminarEquipo(equipoAEliminar.id);
      await cargar();
      setEquipoAEliminar(null);
    } catch (error) {
      console.error("Error al eliminar equipo:", error);
    } finally {
      setEliminando(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Equipos</h1>
          <p className="text-xs text-slate-500">Total registrados: {equipos.length}</p>
        </div>

        <button
          onClick={handleNuevoEquipo}
          className="flex items-center gap-2 bg-red-800 hover:bg-red-900 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Agregar Equipo
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {cargando ? (
          <div className="flex justify-center p-8 text-red-800">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : equipos.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Laptop className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No hay equipos registrados aún.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="p-4">Código</th>
                  <th className="p-4">Nombre</th>
                  <th className="p-4">Categoría</th>
                  <th className="p-4">Marca / Modelo</th>
                  <th className="p-4">Ubicación</th>
                  <th className="p-4">Serie</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {equipos.map((equipo) => {
                  const badge = getEstadoBadge(equipo.estado);

                  return (
                    <tr key={equipo.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-mono font-medium text-red-800">
                        {equipo.codigoInventario}
                      </td>

                      <td className="p-4 font-medium text-slate-800">
                        {equipo.nombre}
                      </td>

                      <td className="p-4">
                        {equipo.categoria ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg">
                            <Tag className="w-3.5 h-3.5 text-slate-400" />
                            {equipo.categoria.nombre}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-xs">Sin categoría</span>
                        )}
                      </td>

                      <td className="p-4 text-slate-600">
                        {equipo.marca} - {equipo.modelo}
                      </td>

                      <td className="p-4 text-slate-600">
                        {equipo.ubicacion ? (
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <MapPin className="w-3.5 h-3.5 text-red-800 shrink-0" />
                            <span>
                              {equipo.ubicacion.nombre}
                              {equipo.ubicacion.edificio && (
                                <span className="text-xs text-slate-400 ml-1">
                                  ({equipo.ubicacion.edificio})
                                </span>
                              )}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-xs">Sin ubicación</span>
                        )}
                      </td>

                      <td className="p-4 font-mono text-slate-500 text-xs">
                        {equipo.serialEquipo}
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border rounded-md ${badge.badgeStyle}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dotColor}`} />
                          {badge.label}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* Botón QR */}
                          <button
                            onClick={() => setEquipoParaQr(equipo)}
                            className="p-1.5 text-slate-400 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Ver / Descargar Código QR"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleEditar(equipo)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar equipo"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setEquipoAEliminar(equipo)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar equipo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Crear / Editar */}
      <ModalCrearEquipo
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onEquipoCreado={cargar}
        equipoAEditar={equipoAEditar}
      />

      {/* Modal Confirmar Eliminación */}
      <ModalConfirmar
        isOpen={!!equipoAEliminar}
        onClose={() => setEquipoAEliminar(null)}
        onConfirm={handleConfirmarEliminar}
        titulo="Eliminar Equipo"
        mensaje={`¿Estás seguro de que deseas eliminar el equipo "${equipoAEliminar?.nombre}" (${equipoAEliminar?.codigoInventario})?`}
        cargando={eliminando}
      />

      {/* Modal Ver / Descargar QR */}
      <ModalQrEquipo
        isOpen={!!equipoParaQr}
        onClose={() => setEquipoParaQr(null)}
        equipo={equipoParaQr}
      />
    </div>
  );
}

export default Equipos;