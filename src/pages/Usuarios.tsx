import { useEffect, useState } from "react";
import { Plus, Loader2, KeyRound, UserCheck } from "lucide-react";
import { obtenerUsuarios } from "../services/usuarios.service";
import { ModalCrearUsuario } from "../components/ui/ModalCrearUsuario";
import type { UserResponse } from "../types/Usuario";

function Usuarios() {
  const [usuarios, setUsuarios] = useState<UserResponse[]>([]);
  const [cargando, setCargando] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cargar = async () => {
    setCargando(true);
    try {
      const datos = await obtenerUsuarios();
      setUsuarios(datos);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
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
          <h1 className="text-2xl font-bold text-slate-800">Usuarios</h1>
          <p className="text-xs text-slate-500">Total registrados: {usuarios.length}</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-red-800 hover:bg-red-900 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Agregar Usuario
        </button>
      </div>

      {/* Tabla Elegante */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {cargando ? (
          <div className="flex justify-center p-8 text-red-800">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="p-4">Nombre</th>
                  <th className="p-4">Correo</th>
                  <th className="p-4">Rol</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4">Cambio de Clave</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usuarios.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-medium text-slate-800">{usuario.nombre}</td>
                    <td className="p-4 text-slate-600">{usuario.correo}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg">
                        {usuario.rol}
                      </span>
                    </td>
                    <td className="p-4">
                      {usuario.activo ? (
                        <span className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-full">
                          Activo
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 rounded-full">
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {usuario.debeCambiarContrasena ? (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-full font-medium">
                          <KeyRound className="w-3 h-3" /> Pendiente
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
                          <UserCheck className="w-3 h-3" /> Completado
                        </span>
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
      <ModalCrearUsuario
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUsuarioCreado={cargar}
      />
    </div>
  );
}

export default Usuarios;