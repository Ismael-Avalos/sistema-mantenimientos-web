import { useEffect, useState } from 'react';
import { AlertCircle, Loader2, Pencil, X } from 'lucide-react';

import { actualizarMantenimiento } from '../../services/mantenimiento.service';
import { getSafeErrorMessage } from '../../services/problem-details';
import { obtenerUsuarios } from '../../services/usuarios.service';
import type { ActualizarMantenimientoDTO, MaintenanceResponse, MaintenanceType } from '../../types/Maintenance';
import type { UserResponse } from '../../types/Usuario';

interface Props {
  isOpen: boolean;
  mantenimiento: MaintenanceResponse;
  onClose: () => void;
  onActualizado: (mantenimiento: MaintenanceResponse) => void | Promise<void>;
}

interface FormState {
  responsableId: string; tipo: MaintenanceType; solicitanteNombre: string;
  solicitanteCorreo: string; solicitanteTelefono: string; unidad: string;
  descripcionFalla: string; actividadesRealizadas: string; observacionesTecnicas: string;
  recomendaciones: string; costo: string; fecha: string; fechaEntrega: string;
}

const toLocalInput = (value?: string | null) => value ? value.slice(0, 16) : '';
const toLocalIso = (value: string) => value.length === 16 ? `${value}:00` : value;
const optional = (value: string) => value.trim() || null;

