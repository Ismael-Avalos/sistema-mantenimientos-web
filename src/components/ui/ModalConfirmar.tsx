import { AlertTriangle, Loader2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  titulo?: string;
  mensaje?: string;
  cargando?: boolean;
}

export function ModalConfirmar({
  isOpen,
  onClose,
  onConfirm,
  titulo = "¿Confirmar acción?",
  mensaje = "¿Estás seguro de realizar esta acción? Esta operación no se puede deshacer.",
  cargando = false,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100 p-6 text-center animate-in fade-in zoom-in-95 duration-150">
        
        {/* Ícono de Advertencia */}
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>

        {/* Título y Mensaje */}
        <h3 className="text-lg font-bold text-slate-800 mb-1">{titulo}</h3>
        <p className="text-xs text-slate-500 mb-6">{mensaje}</p>

        {/* Botones */}
        <div className="flex gap-2 justify-center">
          <button
            type="button"
            onClick={onClose}
            disabled={cargando}
            className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
          >
            Cancelar
          </button>
          
          <button
            type="button"
            onClick={onConfirm}
            disabled={cargando}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-800 hover:bg-red-900 rounded-xl disabled:opacity-50 transition-colors shadow-sm"
          >
            {cargando ? <Loader2 className="w-4 h-4 animate-spin" /> : "Eliminar"}
          </button>
        </div>

      </div>
    </div>
  );
}