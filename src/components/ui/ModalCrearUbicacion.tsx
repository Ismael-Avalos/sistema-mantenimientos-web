import { useState } from "react";
import { X, Loader2, MapPin } from "lucide-react";
import { crearUbicacion, type CrearUbicacionDTO } from "../../services/ubicaciones.service";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUbicacionCreada: () => void;
}

export function ModalCrearUbicacion({ isOpen, onClose, onUbicacionCreada }: Props) {
  const [formData, setFormData] = useState<CrearUbicacionDTO>({
    nombre: "",
    edificio: "",
  });

  const [guardando, setGuardando] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await crearUbicacion(formData);
      onUbicacionCreada();
      setFormData({ nombre: "", edificio: "" }); // Limpiar formulario
      onClose();
    } catch (err) {
      console.error("Error al guardar ubicación:", err);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-800" />
            <h2 className="text-lg font-bold text-slate-800">Agregar Nueva Ubicación</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Nombre / Sala</label>
            <input
              type="text"
              name="nombre"
              required
              placeholder="Ej. Laboratorio de Cómputo 1"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Edificio / Bloque (Opcional)</label>
            <input
              type="text"
              name="edificio"
              placeholder="Ej. Edificio A"
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
              {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}