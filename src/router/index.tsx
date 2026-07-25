import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Equipos from "@/pages/Equipos";
import Ubicaciones from "@/pages/Ubicaciones"; // 1. Importa la nueva página

export const router = createBrowserRouter([
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
        path: "ubicaciones", // 2. Agrega la ruta que coincide con el Sidebar
        element: <Ubicaciones />,
      },
    ],
  },
]);