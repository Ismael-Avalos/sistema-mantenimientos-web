import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Wrench, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import { loginService } from "@/services/auth.service";

export const Login: React.FC = () => {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Obtiene la ruta de origen a la que intentaba acceder el usuario (p. ej. /mantenimiento/qr/xyz)
  // Si no venía de ninguna ruta en particular, redirige a /equipos por defecto
  const destino = location.state?.from?.pathname || '/equipos';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      // Endpoint a consumir en Spring Boot
      const { token, usuario } = await loginService({ correo, contrasena });

      login(token, usuario);

      if (usuario.debeCambiarContrasena) {
        navigate('/cambiar-contrasena', { replace: true });
      } else {
        // Redirige al destino previo guardado (la vista del QR) o al listado principal
        navigate(destino, { replace: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Credenciales inválidas. Verifica tu correo y contraseña.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-xl p-8 space-y-6">
        
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
        {error && (
          <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-700 text-xs p-3 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="usuario@uma.edu.sv"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-800/20 focus:border-red-800 text-slate-800 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-800/20 focus:border-red-800 text-slate-800 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full flex items-center justify-center gap-2 bg-red-800 hover:bg-red-900 text-white py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm disabled:opacity-70 mt-2"
          >
            {cargando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Iniciando Sesión...
              </>
            ) : (
              'Ingresar al Sistema'
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