import { validarFechasMantenimiento } from '../../utils/fechas';
import React, { useState, useEffect } from 'react';
import { X, Loader2, Wrench, AlertCircle } from 'lucide-react';
import type { MaintenanceType, CrearMantenimientoDTO } from '../../types/Maintenance';
import { crearMantenimiento } from '../../services/mantenimiento.service';
import { obtenerUsuarios } from '../../services/usuarios.service';
import { obtenerUbicaciones } from '../../services/ubicaciones.service';
import type { UserResponse } from '../../types/Usuario';
import type { Equipo } from '../../types/Equipo';
import type { Ubicacion } from '../../types/Ubicacion';

interface ModalCrearMantenimientoProps {
  isOpen: boolean;
  onClose: () => void;
  equipo: Equipo;
  onMantenimientoCreado: () => Promise<void> | void;
}

interface FormState {
  tipo: MaintenanceType;
  fecha: string;
  fechaEntrega: string;
  unidad: string;
  solicitanteNombre: string;
  solicitanteCorreo: string;
  solicitanteTelefono: string;
  responsableId: string;
  descripcionFalla: string;
  actividadesRealizadas: string;
  observacionesTecnicas: string;
  recomendaciones: string;
  costo: string;
}

const initialFormState: FormState = {
  tipo: 'PREVENTIVO',
  fecha: '',
  fechaEntrega: '',
  unidad: '',
  solicitanteNombre: '',
  solicitanteCorreo: '',
  solicitanteTelefono: '',
  responsableId: '',
  descripcionFalla: '',
  actividadesRealizadas: '',
  observacionesTecnicas: '',
  recomendaciones: '',
  costo: '0',
};

