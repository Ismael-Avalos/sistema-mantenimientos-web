import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Lock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cambiarContrasenaService } from "@/services/auth.service";

export const CambiarContrasena: React.FC = () => {
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const { user, updateUserPasswordState } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError('No se pudo encontrar la información del usuario en sesión.');
      return;
    }

    if (nuevaContrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (nuevaContrasena !== confirmarContrasena) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setCargando(true);

    try {
      await cambiarContrasenaService({
      usuarioId: user.id,
      nuevaContrasena,
    });

      updateUserPasswordState(false);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar la contraseña.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-xl p-8 space-y-6">
        
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

        {error && (
          <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-700 text-xs p-3 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Nueva Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={nuevaContrasena}
                onChange={(e) => setNuevaContrasena(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-800/20 focus:border-red-800 text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Confirmar Nueva Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={confirmarContrasena}
                onChange={(e) => setConfirmarContrasena(e.target.value)}
                placeholder="Repite la contraseña"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-800/20 focus:border-red-800 text-slate-800"
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
                Actualizando...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Actualizar Contraseña
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};