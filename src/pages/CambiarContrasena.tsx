import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Lock, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from "@/hooks/useAuth";
import { getSafeErrorMessage } from "@/services/problem-details";

export const CambiarContrasena: React.FC = () => {
  const [contrasenaActual, setContrasenaActual] = useState('');
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [mostrarActual, setMostrarActual] = useState(false);
  const [mostrarNueva, setMostrarNueva] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const { user, changePassword, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError('No se pudo encontrar la información del usuario en sesión.');
      return;
    }

    if (nuevaContrasena.length < 12 || nuevaContrasena.length > 128) {
      setError('La contraseña debe tener entre 12 y 128 caracteres.');
      return;
    }

    if (!/[A-Z]/.test(nuevaContrasena) || !/[a-z]/.test(nuevaContrasena) || !/\d/.test(nuevaContrasena) || !/[^A-Za-z0-9]/.test(nuevaContrasena)) {
      setError('Incluye al menos una mayúscula, una minúscula, un número y un símbolo.');
      return;
    }

    if (nuevaContrasena !== confirmarContrasena) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setCargando(true);

    try {
      await changePassword({
        contrasenaActual,
        nuevaContrasena,
      });
      navigate('/login', { replace: true, state: { passwordChanged: true } });
    } catch (err: unknown) {
      setError(getSafeErrorMessage(err, 'Error al actualizar la contraseña.'));
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-xl p-6 sm:p-8 space-y-6">
        
        {/* Encabezado */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 bg-amber-500/10 text-amber-700 rounded-xl flex items-center justify-center border border-amber-200">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">
            Primer Inicio de Sesión
          </h1>
          <p className="text-xs text-slate-500 max-w-xs">
            Por seguridad de tu cuenta, debes establecer una nueva contraseña personal para continuar.
          </p>
        </div>

        {/* Alerta de Error */}
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
            <label htmlFor="contrasena-actual" className="block text-xs font-medium text-slate-700 mb-1">
              Contraseña actual *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                id="contrasena-actual"
                type={mostrarActual ? "text" : "password"}
                required
                autoComplete="current-password"
                value={contrasenaActual}
                onChange={(event) => setContrasenaActual(event.target.value)}
                className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-800/20 focus:border-red-800 text-slate-800 min-h-[44px]"
              />
              <button
                type="button"
                onClick={() => setMostrarActual(!mostrarActual)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 rounded-lg min-w-[36px] min-h-[36px] flex items-center justify-center"
                aria-label={mostrarActual ? "Ocultar contraseña actual" : "Mostrar contraseña actual"}
              >
                {mostrarActual ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="nueva-contrasena" className="block text-xs font-medium text-slate-700 mb-1">
              Nueva Contraseña *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                id="nueva-contrasena"
                type={mostrarNueva ? "text" : "password"}
                required
                minLength={12}
                maxLength={128}
                autoComplete="new-password"
                value={nuevaContrasena}
                onChange={(e) => setNuevaContrasena(e.target.value)}
                placeholder="Entre 12 y 128 caracteres"
                className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-800/20 focus:border-red-800 text-slate-800 transition-all placeholder:text-slate-400 min-h-[44px]"
              />
              <button
                type="button"
                onClick={() => setMostrarNueva(!mostrarNueva)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-800/20 min-w-[36px] min-h-[36px] flex items-center justify-center"
                aria-label={mostrarNueva ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {mostrarNueva ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmar-contrasena" className="block text-xs font-medium text-slate-700 mb-1">
              Confirmar Nueva Contraseña *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                id="confirmar-contrasena"
                type={mostrarConfirmar ? "text" : "password"}
                required
                minLength={12}
                maxLength={128}
                autoComplete="new-password"
                value={confirmarContrasena}
                onChange={(e) => setConfirmarContrasena(e.target.value)}
                placeholder="Repite la contraseña"
                className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-800/20 focus:border-red-800 text-slate-800 transition-all placeholder:text-slate-400 min-h-[44px]"
              />
              <button
                type="button"
                onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-800/20 min-w-[36px] min-h-[36px] flex items-center justify-center"
                aria-label={mostrarConfirmar ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {mostrarConfirmar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                <span>Actualizando...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Actualizar Contraseña</span>
              </>
            )}
          </button>
        </form>

        <button
          type="button"
          onClick={() => void logout().finally(() => navigate('/login', { replace: true }))}
          className="w-full text-xs font-medium text-slate-500 hover:text-red-800 py-2"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};