export function ModalEditarMantenimiento({ isOpen, mantenimiento, onClose, onActualizado }: Props) {
  const [form, setForm] = useState<FormState>(() => ({
    responsableId: mantenimiento.responsableId || '', tipo: mantenimiento.tipo,
    solicitanteNombre: mantenimiento.solicitanteNombre, solicitanteCorreo: mantenimiento.solicitanteCorreo,
    solicitanteTelefono: mantenimiento.solicitanteTelefono || '', unidad: mantenimiento.unidad,
    descripcionFalla: mantenimiento.descripcionFalla, actividadesRealizadas: mantenimiento.actividadesRealizadas,
    observacionesTecnicas: mantenimiento.observacionesTecnicas || '', recomendaciones: mantenimiento.recomendaciones || '',
    costo: String(mantenimiento.costo), fecha: toLocalInput(mantenimiento.fecha),
    fechaEntrega: toLocalInput(mantenimiento.fechaEntrega),
  }));
  const [usuarios, setUsuarios] = useState<UserResponse[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    obtenerUsuarios().then((data) => setUsuarios(data.filter((u) => u.activo))).catch(() => setUsuarios([]));
  }, [isOpen]);

  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === 'Escape' && isOpen && !guardando && onClose();
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [guardando, isOpen, onClose]);

  if (!isOpen) return null;
  const update = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const costo = Number(form.costo);
    if (!Number.isFinite(costo) || costo < 0) return setError('El costo debe ser mayor o igual a cero.');
    if (form.fechaEntrega && form.fecha > form.fechaEntrega) return setError('La fecha de solicitud no puede ser posterior a la fecha de entrega.');
    const payload: ActualizarMantenimientoDTO = {
      responsableId: optional(form.responsableId), tipo: form.tipo,
      solicitanteNombre: form.solicitanteNombre.trim(), solicitanteCorreo: form.solicitanteCorreo.trim(),
      solicitanteTelefono: optional(form.solicitanteTelefono), unidad: form.unidad.trim(),
      descripcionFalla: form.descripcionFalla.trim(), actividadesRealizadas: form.actividadesRealizadas.trim(),
      observacionesTecnicas: optional(form.observacionesTecnicas), recomendaciones: optional(form.recomendaciones),
      costo, fecha: toLocalIso(form.fecha), fechaEntrega: form.fechaEntrega ? toLocalIso(form.fechaEntrega) : null,
    };
    try {
      setGuardando(true);
      const actualizado = await actualizarMantenimiento(mantenimiento.id, payload);
      await onActualizado(actualizado);
      onClose();
    } catch (err) {
      setError(getSafeErrorMessage(err, 'No se pudo actualizar el mantenimiento. Conservamos los datos ingresados.'));
    } finally { setGuardando(false); }
  };

  const input = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-red-700 focus:outline-none focus:ring-1 focus:ring-red-700 disabled:bg-slate-50';
  const label = 'mb-1 block text-xs font-medium text-slate-700';
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 sm:p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
    <div className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-slate-200">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3"><span className="rounded-lg bg-red-50 p-2 text-red-700"><Pencil className="h-5 w-5" /></span><div className="min-w-0"><h2 className="font-semibold text-slate-900">Editar mantenimiento #{mantenimiento.numeroReporte}</h2><p className="truncate text-xs text-slate-500">Sede: {mantenimiento.sede} · Equipo asociado sin cambios</p></div></div>
        <button type="button" onClick={onClose} disabled={guardando} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label="Cerrar"><X className="h-5 w-5" /></button>
      </div>
      <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
        <div className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-6">
          {error && <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"><AlertCircle className="h-5 w-5 shrink-0" />{error}</div>}
          <section><h3 className="mb-4 border-b border-slate-100 pb-2 text-sm font-medium">Información general</h3><div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div><label className={label}>Tipo *</label><select name="tipo" value={form.tipo} onChange={update} className={input}><option value="PREVENTIVO">PREVENTIVO</option><option value="CORRECTIVO">CORRECTIVO</option></select></div>
            <div><label className={label}>Fecha de solicitud *</label><input required type="datetime-local" name="fecha" value={form.fecha} onChange={update} className={input} /></div>
            <div><label className={label}>Fecha de entrega</label><input type="datetime-local" name="fechaEntrega" value={form.fechaEntrega} onChange={update} className={input} /></div>
            <div><label className={label}>Sede</label><div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">{mantenimiento.sede}</div></div>
            <div><label className={label}>Unidad *</label><input required maxLength={150} name="unidad" value={form.unidad} onChange={update} className={input} /></div>
            <div><label className={label}>Técnico responsable</label><select name="responsableId" value={form.responsableId} onChange={update} className={input}><option value="">Sin asignar</option>{usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre} ({u.correo})</option>)}</select></div>
          </div></section>
          <section><h3 className="mb-4 border-b border-slate-100 pb-2 text-sm font-medium">Datos del solicitante</h3><div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div><label className={label}>Nombre *</label><input required maxLength={150} name="solicitanteNombre" value={form.solicitanteNombre} onChange={update} className={input} /></div>
            <div><label className={label}>Correo *</label><input required type="email" maxLength={150} name="solicitanteCorreo" value={form.solicitanteCorreo} onChange={update} className={input} /></div>
            <div><label className={label}>Teléfono</label><input type="tel" maxLength={30} name="solicitanteTelefono" value={form.solicitanteTelefono} onChange={update} className={input} /></div>
          </div></section>
          <section><h3 className="mb-4 border-b border-slate-100 pb-2 text-sm font-medium">Detalle del mantenimiento</h3><div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div><label className={label}>Descripción de falla *</label><textarea required rows={3} name="descripcionFalla" value={form.descripcionFalla} onChange={update} className={input} /></div>
            <div><label className={label}>Actividades realizadas *</label><textarea required rows={3} name="actividadesRealizadas" value={form.actividadesRealizadas} onChange={update} className={input} /></div>
            <div><label className={label}>Observaciones técnicas</label><textarea rows={2} name="observacionesTecnicas" value={form.observacionesTecnicas} onChange={update} className={input} /></div>
            <div><label className={label}>Recomendaciones</label><textarea rows={2} name="recomendaciones" value={form.recomendaciones} onChange={update} className={input} /></div>
            <div><label className={label}>Costo ($) *</label><input required type="number" min="0" step="0.01" name="costo" value={form.costo} onChange={update} className={input} /></div>
          </div></section>
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:justify-end sm:px-6"><button type="button" onClick={onClose} disabled={guardando} className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700">Cancelar</button><button disabled={guardando} className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-50">{guardando && <Loader2 className="h-4 w-4 animate-spin" />}{guardando ? 'Guardando...' : 'Guardar cambios'}</button></div>
      </form>
    </div>
  </div>;
}
