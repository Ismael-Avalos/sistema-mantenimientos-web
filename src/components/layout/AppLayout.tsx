import { Outlet } from "react-router-dom";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r">
          Sidebar
        </aside>

        {/* Contenido */}
        <div className="flex min-h-screen flex-1 flex-col">
          {/* Navbar */}
          <header className="h-16 border-b px-6 flex items-center">
            Navbar
          </header>

          {/* Página */}
          <main className="flex-1 p-6">
            <Outlet />
          </main>

          {/* Footer */}
          <footer className="h-12 border-t px-6 flex items-center text-sm text-muted-foreground">
            Sistema de Mantenimientos
          </footer>
        </div>
      </div>
    </div>
  );
}