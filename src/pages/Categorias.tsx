import { useEffect, useState } from "react";
import { Plus, Loader2, FolderTree, FileText, Pencil, Trash2 } from "lucide-react";
import { obtenerCategorias, eliminarCategoria } from "../services/categorias.service";
import { ModalCategoria } from "../components/ui/ModalCategoria";
import { ModalConfirmar } from "../components/ui/ModalConfirmar";
import type { Categoria } from "../types/Categoria";

function Categorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);

  // Estados para modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoriaAEditar, setCategoriaAEditar] = useState<Categoria | null>(null);

  // Estados para eliminación / reasignación
  const [categoriaAEliminar, setCategoriaAEliminar] = useState<Categoria | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [requiereReasignacion, setRequiereReasignacion] = useState(false);
  const [categoriaDestinoId, setCategoriaDestinoId] = useState<string>("");
  const [errorReasignacion, setErrorReasignacion] = useState<string | null>(null);

  const cargar = async () => {
    setCargando(true);
    try {
      const datos = await obtenerCategorias();
      setCategorias(datos);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleNuevaCategoria = () => {
    setCategoriaAEditar(null);
    setIsModalOpen(true);
  };

  const handleEditar = (categoria: Categoria) => {
    setCategoriaAEditar(categoria);
    setIsModalOpen(true);
  };

  const cerrarModalEliminar = () => {
    setCategoriaAEliminar(null);
    setRequiereReasignacion(false);
    setCategoriaDestinoId("");
    setErrorReasignacion(null);
  };

  const handleConfirmarEliminar = async () => {
    if (!categoriaAEliminar) return;

    if (requiereReasignacion && !categoriaDestinoId) {
      setErrorReasignacion("Debes seleccionar una categoría de destino.");
      return;
    }

    setEliminando(true);
    setErrorReasignacion(null);

    try {
      if (requiereReasignacion) {
        await eliminarCategoria(categoriaAEliminar.id, categoriaDestinoId);
      } else {
        await eliminarCategoria(categoriaAEliminar.id);
      }

      await cargar();
      cerrarModalEliminar();
    } catch (error: any) {
      // Si el backend rechaza el borrado por tener equipos asociados
      setRequiereReasignacion(true);
    } finally {
      setEliminando(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Encabezado */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Categorías</h1>
          <p className="text-xs text-slate-500">Total registradas: {categorias.length}</p>
        </div>

        <button
          onClick={handleNuevaCategoria}
          className="flex items-center gap-2 bg-red-800 hover:bg-red-900 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Agregar Categoría
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {cargando ? (
          <div className="flex justify-center p-8 text-red-800">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : categorias.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FolderTree className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No hay categorías registradas aún.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="p-4">Nombre</th>
                  <th className="p-4">Descripción</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categorias.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-medium text-slate-800">
                      <div className="flex items-center gap-2">
                        <FolderTree className="w-4 h-4 text-slate-400" />
                        {cat.nombre}
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">
                      {cat.descripcion ? (
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-slate-400" />
                          <span>{cat.descripcion}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-xs">Sin descripción</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEditar(cat)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setCategoriaAEliminar(cat)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal para Crear y Editar Categorías */}
      <ModalCategoria
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCategoriaGuardada={cargar}
        categoriaAEditar={categoriaAEditar}
      />

      {/* Modal para Confirmar / Reasignar Eliminación */}
      <ModalConfirmar
        isOpen={!!categoriaAEliminar}
        onClose={cerrarModalEliminar}
        onConfirm={handleConfirmarEliminar}
        titulo={requiereReasignacion ? "Categoría en Uso" : "Eliminar Categoría"}
        mensaje={
          requiereReasignacion
            ? `Esta categoría tiene equipos asociados. Selecciona una nueva categoría para reasignar los equipos antes de eliminar "${categoriaAEliminar?.nombre}":`
            : `¿Estás seguro de que deseas eliminar la categoría "${categoriaAEliminar?.nombre}"?`
        }
        textoConfirmar={requiereReasignacion ? "Reasignar y Eliminar" : "Eliminar"}
        cargando={eliminando}
      >
        {requiereReasignacion && (
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Categoría Destino
            </label>
            <select
              value={categoriaDestinoId}
              onChange={(e) => setCategoriaDestinoId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-800/20 focus:border-red-800"
            >
              <option value="">-- Selecciona una categoría --</option>
              {categorias
                .filter((cat) => cat.id !== categoriaAEliminar?.id)
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
            </select>
            {errorReasignacion && (
              <p className="text-[11px] text-red-600 font-medium">{errorReasignacion}</p>
            )}
          </div>
        )}
      </ModalConfirmar>
    </div>
  );
}

export default Categorias;