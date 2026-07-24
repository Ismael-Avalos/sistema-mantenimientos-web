import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function AppLayout() {
  return (
    <div className="flex h-screen bg-slate-50/50 font-sans antialiased text-slate-800 overflow-hidden">
      {/* Sidebar Fijo */}
      <Sidebar />

      {/* Área Principal (Navbar + Contenido + Footer) */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <Navbar />

        <main className="flex-1 p-6 md:p-8">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}