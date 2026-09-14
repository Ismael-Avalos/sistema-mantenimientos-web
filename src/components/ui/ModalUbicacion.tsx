import { useState, useEffect, useRef } from "react";
import { X, Loader2, MapPin } from "lucide-react";
import { 
  crearUbicacion, 
  actualizarUbicacion, 
  type CrearUbicacionDTO 
} from "../../services/ubicaciones.service";
import type { Ubicacion } from "../../types/Ubicacion";
import { ErrorDialog } from "./ErrorDialog";
import { normalizeApiError, type UiError } from "../../services/problem-details";
import { runSingleSubmit } from "../../utils/single-submit";

interface ModalUbicacionProps {
  isOpen: boolean;
  onClose: () => void;
  onUbicacionGuardada: () => void;
  ubicacionAEditar?: Ubicacion | null;
}

export function ModalUbicacion({ 
  isOpen, 
  onClose, 
  onUbicacionGuardada, 
  ubicacionAEditar 
}: ModalUbicacionProps) {
  
  const [formData, setFormData] = useState<CrearUbicacionDTO>({
    nombre: "",
    edificio: "",
  });

  const [guardando, setGuardando] = useState(false);
  const [submitError, setSubmitError] = useState<UiError | null>(null);
  const submittingRef = useRef(false);

  // Cerrar con la tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !guardando && !submitError) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, guardando, submitError]);

  // Sincronizar datos del formulario
  useEffect(() => {
    if (isOpen) {
      // El formulario conserva su estado durante errores y solo se reinicializa al abrir/cambiar registro.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSubmitError(null);
      if (ubicacionAEditar) {
        setFormData({
          nombre: ubicacionAEditar.nombre,
          edificio: ubicacionAEditar.edificio || "",
        });
      } else {
        setFormData({ nombre: "", edificio: "" });
      }
    }
  }, [ubicacionAEditar, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (submitError?.fieldErrors[e.target.name]) setSubmitError((current) => current ? { ...current, fieldErrors: { ...current.fieldErrors, [e.target.name]: "" } } : null);
  };

  const closeSubmitError = () => {
    const field = submitError?.field;
    setSubmitError(null);
    window.setTimeout(() => { if (field) document.getElementById(field)?.focus(); }, 0);
  };

  const saveUbicacion = async () => {
    try {
      await runSingleSubmit(submittingRef, setGuardando, async () => {
        setSubmitError(null);
        if (ubicacionAEditar) await actualizarUbicacion(ubicacionAEditar.id, formData);
        else await crearUbicacion(formData);
        onUbicacionGuardada();
        onClose();
      });
    } catch (err) {
      setSubmitError(normalizeApiError(err, { defaultField: "nombre" }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); void saveUbicacion(); };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-ubicacion-titulo"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden border border-slate-100 dark:border-slate-800">
        
        {/* Encabezado Fijo */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-800 dark:text-red-300" />
            <h2 id="modal-ubicacion-titulo" className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
              {ubicacionAEditar ? "Editar Ubicación" : "Agregar Nueva Ubicación"}
            </h2>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            aria-label="Cerrar modal"
            className="p-2 text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 dark:focus-visible:ring-red-400 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario Scrolleable */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label htmlFor="nombre" className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">
              Nombre / Unidad *
            </label>
            <input
              id="nombre"
              type="text"
              name="nombre"
              required
              placeholder="Ej. CC1/Bienestar Estudiantil"
              value={formData.nombre}
              onChange={handleChange}
              aria-invalid={Boolean(submitError?.fieldErrors.nombre || submitError?.field === "nombre")}
              aria-describedby={submitError?.fieldErrors.nombre ? "nombre-ubicacion-error" : undefined}
              className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-red-800 focus:ring-2 focus:ring-red-800/20 dark:focus:ring-red-400/20"
            />
            {submitError?.fieldErrors.nombre && <p id="nombre-ubicacion-error" role="alert" className="mt-1 text-xs text-red-700 dark:text-red-300">{submitError.fieldErrors.nombre}</p>}
          </div>

          <div>
            <label htmlFor="edificio" className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">
              Edificio (Opcional)
            </label>
            <input
              id="edificio"
              type="text"
              name="edificio"
              placeholder="Ej. Masferrer/Salarrué"
              value={formData.edificio || ""}
              onChange={handleChange}
              className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-red-800 focus:ring-2 focus:ring-red-800/20 dark:focus:ring-red-400/20"
            />
          </div>

          {/* Acciones de Pie Fijo */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-800 hover:bg-red-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm disabled:opacity-50 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 dark:focus-visible:ring-red-400"
            >
              {guardando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                ubicacionAEditar ? "Actualizar Ubicación" : "Guardar Ubicación"
              )}
            </button>
          </div>
        </form>

      </div>
      <ErrorDialog error={submitError} onClose={closeSubmitError} onRetry={() => void saveUbicacion()} />
    </div>
  );
}
