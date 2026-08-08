import { useState, useEffect } from "react";
import { X, Loader2, MapPin } from "lucide-react";
// Importamos también el servicio de actualizar y la interfaz Ubicacion
import { 
  crearUbicacion, 
  actualizarUbicacion, 
  type CrearUbicacionDTO 
} from "../../services/ubicaciones.service";
import type { Ubicacion } from "../../types/Ubicacion";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUbicacionGuardada: () => void; // Nombre genérico (sirve para cuando crea o edita)
  ubicacionAEditar?: Ubicacion | null; // <--- 1. PASO CLAVE: Si es null/undefined = Crear, si viene con objeto = Editar
}

export function ModalUbicacion({ 
  isOpen, 
  onClose, 
  onUbicacionGuardada, 
  ubicacionAEditar 
}: Props) {
  
  const [formData, setFormData] = useState<CrearUbicacionDTO>({
    nombre: "",
    edificio: "",
  });

  const [guardando, setGuardando] = useState(false);

  // <--- 2. PASO CLAVE: useEffect para sincronizar el formulario
  // Esto se ejecuta cada vez que 'isOpen' cambia a true o cambia 'ubicacionAEditar'
  useEffect(() => {
    if (ubicacionAEditar) {
      // Si estamos editando, rellenamos los campos con los datos existentes
      setFormData({
        nombre: ubicacionAEditar.nombre,
        edificio: ubicacionAEditar.edificio || "",
      });
    } else {
      // Si es una creación nueva, reseteamos a campos vacíos
      setFormData({ nombre: "", edificio: "" });
    }
  }, [ubicacionAEditar, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // <--- 3. PASO CLAVE: Decidir si llamar a POST o PUT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    
    try {
      if (ubicacionAEditar) {
        // MODO EDITAR
        await actualizarUbicacion(ubicacionAEditar.id, formData);
      } else {
        // MODO CREAR
        await crearUbicacion(formData);
      }
      
      onUbicacionGuardada(); // Avisamos a la vista principal para recargar la lista
      onClose();             // Cerramos el modal
    } catch (err) {
      console.error("Error al procesar ubicación:", err);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
        
        {/* Header Modal - Cambia dinámicamente el título */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-800" />
            <h2 className="text-lg font-bold text-slate-800">
              {ubicacionAEditar ? "Editar Ubicación" : "Agregar Nueva Ubicación"}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Nombre / Unidad</label>
            <input
              type="text"
              name="nombre"
              required
              placeholder="Ej. CC1/Bienestar Estudiantil"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Edificio (Opcional)</label>
            <input
              type="text"
              name="edificio"
              placeholder="Ej. Masferrer/Salarrue"
              value={formData.edificio || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-800 hover:bg-red-900 rounded-lg disabled:opacity-50 transition-colors"
            >
              {guardando ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                // Cambia dinámicamente el texto del botón
                ubicacionAEditar ? "Actualizar" : "Guardar"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}