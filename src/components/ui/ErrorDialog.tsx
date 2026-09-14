import { useEffect, useId, useRef } from "react";
import { AlertCircle, AlertTriangle, ServerCrash, WifiOff, X } from "lucide-react";

import type { UiError } from "../../services/problem-details";

interface Props { error: UiError | null; onClose: () => void; onRetry?: () => void; }

export function ErrorDialog({ error, onClose, onRetry }: Props) {
  const titleId = useId();
  const detailId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!error) return;
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.stopPropagation(); onClose(); return; }
      if (event.key !== "Tab") return;
      const dialog = closeButtonRef.current?.closest('[role="alertdialog"]');
      const selector = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
      const focusable = Array.from(dialog?.querySelectorAll<HTMLElement>(selector) ?? []);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [error, onClose]);

  if (!error) return null;
  const Icon = error.kind === "network" ? WifiOff : error.kind === "server" ? ServerCrash : error.kind === "warning" ? AlertTriangle : AlertCircle;
  const warning = error.kind === "warning";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/55 p-3 sm:p-4 backdrop-blur-sm" role="presentation">
      <div role="alertdialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={detailId} className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl sm:max-h-[90vh]">
        <div className="flex items-start gap-3 border-b border-slate-100 dark:border-slate-800 p-4 sm:p-5">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${warning ? "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300" : "bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300"}`}><Icon className="h-5 w-5" aria-hidden="true" /></div>
          <div className="min-w-0 flex-1"><h2 id={titleId} className="text-base font-bold text-slate-800 dark:text-slate-100 sm:text-lg">{error.title}</h2><p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-400">No se completó la operación</p></div>
          <button ref={closeButtonRef} type="button" onClick={onClose} aria-label="Cerrar mensaje" className="-mr-1 min-h-11 min-w-11 rounded-lg p-2 text-slate-400 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 dark:focus-visible:ring-red-400"><X className="mx-auto h-5 w-5" /></button>
        </div>
        <div className="min-h-0 overflow-y-auto p-4 sm:p-5"><p id={detailId} className="break-words text-sm leading-6 text-slate-600 dark:text-slate-300">{error.detail}</p></div>
        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 p-4 sm:flex-row sm:justify-end">
          {error.canRetry && onRetry && <button type="button" onClick={onRetry} className="min-h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 sm:w-auto">Volver a intentar</button>}
          <button type="button" onClick={onClose} className="min-h-11 w-full rounded-xl bg-red-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 dark:focus-visible:ring-red-400 sm:w-auto">{error.field ? "Corregir datos" : "Entendido"}</button>
        </div>
      </div>
    </div>
  );
}
