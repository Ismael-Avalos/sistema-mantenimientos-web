import { NavLink, useNavigate } from "react-router-dom";
import { 
  Cpu, 
  FolderTree, 
  MapPin, 
  Users, 
  LayoutDashboard,
  LogOut,
  UserLock,
  X
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { hasRole } from "@/utils/roles";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

// 1. Helper blindado para obtener el primer nombre y primer apellido (ej: René Pinto)
const obtenerNombreCorto = (nombreCompleto?: string): string => {
  if (!nombreCompleto || typeof nombreCompleto !== "string") return "Usuario";
  const partes = nombreCompleto.trim().split(/\s+/);
  
  if (partes.length === 1) return partes[0];
  if (partes.length === 2) return `${partes[0]} ${partes[1]}`;
  
  // Si tiene 3 o más palabras (ej: René Ismael Pinto Ávalos), toma el 1ro y 3ro
  return `${partes[0]} ${partes[2]}`;
};

// 2. Helper blindado para obtener la etiqueta del panel según el Rol (String u Objeto)
const obtenerEtiquetaPanel = (rol?: string): string => {
  if (!rol) return "PANEL CONTROL";

  // Si 'rol' viene como objeto (ej: { id: 1, nombre: "ADMIN" }), extraemos el texto de forma segura
  const rolUpper = rol.toUpperCase();

  if (rolUpper.includes("ADMIN")) return "PANEL ADMIN";
  if (rolUpper.includes("TECNICO") || rolUpper.includes("TÉCNICO")) return "PANEL TÉCNICO";
  return `PANEL ${rolUpper}`;
};

// 3. Helper para generar las iniciales (ej: René Pinto -> RP)
const obtenerIniciales = (nombreCorto: string): string => {
  const partes = nombreCorto.split(" ");
  if (partes.length >= 2) {
    return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
  }
  return nombreCorto.substring(0, 2).toUpperCase();
};

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  // Valores calculados basados en el usuario de sesión de forma segura
  const nombreMostrar = obtenerNombreCorto(user?.nombre);
  const iniciales = obtenerIniciales(nombreMostrar);
  const etiquetaPanel = obtenerEtiquetaPanel(user?.rol);

  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3.5 py-3 text-sm font-medium rounded-xl transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 ${
      isActive
        ? "bg-red-100/40 text-red-800 font-semibold"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
    }`;

  return (
    <>
      {/* Backdrop movil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-100 flex flex-col justify-between h-dvh flex-shrink-0 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="overflow-y-auto flex-1">
          {/* Brand */}
          <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-700 text-white rounded-xl shadow-md shadow-red-800/30">
                <UserLock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800 text-sm leading-tight">Mantenimientos</h2>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                  {etiquetaPanel}
                </p>
              </div>
            </div>

            {/* Botón de cierre en pantallas pequeñas */}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar menú de navegación"
                className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <div className="p-4 space-y-6">
            <div>
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Gestión Principal
              </p>
              <nav className="space-y-1">
                <NavLink to="/" className={linkClasses} onClick={onClose} end>
                  <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                  <span>Dashboard</span>
                </NavLink>

                <NavLink to="/equipos" className={linkClasses} onClick={onClose}>
                  <Cpu className="w-4 h-4 flex-shrink-0" />
                  <span>Equipos</span>
                </NavLink>

                <NavLink to="/categorias" className={linkClasses} onClick={onClose}>
                  <FolderTree className="w-4 h-4 flex-shrink-0" />
                  <span>Categorías</span>
                </NavLink>

                <NavLink to="/ubicaciones" className={linkClasses} onClick={onClose}>
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span>Ubicaciones</span>
                </NavLink>

                {hasRole(user?.rol, ["ADMIN"]) && (
                  <NavLink to="/usuarios" className={linkClasses} onClick={onClose}>
                    <Users className="w-4 h-4 flex-shrink-0" />
                    <span>Usuarios</span>
                  </NavLink>
                )}
              </nav>
            </div>

          </div>
        </div>

        {/* Profile Footer */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
            <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
              {/* Badge de Iniciales */}
              <div className="w-8 h-8 rounded-lg bg-red-100/40 text-red-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                {iniciales}
              </div>

              {/* Nombre y Correo */}
              <div className="truncate min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate" title={nombreMostrar}>
                  {nombreMostrar}
                </p>
                <p className="text-[10px] text-slate-400 truncate" title={user?.correo}>
                  {user?.correo || "correo@ejemplo.com"}
                </p>
              </div>
            </div>

            <button 
              type="button"
              title="Cerrar sesión"
              aria-label="Cerrar sesión" 
              onClick={() => void handleLogout()}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-red-700 hover:bg-rose-50 rounded-lg transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
