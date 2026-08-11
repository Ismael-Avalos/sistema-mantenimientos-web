import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/router/ProtectedRoute";

// Páginas
import { Login } from "@/pages/Login";
import { CambiarContrasena } from "@/pages/CambiarContrasena";
import Equipos from "@/pages/Equipos";
import Ubicaciones from "@/pages/Ubicaciones";
import Usuarios from "@/pages/Usuarios";

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
      // Vista especial si debe cambiar clave primeramente
      {
        path: "/cambiar-contrasena",
        element: <CambiarContrasena />,
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
            path: "ubicaciones",
            element: <Ubicaciones />,
          },
          {
            path: "usuarios",
            element: <Usuarios />,
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