import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from "@/hooks/useAuth";

export const ProtectedRoute = () => {
  const { isAuthenticated, isInitializing, user } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return (
      <div className="min-h-dvh bg-slate-50 flex items-center justify-center" role="status">
        <div className="w-9 h-9 border-4 border-red-800 border-t-transparent rounded-full animate-spin" />
        <span className="sr-only">Restaurando sesión...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirección obligatoria si la bandera de la BD 'debeCambiarContrasena' es true
  if (user?.debeCambiarContrasena && location.pathname !== '/cambiar-contrasena') {
    return <Navigate to="/cambiar-contrasena" replace />;
  }

  // Si ya cambió la clave pero intenta entrar manualmente a /cambiar-contrasena
  if (!user?.debeCambiarContrasena && location.pathname === '/cambiar-contrasena') {
    return <Navigate to="/equipos" replace />;
  }

  return <Outlet />;
};
