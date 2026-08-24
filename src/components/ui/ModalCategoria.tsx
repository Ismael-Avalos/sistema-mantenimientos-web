import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { crearCategoria, actualizarCategoria } from "../../services/categorias.service";
import type { Categoria } from "../../types/Categoria";

interface ModalCategoriaProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoriaGuardada: () => void;
  categoriaAEditar?: Categoria | null;
}

export function ModalCategoria({
  isOpen,
  onClose,
  onCategoriaGuardada,
  categoriaAEditar,
}: ModalCategoriaProps) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (categoriaAEditar) {
      setNombre(categoriaAEditar.nombre);
      setDescripcion(categoriaAEditar.descripcion || "");
    } else {
      setNombre("");
      setDescripcion("");
    }
  }, [categoriaAEditar, isOpen]);

  // Cierre con la tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    try {
      if (categoriaAEditar) {
        await actualizarCategoria(categoriaAEditar.id, { nombre, descripcion });
      } else {
        await crearCategoria({ nombre, descripcion });
      }
      onCategoriaGuardada();
      onClose();
    } catch (error) {
      console.error("Error al guardar categoría:", error);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl border border-slate-100 shadow-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-categoria-title"
      >
        {/* Encabezado */}
        <div className="flex justify-between items-center p-4 sm:p-5 border-b border-slate-100">
          <h2 id="modal-categoria-title" className="font-bold text-slate-800 text-lg">
            {categoriaAEditar ? "Editar Categoría" : "Nueva Categoría"}
          </h2>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          <div>
            <label htmlFor="nombre-categoria" className="block text-xs font-semibold text-slate-600 mb-1">
              Nombre de la categoría *
            </label>
            <input
              id="nombre-categoria"
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Laptops, Redes, Herramientas..."
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-800/20 focus:border-red-800 min-h-[44px]"
            />
          </div>

          <div>
            <label htmlFor="descripcion-categoria" className="block text-xs font-semibold text-slate-600 mb-1">
              Descripción
            </label>
            <textarea
              id="descripcion-categoria"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
              placeholder="Descripción opcional..."
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-800/20 focus:border-red-800"
            />
          </div>

          {/* Acciones */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-800 hover:bg-red-900 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700"
            >
              {guardando && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{categoriaAEditar ? "Guardar cambios" : "Crear Categoría"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}