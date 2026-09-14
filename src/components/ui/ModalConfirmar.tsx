import { useEffect } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import React from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  titulo?: string;
  mensaje?: string;
  textoConfirmar?: string;
  cargando?: boolean;
  children?: React.ReactNode;
}

export function ModalConfirmar({
  isOpen,
  onClose,
  onConfirm,
  titulo = "¿Confirmar acción?",
  mensaje = "¿Estás seguro de realizar esta acción? Esta operación no se puede deshacer.",
  textoConfirmar = "Eliminar",
  cargando = false,
  children,
}: Props) {
  // Listener para cerrar con la tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !cargando) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, cargando]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-confirmar-titulo"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm max-h-[90vh] flex flex-col overflow-hidden border border-slate-100 dark:border-slate-800 p-6 text-center animate-in zoom-in-95 duration-150">
        
        {/* Ícono de Advertencia */}
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-300 flex items-center justify-center mx-auto mb-4 shrink-0">
          <AlertTriangle className="w-6 h-6" />
        </div>

        {/* Contenido scrolleable */}
        <div className="overflow-y-auto flex-1">
          <h3 id="modal-confirmar-titulo" className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
            {titulo}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
            {mensaje}
          </p>

          {/* Contenido Adicional (ej: Select de reasignación) */}
          {children && <div className="mb-4 text-left">{children}</div>}
        </div>

        {/* Acciones */}
        <div className="flex flex-col-reverse sm:flex-row gap-2 justify-center pt-2 mt-2 border-t border-slate-50 dark:border-slate-800 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={cargando}
            className="w-full sm:flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-700 disabled:opacity-50 min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            Cancelar
          </button>
          
          <button
            type="button"
            onClick={onConfirm}
            disabled={cargando}
            className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-red-800 hover:bg-red-900 rounded-xl disabled:opacity-50 transition-colors shadow-sm min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 dark:focus-visible:ring-red-400"
          >
            {cargando ? <Loader2 className="w-4 h-4 animate-spin" /> : textoConfirmar}
          </button>
        </div>

      </div>
    </div>
  );
}