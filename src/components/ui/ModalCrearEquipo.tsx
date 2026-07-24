import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { crearEquipo, type CrearEquipoDTO } from "../../services/equipos.service";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onEquipoCreado: () => void;
}

export function ModalCrearEquipo({ isOpen, onClose, onEquipoCreado }: Props) {
  const [formData, setFormData] = useState<CrearEquipoDTO>({
    codigoInventario: "",
    nombre: "",
    tipo: "",
    marca: "",
    modelo: "",
    serialEquipo: "",
    estado: "ACTIVO",
    fechaAdquisicion: new Date().toISOString().split("T")[0],
  });

  const [guardando, setGuardando] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await crearEquipo(formData);
      onEquipoCreado(); // Notifica a Equipos.tsx para actualizar la lista
      onClose(); // Cierra el modal
    } catch (err) {
      console.error("Error al guardar equipo:", err);
    } finally {
      setGuardando(false);
    }
  };

  return (
    // Backdrop oscuro y desenfocado sobre toda la pantalla
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Agregar Nuevo Equipo</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Cód. Inventario</label>
              <input type="text" name="codigoInventario" required onChange={handleChange} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Nombre</label>
              <input type="text" name="nombre" required onChange={handleChange} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Tipo</label>
              <input type="text" name="tipo" required onChange={handleChange} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Marca</label>
              <input type="text" name="marca" required onChange={handleChange} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Modelo</label>
              <input type="text" name="modelo" required onChange={handleChange} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Nº Serie</label>
              <input type="text" name="serialEquipo" required onChange={handleChange} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Estado</label>
              <select name="estado" value={formData.estado} onChange={handleChange} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-300">
                <option value="ACTIVO">ACTIVO</option>
                <option value="MANTENIMIENTO">MANTENIMIENTO</option>
                <option value="INACTIVO">INACTIVO</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">F. Adquisición</label>
              <input type="date" name="fechaAdquisicion" required value={formData.fechaAdquisicion} onChange={handleChange} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">
              Cancelar
            </button>
            <button type="submit" disabled={guardando} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-800 hover:bg-red-900 rounded-lg">
              {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}