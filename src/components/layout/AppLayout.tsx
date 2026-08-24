import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-dvh bg-slate-50/50 font-sans antialiased text-slate-800 overflow-x-hidden">
      {/* Sidebar Fijo / Drawer Responsive */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Área Principal (Navbar + Contenido + Footer) */}
      <div className="flex-1 flex flex-col min-w-0 h-dvh overflow-y-auto">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}