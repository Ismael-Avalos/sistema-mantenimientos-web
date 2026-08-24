import { useEffect, useState } from "react";
import { Plus, Loader2, KeyRound, UserCheck, Users as UsersIcon } from "lucide-react";
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
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      
      {/* Encabezado Responsivo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Usuarios</h1>
          <p className="text-xs text-slate-500 mt-0.5">Total registrados: {usuarios.length}</p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-red-800 hover:bg-red-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Usuario</span>
        </button>
      </div>

      {/* Contenedor Principal */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {cargando ? (
          <div className="flex justify-center p-12 text-red-800">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : usuarios.length === 0 ? (
          <div className="text-center p-8 sm:p-12 text-slate-400 space-y-2">
            <UsersIcon className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-medium text-slate-600">No hay usuarios registrados</p>
          </div>
        ) : (
          <>
            {/* Vista en Tarjetas para Móviles (< md) */}
            <div className="block md:hidden divide-y divide-slate-100">
              {usuarios.map((usuario) => (
                <div key={usuario.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h2 className="font-semibold text-slate-800 text-sm">{usuario.nombre}</h2>
                      <p className="text-xs text-slate-500 break-all">{usuario.correo}</p>
                    </div>
                    {usuario.activo ? (
                      <span className="px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 rounded-full shrink-0">
                        Activo
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 text-[11px] font-semibold text-rose-700 bg-rose-50 rounded-full shrink-0">
                        Inactivo
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-50">
                    <span className="px-2.5 py-1 font-semibold text-slate-700 bg-slate-100 rounded-lg">
                      {usuario.rol}
                    </span>

                    {usuario.debeCambiarContrasena ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-1 rounded-full font-medium">
                        <KeyRound className="w-3 h-3" /> Clave pendiente
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                        <UserCheck className="w-3 h-3" /> Clave al día
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Vista en Tabla para Escritorio (≥ md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-100">
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
                    <tr key={usuario.id} className="hover:bg-slate-50/50 transition-colors">
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
          </>
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