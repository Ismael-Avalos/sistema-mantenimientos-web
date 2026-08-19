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
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-slate-100">
          <h2 className="font-bold text-slate-800 text-lg">
            {categoriaAEditar ? "Editar Categoría" : "Nueva Categoría"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Nombre de la categoría *
            </label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Laptops, Redes, Herramientas..."
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-red-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Descripción
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
              placeholder="Descripción opcional..."
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-red-800"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="flex items-center gap-2 bg-red-800 hover:bg-red-900 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              {guardando && <Loader2 className="w-4 h-4 animate-spin" />}
              {categoriaAEditar ? "Guardar cambios" : "Crear Categoría"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}