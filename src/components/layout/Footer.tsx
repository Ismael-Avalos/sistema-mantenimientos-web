export function Footer() {
  return (
    <footer className="mt-auto py-4 px-4 sm:px-6 border-t border-slate-100 bg-white/50 text-slate-500 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left transition-colors">
      <div className="leading-relaxed">
        © {new Date().getFullYear()}{" "}
        <span className="font-semibold text-slate-700">
          Sistema Mantenimientos Institutional
        </span>
        . Todos los derechos reservados.
      </div>

      <div className="flex items-center justify-center sm:justify-end gap-4 text-xs">
        <span className="flex items-center gap-1.5 font-medium text-slate-600">
          <span 
            className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse flex-shrink-0" 
            aria-hidden="true"
          />
          API Railway Conectada
        </span>
        <span className="text-slate-400 font-mono text-[11px]">v1.0.0</span>
      </div>
    </footer>
  );
}