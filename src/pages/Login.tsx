import React, { useState } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Wrench, Lock, Mail, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from "@/hooks/useAuth";
import { getSafeErrorMessage } from "@/services/problem-details";

export const Login: React.FC = () => {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const { login, isAuthenticated, isInitializing, sessionMessage, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Obtiene la ruta de origen a la que intentaba acceder el usuario (p. ej. /mantenimiento/qr/xyz)
  // Si no venía de ninguna ruta en particular, redirige a /equipos por defecto
  const rutaOrigen = location.state?.from;
  const destino = rutaOrigen
    ? `${rutaOrigen.pathname}${rutaOrigen.search || ""}${rutaOrigen.hash || ""}`
    : "/equipos";

  if (isInitializing) {
    return (
      <div className="min-h-dvh bg-slate-50 flex items-center justify-center" role="status">
        <Loader2 className="w-8 h-8 animate-spin text-red-800" />
        <span className="sr-only">Restaurando sesión...</span>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={user?.debeCambiarContrasena ? "/cambiar-contrasena" : destino} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      // Endpoint a consumir en Spring Boot
      const usuario = await login({ correo, contrasena });

      if (usuario.debeCambiarContrasena) {
        navigate('/cambiar-contrasena', { replace: true });
      } else {
        // Redirige al destino previo guardado (la vista del QR) o al listado principal
        navigate(destino, { replace: true });
      }
    } catch (err: unknown) {
      setError(getSafeErrorMessage(err, 'Credenciales inválidas. Verifica tu correo y contraseña.'));
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-xl p-6 sm:p-8 space-y-6">
        
        {/* Logotipo y Título estilo Sidebar */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 bg-red-800 rounded-xl flex items-center justify-center text-white shadow-md">
            <Wrench className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Mantenimientos
          </h1>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            SISTEMA INSTITUCIONAL DE CONTROL
          </p>
        </div>

        {/* Mensaje de Error */}
        {sessionMessage && (
          <div
            role="alert"
            className="flex items-center gap-2 bg-amber-50 border border-amber-100 text-amber-800 text-xs p-3.5 rounded-xl"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{sessionMessage}</span>
          </div>
        )}

        {location.state?.passwordChanged && (
          <div
            role="status"
            className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs p-3.5 rounded-xl"
          >
            <span>Contraseña actualizada. Inicia sesión nuevamente.</span>
          </div>
        )}

        {error && (
          <div 
            role="alert" 
            aria-live="assertive"
            className="flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-700 text-xs p-3.5 rounded-xl"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-correo" className="block text-xs font-medium text-slate-700 mb-1">
              Correo Electrónico *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                id="login-correo"
                type="email"
                required
                autoComplete="username"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="usuario@uma.edu.sv"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-800/20 focus:border-red-800 text-slate-800 transition-all placeholder:text-slate-400 min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="login-contrasena" className="block text-xs font-medium text-slate-700 mb-1">
              Contraseña *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                id="login-contrasena"
                type={mostrarContrasena ? "text" : "password"}
                required
                autoComplete="current-password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-800/20 focus:border-red-800 text-slate-800 transition-all placeholder:text-slate-400 min-h-[44px]"
              />
              <button
                type="button"
                onClick={() => setMostrarContrasena(!mostrarContrasena)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-800/20 min-w-[36px] min-h-[36px] flex items-center justify-center"
                aria-label={mostrarContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {mostrarContrasena ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full flex items-center justify-center gap-2 bg-red-800 hover:bg-red-900 text-white py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm disabled:opacity-70 mt-2 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700"
          >
            {cargando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Iniciando Sesión...</span>
              </>
            ) : (
              <span>Ingresar al Sistema</span>
            )}
          </button>
        </form>

        <div className="text-center border-t border-slate-100 pt-4">
          <p className="text-xs text-slate-400">
            Acceso restringido únicamente a personal autorizado.
          </p>
        </div>
      </div>
    </div>
  );
};
