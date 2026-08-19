import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
  // Guardamos a qué ruta intentaba ir antes de mandarlo al login
  return <Navigate to="/login" state={{ from: location }} replace />;
}

  // Redirección obligatoria si la bandera de la BD 'debeCambiarContrasena' es true
  if (user?.debeCambiarContrasena && location.pathname !== '/cambiar-contrasena') {
    return <Navigate to="/cambiar-contrasena" replace />;
  }

  // Si ya cambió la clave pero intenta entrar manualmente a /cambiar-contrasena
  if (!user?.debeCambiarContrasena && location.pathname === '/cambiar-contrasena') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};