import { useEffect, useState } from "react";
import { Plus, Loader2, MapPin, Building2 } from "lucide-react";
import { obtenerUbicaciones } from "../services/ubicaciones.service";
import { ModalCrearUbicacion } from "../components/ui/ModalCrearUbicacion";
import type { Ubicacion } from "../types/Ubicacion";

function Ubicaciones() {
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cargar = async () => {
    setCargando(true);
    try {
      const datos = await obtenerUbicaciones();
      setUbicaciones(datos);
    } catch (error) {
      console.error("Error al cargar ubicaciones:", error);
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
          <h1 className="text-2xl font-bold text-slate-800">Ubicaciones</h1>
          <p className="text-xs text-slate-500">Total registradas: {ubicaciones.length}</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-red-800 hover:bg-red-900 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Agregar Ubicación
        </button>
      </div>

      {/* Tabla Elegante */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {cargando ? (
          <div className="flex justify-center p-8 text-red-800">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : ubicaciones.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <MapPin className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No hay ubicaciones registradas aún.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="p-4">Nombre / Sala</th>
                  <th className="p-4">Edificio / Bloque</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ubicaciones.map((ubi) => (
                  <tr key={ubi.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-medium text-slate-800">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        {ubi.nombre}
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">
                      {ubi.edificio ? (
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-slate-400" />
                          <span>{ubi.edificio}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-xs">Sin edificio asignado</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal flotante */}
      <ModalCrearUbicacion
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUbicacionCreada={cargar}
      />
    </div>
  );
}

export default Ubicaciones;