import { useEffect, useState } from "react";

import {
  getApiConnectionStatus,
  subscribeToApiConnection,
} from "@/services/api-connection";

export function Footer() {
  const [apiConectada, setApiConectada] = useState(getApiConnectionStatus);

  useEffect(() => {
    return subscribeToApiConnection(setApiConectada);
  }, []);

  return (
    <footer className="mt-auto py-4 px-4 sm:px-6 border-t border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left transition-colors">
      <div className="leading-relaxed">
        {new Date().getFullYear()}{" "}
        <span className="font-semibold text-slate-700 dark:text-slate-200">
          Sistema Mantenimientos Institutional
        </span>
      </div>

      <div className="flex items-center justify-center sm:justify-end gap-4 text-xs">
        <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
          <span
            className={`w-2 h-2 rounded-full inline-block flex-shrink-0 ${
              apiConectada ? "bg-emerald-500 animate-pulse" : "bg-red-500"
            }`}
            aria-hidden="true"
          />
          API {apiConectada ? "Conectada" : "Sin Conexión"}
        </span>
        <span className="text-slate-400 dark:text-slate-400 font-mono text-[11px]">v1.0.0</span>
      </div>
    </footer>
  );
}
