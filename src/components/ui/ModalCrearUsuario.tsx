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

  // Cerrar con la tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !guardando) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, guardando]);

  // Carga de roles
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
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-crear-usuario-titulo"
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden border border-slate-100">
        
        {/* Encabezado Fijo */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <h2 id="modal-crear-usuario-titulo" className="text-base sm:text-lg font-bold text-slate-800">
            Agregar Usuario
          </h2>
          <button 
            type="button"
            onClick={onClose} 
            aria-label="Cerrar modal"
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario Scrolleable */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 text-xs bg-red-50 text-red-700 rounded-xl border border-red-100 font-medium">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="nombre" className="block text-xs font-semibold text-slate-600 uppercase mb-1">
              Nombre Completo *
            </label>
            <input
              id="nombre"
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Juan Pérez"
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-800 focus:ring-2 focus:ring-red-800/20"
            />
          </div>

          <div>
            <label htmlFor="correo" className="block text-xs font-semibold text-slate-600 uppercase mb-1">
              Correo Electrónico *
            </label>
            <input
              id="correo"
              type="email"
              required
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="correo@ejemplo.com"
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-800 focus:ring-2 focus:ring-red-800/20"
            />
          </div>

          <div>
            <label htmlFor="contrasena" className="block text-xs font-semibold text-slate-600 uppercase mb-1">
              Contraseña Temporal *
            </label>
            <input
              id="contrasena"
              type="password"
              required
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-800 focus:ring-2 focus:ring-red-800/20"
            />
          </div>

          <div>
            <label htmlFor="rolId" className="block text-xs font-semibold text-slate-600 uppercase mb-1">
              Rol *
            </label>
            <select
              id="rolId"
              required
              value={rolId}
              onChange={(e) => setRolId(e.target.value)}
              disabled={cargandoRoles}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-800 focus:ring-2 focus:ring-red-800/20 bg-white text-slate-700 disabled:bg-slate-100"
            >
              <option value="" disabled>
                {cargandoRoles ? "Cargando roles..." : "-- Selecciona un rol --"}
              </option>
              {roles.map((rol) => (
                <option key={rol.id} value={rol.id}>
                  {rol.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Acciones de Pie Fijo */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando || cargandoRoles}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-800 hover:bg-red-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm disabled:opacity-50 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700"
            >
              {guardando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                "Guardar Usuario"
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}