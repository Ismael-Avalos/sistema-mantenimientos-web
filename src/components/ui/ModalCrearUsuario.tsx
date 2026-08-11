import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { crearUsuario, type CreateUserDTO } from "../../services/usuarios.service";
import { obtenerRoles } from "../../services/roles.service";
import type { Rol } from "../../types/Rol";

interface ModalCrearUsuarioProps {
  isOpen: boolean;
  onClose: () => void;
  onUsuarioCreado: () => void;
}

export function ModalCrearUsuario({ isOpen, onClose, onUsuarioCreado }: ModalCrearUsuarioProps) {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [rolId, setRolId] = useState("");

  const [roles, setRoles] = useState<Rol[]>([]);
  const [cargandoRoles, setCargandoRoles] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setCargandoRoles(true);
      obtenerRoles()
        .then(setRoles)
        .catch(() => setError("Error al cargar la lista de roles."))
        .finally(() => setCargandoRoles(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rolId) {
      setError("Debes seleccionar un rol.");
      return;
    }

    setGuardando(true);
    setError(null);

    try {
      const payload: CreateUserDTO = {
        nombre,
        correo,
        contrasena,
        rolId
      };
      await crearUsuario(payload);
      
      // Limpiar formulario y notificar
      setNombre("");
      setCorreo("");
      setContrasena("");
      setRolId("");
      onUsuarioCreado();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Ocurrió un error al crear el usuario.";
      setError(msg);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Agregar Usuario</h2>
          <button 
            onClick={onClose} 
            type="button"
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-red-50 text-red-700 rounded-xl border border-red-100 font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
              Nombre Completo
            </label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Juan Pérez"
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-800 focus:ring-1 focus:ring-red-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="correo@ejemplo.com"
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-800 focus:ring-1 focus:ring-red-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
              Contraseña Temporal
            </label>
            <input
              type="password"
              required
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-800 focus:ring-1 focus:ring-red-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
              Rol
            </label>
            <select
              required
              value={rolId}
              onChange={(e) => setRolId(e.target.value)}
              disabled={cargandoRoles}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-800 focus:ring-1 focus:ring-red-800 bg-white text-slate-700"
            >
              <option value="">-- Selecciona un rol --</option>
              {roles.map((rol) => (
                <option key={rol.id} value={rol.id}>
                  {rol.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Acciones */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando || cargandoRoles}
              className="flex items-center gap-2 bg-red-800 hover:bg-red-900 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
            >
              {guardando && <Loader2 className="w-4 h-4 animate-spin" />}
              Guardar Usuario
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}