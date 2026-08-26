import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/router/ProtectedRoute";

// Páginas
import { Login } from "@/pages/Login";
import { CambiarContrasena } from "@/pages/CambiarContrasena";
import Equipos from "@/pages/Equipos";
import Ubicaciones from "@/pages/Ubicaciones";
import Usuarios from "@/pages/Usuarios";
import Categorias from "@/pages/Categorias";
import { DetalleEquipoQr } from "@/pages/DetalleEquipoQr";
import { DetalleMantenimientoPage as DetalleMantenimiento } from "@/pages/DetalleMantenimiento";

export const router = createBrowserRouter([
  // 1. Ruta Pública
  {
    path: "/login",
    element: <Login />,
  },

  // 2. Rutas Protegidas (Requieren Sesión Iniciada)
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/cambiar-contrasena",
        element: <CambiarContrasena />,
      },

      // 📌 Ruta protegida para el QR (Limpia, sin Sidebar/Navbar para pantalla móvil)
      {
        path: "/mantenimiento/qr/:uuid",
        element: <DetalleEquipoQr />,
      },

      // Vistas principales dentro de tu AppLayout (Sidebar + Navbar)
      {
        path: "/",
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <Equipos />,
          },
          {
            path: "equipos",
            element: <Equipos />,
          },
          {
            path: "equipos/:uuid",
            element: <DetalleEquipoQr />,
          },
          {
            path: "equipos/:uuid/mantenimientos/:id",
            element: <DetalleMantenimiento />,
          },
          {
            path: "ubicaciones",
            element: <Ubicaciones />,
          },
          {
            path: "usuarios",
            element: <Usuarios />,
          },
          {
            path: "categorias",
            element: <Categorias />,
          },
        ],
      },
    ],
  },

  // Redirección para rutas inexistentes
  {
    path: "*",
    element: <Navigate to="/equipos" replace />,
  },
]);