export const ModalCrearMantenimiento: React.FC<ModalCrearMantenimientoProps> = ({
  isOpen,
  onClose,
  equipo,
  onMantenimientoCreado,
}) => {
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [usuarios, setUsuarios] = useState<UserResponse[]>([]);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState<boolean>(false);
  const [loadingUbicaciones, setLoadingUbicaciones] = useState(false);
  const [errorUbicaciones, setErrorUbicaciones] = useState<string | null>(null);
  const [busquedaUnidad, setBusquedaUnidad] = useState('');
  const [listaUnidadAbierta, setListaUnidadAbierta] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormState);
      setErrorMessage(null);
      setBusquedaUnidad('');
      setListaUnidadAbierta(false);
      fetchUsuarios();
      fetchUbicaciones();
    }
  }, [isOpen]);

  const fetchUsuarios = async () => {
    try {
      setLoadingUsuarios(true);
      const data = await obtenerUsuarios();
      setUsuarios(data.filter((u) => u.activo));
    } catch {
      // Si falla la carga de usuarios, permitimos continuar sin interrumpir el flujo principal
      setUsuarios([]);
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const fetchUbicaciones = async () => {
    try {
      setLoadingUbicaciones(true);
      setErrorUbicaciones(null);
      setUbicaciones(await obtenerUbicaciones());
    } catch {
      setUbicaciones([]);
      setErrorUbicaciones('No se pudieron cargar las ubicaciones.');
    } finally {
      setLoadingUbicaciones(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        if (listaUnidadAbierta) {
          setListaUnidadAbierta(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, listaUnidadAbierta, onClose]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const errorFechas = validarFechasMantenimiento(formData.fecha, formData.fechaEntrega, equipo.fechaAdquisicion);
    if (errorFechas) {
      setErrorMessage(errorFechas);
      return;
    }
    const costoNum = parseFloat(formData.costo);
    if (isNaN(costoNum) || costoNum < 0) {
      setErrorMessage('El costo debe ser un número mayor o igual a 0.');
      return;
    }

    if (!formData.unidad) {
      setErrorMessage('Selecciona una ubicación para la unidad o departamento.');
      return;
    }

    if (errorUbicaciones) {
      setErrorMessage('No es posible registrar el mantenimiento sin cargar las ubicaciones.');
      return;
    }

    const payload: CrearMantenimientoDTO = {
      equipoId: equipo.id,
      tipo: formData.tipo,
      fecha: formData.fecha,
      fechaEntrega: formData.fechaEntrega.trim() !== '' ? formData.fechaEntrega : null,
      sede: 'Sonsonate',
      unidad: formData.unidad.trim(),
      solicitanteNombre: formData.solicitanteNombre.trim(),
      solicitanteCorreo: formData.solicitanteCorreo.trim(),
      solicitanteTelefono: formData.solicitanteTelefono.trim() !== '' ? formData.solicitanteTelefono.trim() : null,
      responsableId: formData.responsableId.trim() !== '' ? formData.responsableId : null,
      descripcionFalla: formData.descripcionFalla.trim(),
      actividadesRealizadas: formData.actividadesRealizadas.trim(),
      observacionesTecnicas: formData.observacionesTecnicas.trim() !== '' ? formData.observacionesTecnicas.trim() : null,
      recomendaciones: formData.recomendaciones.trim() !== '' ? formData.recomendaciones.trim() : null,
      costo: costoNum,
    };

    try {
      setIsSubmitting(true);
      await crearMantenimiento(payload);
      await onMantenimientoCreado();
      onClose();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } | string } };
        if (axiosError.response?.data) {
          const apiMsg = typeof axiosError.response.data === 'string'
            ? axiosError.response.data
            : axiosError.response.data.message;
          setErrorMessage(apiMsg || 'Ocurrió un error al registrar el mantenimiento.');
          return;
        }
      }
      setErrorMessage('Ocurrió un error al conectar con el servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const normalizarTexto = (texto: string) =>
    texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es-SV');

  const ubicacionesFiltradas = ubicaciones.filter((ubicacion) =>
    normalizarTexto(ubicacion.nombre).startsWith(normalizarTexto(busquedaUnidad.trim()))
  );

  const seleccionarUnidad = (ubicacion: Ubicacion) => {
    setFormData((prev) => ({ ...prev, unidad: ubicacion.nombre }));
    setBusquedaUnidad('');
    setListaUnidadAbierta(false);
  };

  const limpiarUnidad = () => {
    setFormData((prev) => ({ ...prev, unidad: '' }));
    setBusquedaUnidad('');
    setListaUnidadAbierta(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-xl bg-white dark:bg-slate-900 shadow-xl ring-1 ring-slate-200 dark:ring-slate-700">
        
        {/* Encabezado fijo */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 dark:bg-red-950/50 p-2 text-red-700 dark:text-red-300">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Registrar Mantenimiento
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {equipo.nombre ? `${equipo.nombre} ` : ''}
                {equipo.codigoInventario ? `(${equipo.codigoInventario})` : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-1 text-slate-400 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none focus:ring-2 focus:ring-red-700 dark:focus:ring-red-400 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Formulario con scroll interno */}
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {errorMessage && (
              <div className="flex items-start gap-3 rounded-lg bg-red-50 dark:bg-red-950/50 p-4 text-sm text-red-800 dark:text-red-300 border border-red-200 dark:border-red-900">
                <AlertCircle className="h-5 w-5 text-red-700 dark:text-red-300 shrink-0 mt-0.5" />
                <div className="flex-1">{errorMessage}</div>
              </div>
            )}

            {/* Clasificación y Fechas */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
                Información General
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="tipo" className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
                    Tipo de Mantenimiento <span className="text-red-700 dark:text-red-300">*</span>
                  </label>
                  <select
                    id="tipo"
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    required
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-red-700 focus:outline-none focus:ring-1 focus:ring-red-700 dark:focus:ring-red-400 disabled:bg-slate-50 dark:disabled:bg-slate-950 disabled:opacity-50"
                  >
                    <option value="PREVENTIVO">PREVENTIVO</option>
                    <option value="CORRECTIVO">CORRECTIVO</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="fecha" className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
                    Fecha de inicio / solicitud <span className="text-red-700 dark:text-red-300">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    id="fecha"
                    name="fecha" min={equipo.fechaAdquisicion.slice(0, 10) + "T00:00"} max={formData.fechaEntrega || undefined}
                    value={formData.fecha}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    required
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-red-700 focus:outline-none focus:ring-1 focus:ring-red-700 dark:focus:ring-red-400 disabled:bg-slate-50 dark:disabled:bg-slate-950 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label htmlFor="fechaEntrega" className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
                    Fecha de Entrega
                  </label>
                  <input
                    type="datetime-local"
                    id="fechaEntrega"
                    name="fechaEntrega" min={formData.fecha && formData.fecha.slice(0, 10) >= equipo.fechaAdquisicion.slice(0, 10) ? formData.fecha : equipo.fechaAdquisicion.slice(0, 10) + "T00:00"}
                    value={formData.fechaEntrega}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-red-700 focus:outline-none focus:ring-1 focus:ring-red-700 dark:focus:ring-red-400 disabled:bg-slate-50 dark:disabled:bg-slate-950 disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Ubicación y Personal */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
                Ubicación y Asignación
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-200">Sede</span>
                  <div className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                    Sonsonate
                  </div>
                </div>

                <div className="relative">
                  <label htmlFor="buscarUnidad" className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-200">
                    Unidad / Departamento <span className="text-red-700 dark:text-red-300">*</span>
                  </label>
                  {formData.unidad && (
                    <div className="mb-2 flex items-center justify-between gap-2 rounded-lg border border-red-100 dark:border-red-900 bg-red-50 dark:bg-red-950/50 px-3 py-2 text-sm text-red-800 dark:text-red-300">
                      <span className="truncate">{formData.unidad}</span>
                      <button
                        type="button"
                        onClick={limpiarUnidad}
                        disabled={isSubmitting}
                        className="shrink-0 text-xs font-semibold hover:text-red-950 dark:hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-red-700 dark:focus:ring-red-400 disabled:opacity-50"
                      >
                        Limpiar
                      </button>
                    </div>
                  )}
                  <input
                    type="text"
                    id="buscarUnidad"
                    value={busquedaUnidad}
                    onChange={(event) => {
                      setBusquedaUnidad(event.target.value);
                      setListaUnidadAbierta(true);
                    }}
                    onFocus={() => setListaUnidadAbierta(true)}
                    disabled={isSubmitting || loadingUbicaciones || Boolean(errorUbicaciones)}
                    placeholder={loadingUbicaciones ? 'Cargando ubicaciones...' : 'Escribe para buscar una ubicación'}
                    aria-autocomplete="list"
                    aria-expanded={listaUnidadAbierta}
                    aria-controls="lista-unidades"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-red-700 focus:outline-none focus:ring-1 focus:ring-red-700 dark:focus:ring-red-400 disabled:bg-slate-50 dark:disabled:bg-slate-950 disabled:opacity-50"
                  />
                  {errorUbicaciones && <p className="mt-1 text-xs text-red-700 dark:text-red-300">{errorUbicaciones}</p>}
                  {listaUnidadAbierta && !loadingUbicaciones && !errorUbicaciones && (
                    <div
                      id="lista-unidades"
                      role="listbox"
                      className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1 shadow-lg"
                    >
                      {ubicacionesFiltradas.length === 0 ? (
                        <p className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">No se encontraron ubicaciones.</p>
                      ) : (
                        ubicacionesFiltradas.map((ubicacion) => (
                          <button
                            key={ubicacion.id}
                            type="button"
                            role="option"
                            aria-selected={formData.unidad === ubicacion.nombre}
                            onClick={() => seleccionarUnidad(ubicacion)}
                            className="flex w-full flex-col rounded-md px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-800 dark:hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-red-700 dark:focus:ring-red-400"
                          >
                            <span className="font-medium">{ubicacion.nombre}</span>
                            {ubicacion.edificio && <span className="text-xs text-slate-400 dark:text-slate-400">{ubicacion.edificio}</span>}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="responsableId" className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
                    Técnico Responsable
                  </label>
                  <select
                    id="responsableId"
                    name="responsableId"
                    value={formData.responsableId}
                    onChange={handleChange}
                    disabled={isSubmitting || loadingUsuarios}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-red-700 focus:outline-none focus:ring-1 focus:ring-red-700 dark:focus:ring-red-400 disabled:bg-slate-50 dark:disabled:bg-slate-950 disabled:opacity-50"
                  >
                    <option value="">Sin asignar</option>
                    {usuarios.map((usr) => (
                      <option key={usr.id} value={usr.id}>
                        {usr.nombre} ({usr.correo})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Solicitante */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
                Datos del Solicitante
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="solicitanteNombre" className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
                    Nombre Completo <span className="text-red-700 dark:text-red-300">*</span>
                  </label>
                  <input
                    type="text"
                    id="solicitanteNombre"
                    name="solicitanteNombre"
                    maxLength={150}
                    value={formData.solicitanteNombre}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    required
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-red-700 focus:outline-none focus:ring-1 focus:ring-red-700 dark:focus:ring-red-400 disabled:bg-slate-50 dark:disabled:bg-slate-950 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label htmlFor="solicitanteCorreo" className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
                    Correo Electrónico <span className="text-red-700 dark:text-red-300">*</span>
                  </label>
                  <input
                    type="email"
                    id="solicitanteCorreo"
                    name="solicitanteCorreo"
                    maxLength={150}
                    value={formData.solicitanteCorreo}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    required
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-red-700 focus:outline-none focus:ring-1 focus:ring-red-700 dark:focus:ring-red-400 disabled:bg-slate-50 dark:disabled:bg-slate-950 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label htmlFor="solicitanteTelefono" className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="solicitanteTelefono"
                    name="solicitanteTelefono"
                    maxLength={30}
                    value={formData.solicitanteTelefono}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-red-700 focus:outline-none focus:ring-1 focus:ring-red-700 dark:focus:ring-red-400 disabled:bg-slate-50 dark:disabled:bg-slate-950 disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Detalles del trabajo */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
                Detalle del Mantenimiento
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="descripcionFalla" className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
                    Descripción de Falla / Motivo <span className="text-red-700 dark:text-red-300">*</span>
                  </label>
                  <textarea
                    id="descripcionFalla"
                    name="descripcionFalla"
                    rows={3}
                    value={formData.descripcionFalla}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    required
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-red-700 focus:outline-none focus:ring-1 focus:ring-red-700 dark:focus:ring-red-400 disabled:bg-slate-50 dark:disabled:bg-slate-950 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label htmlFor="actividadesRealizadas" className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
                    Actividades Realizadas <span className="text-red-700 dark:text-red-300">*</span>
                  </label>
                  <textarea
                    id="actividadesRealizadas"
                    name="actividadesRealizadas"
                    rows={3}
                    value={formData.actividadesRealizadas}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    required
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-red-700 focus:outline-none focus:ring-1 focus:ring-red-700 dark:focus:ring-red-400 disabled:bg-slate-50 dark:disabled:bg-slate-950 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label htmlFor="observacionesTecnicas" className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
                    Observaciones Técnicas
                  </label>
                  <textarea
                    id="observacionesTecnicas"
                    name="observacionesTecnicas"
                    rows={2}
                    value={formData.observacionesTecnicas}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-red-700 focus:outline-none focus:ring-1 focus:ring-red-700 dark:focus:ring-red-400 disabled:bg-slate-50 dark:disabled:bg-slate-950 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label htmlFor="recomendaciones" className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
                    Recomendaciones
                  </label>
                  <textarea
                    id="recomendaciones"
                    name="recomendaciones"
                    rows={2}
                    value={formData.recomendaciones}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-red-700 focus:outline-none focus:ring-1 focus:ring-red-700 dark:focus:ring-red-400 disabled:bg-slate-50 dark:disabled:bg-slate-950 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="w-full md:w-1/3">
                <label htmlFor="costo" className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
                  Costo ($) <span className="text-red-700 dark:text-red-300">*</span>
                </label>
                <input
                  type="number"
                  id="costo"
                  name="costo"
                  min="0"
                  step="0.01"
                  value={formData.costo}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  required
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-red-700 focus:outline-none focus:ring-1 focus:ring-red-700 dark:focus:ring-red-400 disabled:bg-slate-50 dark:disabled:bg-slate-950 disabled:opacity-50"
                />
              </div>
            </div>

          </div>

          {/* Pie de modal con acciones */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-red-700 dark:focus:ring-red-400 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-700 dark:focus:ring-red-400 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Guardando...' : 'Guardar Mantenimiento'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
