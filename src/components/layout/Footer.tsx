export function Footer() {
  return (
    <footer className="mt-auto py-4 px-6 border-t border-slate-100 bg-white/50 text-slate-400 text-xs flex flex-col sm:flex-row items-center justify-between gap-2">
      <div>
        © {new Date().getFullYear()} <span className="font-semibold text-slate-600">Sistema Mantenimientos Institutional</span>. Todos los derechos reservados.
      </div>
      <div className="flex items-center gap-4 text-[11px]">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
          API Railway Conectada
        </span>
        <span>v1.0.0</span>
      </div>
    </footer>
  );
}