import { NavLink } from "react-router-dom";
import {  
  Cpu, 
  FolderTree, 
  MapPin, 
  Users, 
  LayoutDashboard, 
  Settings, 
  LogOut,
  UserLock
} from "lucide-react";

export function Sidebar() {
  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-colors ${
      isActive
        ? "bg-red-100/40 text-red-800 font-semibold"
        : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
    }`;

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col justify-between h-screen flex-shrink-0">
      <div>
        {/* Brand */}
        <div className="p-5 flex items-center gap-3 border-b border-slate-100">
          <div className="p-2 bg-red-700 text-white rounded-xl shadow-md shadow-red-800">
            <UserLock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-sm leading-tight">Mantenimientos</h2>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Panel Admin</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="p-4 space-y-6">
          <div>
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Gestión Principal
            </p>
            <nav className="space-y-1">
              <NavLink to="/" className={linkClasses} end>
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </NavLink>

              <NavLink to="/equipos" className={linkClasses}>
                <Cpu className="w-4 h-4" />
                <span>Equipos</span>
              </NavLink>

              <NavLink to="/categorias" className={linkClasses}>
                <FolderTree className="w-4 h-4" />
                <span>Categorías</span>
              </NavLink>

              <NavLink to="/ubicaciones" className={linkClasses}>
                <MapPin className="w-4 h-4" />
                <span>Ubicaciones</span>
              </NavLink>

              <NavLink to="/usuarios" className={linkClasses}>
                <Users className="w-4 h-4" />
                <span>Usuarios</span>
              </NavLink>
            </nav>
          </div>

          <div>
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Configuración
            </p>
            <nav className="space-y-1">
              <NavLink to="/configuracion" className={linkClasses}>
                <Settings className="w-4 h-4" />
                <span>Ajustes</span>
              </NavLink>
            </nav>
          </div>
        </div>
      </div>

      {/* Profile Footer */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-red-100/40 text-red-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
              AD
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-800 truncate">Administrador</p>
              <p className="text-[10px] text-slate-400 truncate">admin@institucion.edu</p>
            </div>
          </div>
          <button title="Cerrar sesión" className="p-1.5 text-slate-400 hover:text-red-700 rounded-lg">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}