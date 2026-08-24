import { useState, useEffect } from "react";
import { X, Loader2, MapPin } from "lucide-react";
import { 
  crearUbicacion, 
  actualizarUbicacion, 
  type CrearUbicacionDTO 
} from "../../services/ubicaciones.service";
import type { Ubicacion } from "../../types/Ubicacion";

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
  const [error, setError] = useState<string | null>(null);

  // Cerrar con la tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !guardando) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, guardando]);

  // Sincronizar datos del formulario
  useEffect(() => {
    if (isOpen) {
      setError(null);
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    
    try {
      if (ubicacionAEditar) {
        await actualizarUbicacion(ubicacionAEditar.id, formData);
      } else {
        await crearUbicacion(formData);
      }
      
      onUbicacionGuardada();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Error al procesar la ubicación.";
      setError(msg);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-ubicacion-titulo"
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden border border-slate-100">
        
        {/* Encabezado Fijo */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-800" />
            <h2 id="modal-ubicacion-titulo" className="text-base sm:text-lg font-bold text-slate-800">
              {ubicacionAEditar ? "Editar Ubicación" : "Agregar Nueva Ubicación"}
            </h2>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            aria-label="Cerrar modal"
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario Scrolleable */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 text-xs bg-red-50 text-red-700 rounded-xl border border-red-100 font-medium">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="nombre" className="block text-xs font-semibold text-slate-600 uppercase mb-1">
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
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-800 focus:ring-2 focus:ring-red-800/20"
            />
          </div>

          <div>
            <label htmlFor="edificio" className="block text-xs font-semibold text-slate-600 uppercase mb-1">
              Edificio (Opcional)
            </label>
            <input
              id="edificio"
              type="text"
              name="edificio"
              placeholder="Ej. Masferrer/Salarrué"
              value={formData.edificio || ""}
              onChange={handleChange}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-800 focus:ring-2 focus:ring-red-800/20"
            />
          </div>

          {/* Acciones de Pie Fijo */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-800 hover:bg-red-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm disabled:opacity-50 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700"
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
    </div>
  );
}