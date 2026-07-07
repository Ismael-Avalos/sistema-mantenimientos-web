import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Equipos from "@/pages/Equipos";

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
    ],
  },
]);