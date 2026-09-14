import { useState, useEffect, useRef } from "react";
import { X, Loader2 } from "lucide-react";
import { 
  crearEquipo, 
  actualizarEquipo, 
  type CrearEquipoDTO 
} from "../../services/equipos.service";
import type { Ubicacion } from "../../types/Ubicacion";
import type { Categoria } from "../../types/Categoria";
import type { Equipo } from "../../types/Equipo";
import { obtenerUbicaciones } from "../../services/ubicaciones.service";
import { obtenerCategorias } from "../../services/categorias.service";
import { normalizeApiError, type UiError } from "../../services/problem-details";
import { ErrorDialog } from "./ErrorDialog";
import { runSingleSubmit } from "../../utils/single-submit";

import { fechaActualLocal, validarFechaAdquisicion } from "../../utils/fechas";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onEquipoCreado: () => void;
  equipoAEditar?: Equipo | null;
}

const estadoInicial: CrearEquipoDTO = {
  codigoInventario: "",
  nombre: "",
  marca: "",
  modelo: "",
  serialEquipo: "",
  estado: "ACTIVO",
  fechaAdquisicion: fechaActualLocal(),
  ubicacionId: "",
  categoriaId: "",
};

export function ModalCrearEquipo({ 
  isOpen, 
  onClose, 
  onEquipoCreado, 
  equipoAEditar 
}: Props) {
  const [formData, setFormData] = useState<CrearEquipoDTO>(estadoInicial);
  const [guardando, setGuardando] = useState(false);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargandoRelaciones, setCargandoRelaciones] = useState(false);
  const [submitError, setSubmitError] = useState<UiError | null>(null);
  const submittingRef = useRef(false);

  // Cerrar con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !submitError) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, submitError]);

  // Carga de selects (Categorías y Ubicaciones)
  useEffect(() => {
    if (isOpen) {
      const cargarDatos = async () => {
        setCargandoRelaciones(true);
        try {
          const [dataUbicaciones, dataCategorias] = await Promise.all([
            obtenerUbicaciones(),
            obtenerCategorias(),
          ]);
          setUbicaciones(dataUbicaciones);
          setCategorias(dataCategorias);
        } catch (err) {
          console.error("Error al cargar datos de ubicación o categoría:", err);
        } finally {
          setCargandoRelaciones(false);
        }
      };

      cargarDatos();
    }
  }, [isOpen]);

  // Sincronizar campos del formulario (Crear vs Editar)
  useEffect(() => {
    if (equipoAEditar) {
      // El formulario conserva su estado durante errores y solo se reinicializa al cambiar el registro.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        codigoInventario: equipoAEditar.codigoInventario || "",
        nombre: equipoAEditar.nombre || "",
        marca: equipoAEditar.marca || "",
        modelo: equipoAEditar.modelo || "",
        serialEquipo: equipoAEditar.serialEquipo || "",
        estado: equipoAEditar.estado || "ACTIVO",
        fechaAdquisicion: equipoAEditar.fechaAdquisicion
          ? equipoAEditar.fechaAdquisicion.split("T")[0]
          : fechaActualLocal(),
        ubicacionId: equipoAEditar.ubicacion?.id || equipoAEditar.ubicacionId || "",
        categoriaId: equipoAEditar.categoria?.id || equipoAEditar.categoriaId || "",
      });
    } else {
      setFormData({ ...estadoInicial, fechaAdquisicion: fechaActualLocal() });
    }
  }, [equipoAEditar, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (submitError?.fieldErrors[e.target.name]) {
      setSubmitError((current) => current ? { ...current, fieldErrors: { ...current.fieldErrors, [e.target.name]: "" } } : null);
    }
  };

  const closeSubmitError = () => {
    const field = submitError?.field;
    setSubmitError(null);
    window.setTimeout(() => { if (field) document.getElementById(field)?.focus(); }, 0);
  };

  const saveEquipo = async () => {
    const errorFecha = validarFechaAdquisicion(formData.fechaAdquisicion);
    if (errorFecha) {
      setSubmitError({ title: "Revisa la fecha de adquisición", detail: errorFecha, code: "VALIDATION_ERROR", fieldErrors: { fechaAdquisicion: errorFecha }, field: "fechaAdquisicion", kind: "validation", canRetry: false });
      return;
    }
    try {
      await runSingleSubmit(submittingRef, setGuardando, async () => {
        setSubmitError(null);
        const payload: CrearEquipoDTO = {
          ...formData,
          ubicacionId: formData.ubicacionId ? formData.ubicacionId : null,
          marca: formData.marca ? formData.marca : "",
          modelo: formData.modelo ? formData.modelo : "",
          serialEquipo: formData.serialEquipo ? formData.serialEquipo : "",
        };
        if (equipoAEditar) await actualizarEquipo(equipoAEditar.id, payload);
        else await crearEquipo(payload);
        onEquipoCreado();
        onClose();
      });
    } catch (err) {
      setSubmitError(normalizeApiError(err));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void saveEquipo();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-equipo-titulo"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden border border-slate-100">
        
        {/* Encabezado fijo */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <h2 id="modal-equipo-titulo" className="text-base sm:text-lg font-bold text-slate-800">
            {equipoAEditar ? "Editar Equipo" : "Agregar Nuevo Equipo"}
          </h2>
          <button 
            type="button"
            onClick={onClose} 
            aria-label="Cerrar modal"
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario scrolleable */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            
            <div>
              <label htmlFor="codigoInventario" className="block text-xs font-medium text-slate-600 mb-1">
                Cód. Inventario *
              </label>
              <input
                id="codigoInventario"
                type="text"
                name="codigoInventario"
                required
                value={formData.codigoInventario}
                onChange={handleChange}
                aria-invalid={Boolean(submitError?.fieldErrors.codigoInventario || submitError?.field === "codigoInventario")}
                aria-describedby={submitError?.fieldErrors.codigoInventario ? "codigoInventario-error" : undefined}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700/20 focus:border-red-700"
              />
              {submitError?.fieldErrors.codigoInventario && <p id="codigoInventario-error" role="alert" className="mt-1 text-xs text-red-700">{submitError.fieldErrors.codigoInventario}</p>}
            </div>

            <div>
              <label htmlFor="nombre" className="block text-xs font-medium text-slate-600 mb-1">
                Nombre *
              </label>
              <input
                id="nombre"
                type="text"
                name="nombre"
                required
                value={formData.nombre}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700/20 focus:border-red-700"
              />
            </div>

            <div>
              <label htmlFor="marca" className="block text-xs font-medium text-slate-600 mb-1">
                Marca
              </label>
              <input
                id="marca"
                type="text"
                name="marca"
                value={formData.marca}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700/20 focus:border-red-700"
              />
            </div>

            <div>
              <label htmlFor="modelo" className="block text-xs font-medium text-slate-600 mb-1">
                Modelo
              </label>
              <input
                id="modelo"
                type="text"
                name="modelo"
                value={formData.modelo}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700/20 focus:border-red-700"
              />
            </div>

            <div>
              <label htmlFor="serialEquipo" className="block text-xs font-medium text-slate-600 mb-1">
                Nº Serie
              </label>
              <input
                id="serialEquipo"
                type="text"
                name="serialEquipo"
                value={formData.serialEquipo}
                onChange={handleChange}
                aria-invalid={Boolean(submitError?.fieldErrors.serialEquipo || submitError?.field === "serialEquipo")}
                aria-describedby={submitError?.fieldErrors.serialEquipo ? "serialEquipo-error" : undefined}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700/20 focus:border-red-700"
              />
              {submitError?.fieldErrors.serialEquipo && <p id="serialEquipo-error" role="alert" className="mt-1 text-xs text-red-700">{submitError.fieldErrors.serialEquipo}</p>}
            </div>

            <div>
              <label htmlFor="estado" className="block text-xs font-medium text-slate-600 mb-1">
                Estado
              </label>
              <select
                id="estado"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-700/20 focus:border-red-700"
              >
                <option value="ACTIVO">ACTIVO</option>
                <option value="EN_MANTENIMIENTO">EN MANTENIMIENTO</option>
                <option value="DADO_DE_BAJA">DADO DE BAJA</option>
              </select>
            </div>

            <div>
              <label htmlFor="fechaAdquisicion" className="block text-xs font-medium text-slate-600 mb-1">
                F. Adquisición *
              </label>
              <input
                id="fechaAdquisicion"
                type="date"
                name="fechaAdquisicion" max={fechaActualLocal()}
                required
                value={formData.fechaAdquisicion}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700/20 focus:border-red-700"
              />
            </div>

            {/* Selector de Categoría */}
            <div>
              <label htmlFor="categoriaId" className="block text-xs font-medium text-slate-600 mb-1">
                Categoría *
              </label>
              <select
                id="categoriaId"
                name="categoriaId"
                required
                value={formData.categoriaId || ""}
                onChange={handleChange}
                disabled={cargandoRelaciones}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-700/20 focus:border-red-700 disabled:bg-slate-100"
              >
                <option value="" disabled>
                  {cargandoRelaciones ? "Cargando..." : "Selecciona categoría"}
                </option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Selector de Ubicación */}
            <div>
              <label htmlFor="ubicacionId" className="block text-xs font-medium text-slate-600 mb-1">
                Ubicación
              </label>
              <select
                id="ubicacionId"
                name="ubicacionId"
                value={formData.ubicacionId || ""}
                onChange={handleChange}
                disabled={cargandoRelaciones}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-700/20 focus:border-red-700 disabled:bg-slate-100"
              >
                <option value="">
                  {cargandoRelaciones ? "Cargando..." : "Sin ubicación"}
                </option>
                {ubicaciones.map((ubi) => (
                  <option key={ubi.id} value={ubi.id}>
                    {ubi.nombre} {ubi.edificio ? `(${ubi.edificio})` : ""}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Footer de Acciones */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-red-800 hover:bg-red-900 rounded-xl disabled:opacity-50 transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700"
            >
              {guardando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : equipoAEditar ? (
                "Actualizar"
              ) : (
                "Guardar"
              )}
            </button>
          </div>
        </form>

      </div>
      <ErrorDialog error={submitError} onClose={closeSubmitError} onRetry={() => void saveEquipo()} />
    </div>
  );
}
