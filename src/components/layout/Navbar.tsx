import { Bell, Menu, Search } from "lucide-react";

interface NavbarProps {
  onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  return (
    <header className="h-16 bg-white border-b border-slate-100 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-10 gap-3">
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Abrir menú de navegación"
          className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="search"
            placeholder="Buscar..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700/20 focus:border-red-700 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-3">
        <button 
          type="button"
          aria-label="Notificaciones"
          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 bg-red-700 rounded-full absolute top-3 right-3 ring-2 ring-white"></span>
        </button>
      </div>
    </header>
  );
}