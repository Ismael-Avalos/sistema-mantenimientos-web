import { useEffect, useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { obtenerEquipos } from "../services/equipos.service";
import { ModalCrearEquipo } from "../components/ui/ModalCrearEquipo";
import type { Equipo } from "../types/Equipo";

function Equipos() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cargar = async () => {
    setCargando(true);
    try {
      const datos = await obtenerEquipos();
      setEquipos(datos);
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Encabezado con Botón Integrado */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Equipos</h1>
          <p className="text-xs text-slate-500">Total registrados: {equipos.length}</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-red-800 hover:bg-red-900 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Agregar Equipo
        </button>
      </div>

      {/* Tabla Elegante */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {cargando ? (
          <div className="flex justify-center p-8 text-indigo-600">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="p-4">Código</th>
                  <th className="p-4">Nombre</th>
                  <th className="p-4">Marca / Modelo</th>
                  <th className="p-4">Serie</th>
                  <th className="p-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {equipos.map((equipo) => (
                  <tr key={equipo.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-mono font-medium text-red-800">{equipo.codigoInventario}</td>
                    <td className="p-4 font-medium text-slate-800">{equipo.nombre}</td>
                    <td className="p-4 text-slate-600">{equipo.marca} - {equipo.modelo}</td>
                    <td className="p-4 font-mono text-slate-500 text-xs">{equipo.serialEquipo}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-full">
                        {equipo.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal flotante */}
      <ModalCrearEquipo
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onEquipoCreado={cargar}
      />
    </div>
  );
}

export default Equipos;