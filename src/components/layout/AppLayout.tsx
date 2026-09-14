import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { AlertCircle, X } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [accessDeniedMessage, setAccessDeniedMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleAccessDenied = (event: Event) => {
      const message = (event as CustomEvent<string>).detail;
      setAccessDeniedMessage(message);
    };

    window.addEventListener("auth:access-denied", handleAccessDenied);
    return () => window.removeEventListener("auth:access-denied", handleAccessDenied);
  }, []);

  return (
    <div className="flex min-h-dvh bg-slate-50/50 dark:bg-slate-950/50 font-sans antialiased text-slate-800 dark:text-slate-100 overflow-x-hidden">
      {/* Sidebar Fijo / Drawer Responsive */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Área Principal (Navbar + Contenido + Footer) */}
      <div className="flex-1 flex flex-col min-w-0 h-dvh overflow-y-auto">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        {accessDeniedMessage && (
          <div
            role="alert"
            className="mx-4 mt-4 sm:mx-6 sm:mt-6 flex items-center justify-between gap-3 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/50 px-4 py-3 text-xs text-amber-800 dark:text-amber-300"
          >
            <span className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {accessDeniedMessage}
            </span>
            <button
              type="button"
              onClick={() => setAccessDeniedMessage(null)}
              aria-label="Cerrar aviso"
              className="p-1 rounded-md hover:bg-amber-100 dark:hover:bg-amber-950/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 dark:focus-visible:ring-amber-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}
