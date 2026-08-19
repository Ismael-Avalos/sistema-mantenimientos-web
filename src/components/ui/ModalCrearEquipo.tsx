import { useState, useEffect } from "react";
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

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onEquipoCreado: () => void;
  equipoAEditar?: Equipo | null;
}

const estadoInicial: CrearEquipoDTO = {
  codigoInventario: "",
  nombre: "",
  tipo: "",
  marca: "",
  modelo: "",
  serialEquipo: "",
  estado: "ACTIVO",
  fechaAdquisicion: new Date().toISOString().split("T")[0],
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
      setFormData({
        codigoInventario: equipoAEditar.codigoInventario || "",
        nombre: equipoAEditar.nombre || "",
        tipo: equipoAEditar.tipo || "",
        marca: equipoAEditar.marca || "",
        modelo: equipoAEditar.modelo || "",
        serialEquipo: equipoAEditar.serialEquipo || "",
        estado: equipoAEditar.estado || "ACTIVO",
        fechaAdquisicion: equipoAEditar.fechaAdquisicion
          ? equipoAEditar.fechaAdquisicion.split("T")[0]
          : new Date().toISOString().split("T")[0],
        ubicacionId: equipoAEditar.ubicacion?.id || equipoAEditar.ubicacionId || "",
        categoriaId: equipoAEditar.categoria?.id || equipoAEditar.categoriaId || "",
      });
    } else {
      setFormData(estadoInicial);
    }
  }, [equipoAEditar, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);

    // Formatear payload limpiando UUID vacíos para que Spring Boot no falle al mapear
    const payload: CrearEquipoDTO = {
      ...formData,
      ubicacionId: formData.ubicacionId ? formData.ubicacionId : null,
      marca: formData.marca ? formData.marca : "",
      modelo: formData.modelo ? formData.modelo : "",
      serialEquipo: formData.serialEquipo ? formData.serialEquipo : "",
    };

    try {
      if (equipoAEditar) {
        await actualizarEquipo(equipoAEditar.id, payload);
      } else {
        await crearEquipo(payload);
      }
      onEquipoCreado();
      onClose();
    } catch (err) {
      console.error("Error al procesar equipo:", err);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">
            {equipoAEditar ? "Editar Equipo" : "Agregar Nuevo Equipo"}
          </h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Cód. Inventario</label>
              <input
                type="text"
                name="codigoInventario"
                required
                value={formData.codigoInventario}
                onChange={handleChange}
                className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Nombre</label>
              <input
                type="text"
                name="nombre"
                required
                value={formData.nombre}
                onChange={handleChange}
                className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Tipo</label>
              <input
                type="text"
                name="tipo"
                required
                value={formData.tipo}
                onChange={handleChange}
                className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Marca</label>
              <input
                type="text"
                name="marca"
                value={formData.marca}
                onChange={handleChange}
                className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Modelo</label>
              <input
                type="text"
                name="modelo"
                value={formData.modelo}
                onChange={handleChange}
                className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Nº Serie</label>
              <input
                type="text"
                name="serialEquipo"
                value={formData.serialEquipo}
                onChange={handleChange}
                className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Estado</label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-300"
              >
                <option value="ACTIVO">ACTIVO</option>
                <option value="EN_MANTENIMIENTO">EN MANTENIMIENTO</option>
                <option value="DADO_DE_BAJA">DADO DE BAJA</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">F. Adquisición</label>
              <input
                type="date"
                name="fechaAdquisicion"
                required
                value={formData.fechaAdquisicion}
                onChange={handleChange}
                className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300"
              />
            </div>

            {/* Selector de Categoría */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Categoría</label>
              <select
                name="categoriaId"
                required
                value={formData.categoriaId || ""}
                onChange={handleChange}
                disabled={cargandoRelaciones}
                className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-300 disabled:bg-slate-100"
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
              <label className="block text-xs font-medium text-slate-600 mb-1">Ubicación</label>
              <select
                name="ubicacionId"
                value={formData.ubicacionId || ""}
                onChange={handleChange}
                disabled={cargandoRelaciones}
                className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-300 disabled:bg-slate-100"
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
              ) : equipoAEditar ? (
                "Actualizar"
              ) : (
                "Guardar"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}