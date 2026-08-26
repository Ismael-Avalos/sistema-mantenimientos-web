import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { Plus, Loader2, Tag, MapPin, Laptop, Pencil, Trash2, QrCode, ChevronLeft, ChevronRight } from "lucide-react";
import { obtenerEquipos, eliminarEquipo } from "../services/equipos.service";
import { ModalCrearEquipo } from "../components/ui/ModalCrearEquipo";
import { ModalConfirmar } from "../components/ui/ModalConfirmar";
import { ModalQrEquipo } from "../components/ui/ModalQrEquipo";
import { getEstadoBadge } from "../utils/formatters";
import type { Equipo } from "../types/Equipo";

function Equipos() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [cargando, setCargando] = useState(true);

  // Estados de paginación local
  const [paginaActual, setPaginaActual] = useState(1);
  const [elementosPorPagina, setElementosPorPagina] = useState(10);

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

  const consulta = searchParams.get("q")?.trim() ?? "";
  const normalizarTexto = (texto: string) =>
    texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es-SV");
  const consultaNormalizada = normalizarTexto(consulta);
  const equiposFiltrados = equipos.filter((equipo) =>
    normalizarTexto(equipo.nombre).includes(consultaNormalizada) ||
    normalizarTexto(equipo.codigoInventario).includes(consultaNormalizada)
  );

  useEffect(() => {
    setPaginaActual(1);
  }, [consulta]);

  // Cálculos de paginación sobre los resultados filtrados
  const totalEquipos = equiposFiltrados.length;
  const totalPaginas = Math.ceil(totalEquipos / elementosPorPagina) || 1;

  // Ajuste automático si la eliminación deja vacía la página actual
  useEffect(() => {
    if (paginaActual > totalPaginas) {
      setPaginaActual(totalPaginas);
    }
  }, [totalPaginas, paginaActual]);

  const indiceInicial = (paginaActual - 1) * elementosPorPagina;
  const indiceFinal = Math.min(indiceInicial + elementosPorPagina, totalEquipos);
  const equiposPaginados = equiposFiltrados.slice(indiceInicial, indiceFinal);
  const enlaceDetalleEquipo = (uuid: string) => ({ pathname: `/equipos/${uuid}`, search: location.search });

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

  const handleCambioTamanoPagina = (nuevoTamano: number) => {
    setElementosPorPagina(nuevoTamano);
    setPaginaActual(1);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Equipos</h1>
          <p className="text-xs text-slate-500">Total registrados: {equipos.length}</p>
        </div>

        <button
          type="button"
          onClick={handleNuevoEquipo}
          className="flex items-center justify-center gap-2 bg-red-800 hover:bg-red-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Equipo</span>
        </button>
      </div>

      {/* Contenedor Principal (Tarjetas en móvil / Tabla en Desktop) */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {cargando ? (
          <div className="flex justify-center p-8 sm:p-12 text-red-800">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : totalEquipos === 0 ? (
          <div className="p-8 sm:p-12 text-center text-slate-400">
            <Laptop className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">{consulta ? "No se encontraron equipos con esa búsqueda." : "No hay equipos registrados aún."}</p>
          </div>
        ) : (
          <>
            {/* Vista Móvil (Tarjetas) */}
            <div className="block md:hidden divide-y divide-slate-100">
              {equiposPaginados.map((equipo) => {
                const badge = getEstadoBadge(equipo.estado);

                return (
                  <div key={equipo.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          to={enlaceDetalleEquipo(equipo.qrUuid)}
                          className="font-mono text-xs font-semibold text-red-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 rounded px-0.5 inline-block"
                        >
                          {equipo.codigoInventario}
                        </Link>
                        <h2 className="font-bold text-slate-800 text-sm">
                          <Link
                            to={enlaceDetalleEquipo(equipo.qrUuid)}
                            className="hover:text-red-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 rounded px-0.5"
                          >
                            {equipo.nombre}
                          </Link>
                        </h2>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium border rounded-md shrink-0 ${badge.badgeStyle}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dotColor}`} />
                        {badge.label}
                      </span>
                    </div>

                    <div className="text-xs space-y-1.5 text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Marca / Modelo:</span>
                        <span className="font-medium text-slate-700">{equipo.marca} - {equipo.modelo}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Serie:</span>
                        <span className="font-mono text-slate-700">{equipo.serialEquipo || "N/A"}</span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-400">Categoría:</span>
                        {equipo.categoria ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-slate-700 bg-slate-100 rounded-lg">
                            <Tag className="w-3 h-3 text-slate-400" />
                            {equipo.categoria.nombre}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Sin categoría</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-400">Ubicación:</span>
                        {equipo.ubicacion ? (
                          <div className="flex items-center gap-1 text-slate-700 truncate max-w-[200px]">
                            <MapPin className="w-3 h-3 text-red-800 shrink-0" />
                            <span className="truncate">
                              {equipo.ubicacion.nombre}
                              {equipo.ubicacion.edificio && ` (${equipo.ubicacion.edificio})`}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Sin ubicación</span>
                        )}
                      </div>
                    </div>

                    {/* Acciones Móviles */}
                    <div className="flex items-center justify-end gap-1 pt-2 border-t border-slate-50">
                      <button
                        type="button"
                        onClick={() => setEquipoParaQr(equipo)}
                        aria-label={`Ver código QR de ${equipo.nombre}`}
                        className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEditar(equipo)}
                        aria-label={`Editar equipo ${equipo.nombre}`}
                        className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setEquipoAEliminar(equipo)}
                        aria-label={`Eliminar equipo ${equipo.nombre}`}
                        className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Vista Escritorio (Tabla) */}
            <div className="hidden md:block overflow-x-auto">
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
                  {equiposPaginados.map((equipo) => {
                    const badge = getEstadoBadge(equipo.estado);

                    return (
                      <tr key={equipo.id} className="hover:bg-slate-50/50">
                        <td className="p-4 font-mono font-medium text-red-800">
                          <Link
                            to={enlaceDetalleEquipo(equipo.qrUuid)}
                            className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 rounded px-1 py-0.5 inline-block"
                          >
                            {equipo.codigoInventario}
                          </Link>
                        </td>

                        <td className="p-4 font-medium text-slate-800">
                          <Link
                            to={enlaceDetalleEquipo(equipo.qrUuid)}
                            className="hover:text-red-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 rounded px-1 py-0.5 inline-block"
                          >
                            {equipo.nombre}
                          </Link>
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
                            <button
                              type="button"
                              onClick={() => setEquipoParaQr(equipo)}
                              aria-label={`Ver código QR de ${equipo.nombre}`}
                              title="Ver / Descargar Código QR"
                              className="min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-400 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleEditar(equipo)}
                              aria-label={`Editar equipo ${equipo.nombre}`}
                              title="Editar equipo"
                              className="min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setEquipoAEliminar(equipo)}
                              aria-label={`Eliminar equipo ${equipo.nombre}`}
                              title="Eliminar equipo"
                              className="min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700"
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

            {/* Controles de Paginación */}
            <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto text-center sm:text-left">
                <span>
                  Mostrando <strong className="font-semibold text-slate-800">{totalEquipos > 0 ? indiceInicial + 1 : 0}</strong>–<strong className="font-semibold text-slate-800">{indiceFinal}</strong> de <strong className="font-semibold text-slate-800">{totalEquipos}</strong> equipos
                </span>

                <div className="flex items-center gap-2">
                  <label htmlFor="elementosPorPagina" className="text-slate-400">
                    Mostrar:
                  </label>
                  <select
                    id="elementosPorPagina"
                    value={elementosPorPagina}
                    onChange={(e) => handleCambioTamanoPagina(Number(e.target.value))}
                    className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-red-700/20"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="mr-2 text-slate-400">
                  Página <strong className="font-semibold text-slate-700">{paginaActual}</strong> de <strong className="font-semibold text-slate-700">{totalPaginas}</strong>
                </span>

                <button
                  type="button"
                  onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
                  disabled={paginaActual === 1}
                  aria-label="Página anterior"
                  className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:hover:bg-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))}
                  disabled={paginaActual >= totalPaginas}
                  aria-label="Página siguiente"
                  className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:hover:bg-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
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
