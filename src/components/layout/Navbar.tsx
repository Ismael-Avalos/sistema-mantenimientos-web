import { Bell, Search } from "lucide-react";

export function Navbar() {
  return (
    <header className="h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="relative w-72">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar..."
          className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700/20"
        />
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg relative">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 bg-red-700 rounded-full absolute top-2 right-2 ring-2 ring-white"></span>
        </button>
      </div>
    </header>
  );
}