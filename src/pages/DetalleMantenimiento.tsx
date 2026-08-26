import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Building2,
  MapPin,
  User,
  Mail,
  Phone,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Lightbulb,
  DollarSign,
  Loader2,
  Wrench,
  AlertCircle
} from 'lucide-react';
import type { MaintenanceResponse } from '../types/Maintenance';
import { obtenerMantenimientoPorId } from '../services/mantenimiento.service';

export const DetalleMantenimientoPage: React.FC = () => {
  const { uuid, id } = useParams<{ uuid: string; id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [mantenimiento, setMantenimiento] = useState<MaintenanceResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Identificador de mantenimiento no especificado.');
      setLoading(false);
      return;
    }

    const cargarMantenimiento = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await obtenerMantenimientoPorId(id);
        setMantenimiento(data);
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'response' in err) {
          const axiosError = err as { response?: { status?: number; data?: { message?: string } | string } };
          if (axiosError.response?.status === 404) {
            setError('El reporte de mantenimiento solicitado no fue encontrado.');
            return;
          }
          if (axiosError.response?.data) {
            const apiMsg = typeof axiosError.response.data === 'string'
              ? axiosError.response.data
              : axiosError.response.data.message;
            setError(apiMsg || 'Ocurrió un error al cargar el mantenimiento.');
            return;
          }
        }
        setError('No se pudo conectar con el servidor para obtener la información del mantenimiento.');
      } finally {
        setLoading(false);
      }
    };

    cargarMantenimiento();
  }, [id]);

  const handleVolver = () => {
    if (uuid) {
      navigate({ pathname: `/equipos/${uuid}`, search: location.search });
    } else {
      navigate(-1);
    }
  };

  const formatearFecha = (fechaStr: string | null | undefined): string => {
    if (!fechaStr) return 'No registrada';
    const date = new Date(fechaStr);
    if (isNaN(date.getTime())) return fechaStr;
    return new Intl.DateTimeFormat('es-SV', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  const formatearCosto = (costo: number): string => {
    return new Intl.NumberFormat('es-SV', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(costo);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="h-10 w-10 animate-spin text-red-700 mb-4" />
        <p className="text-slate-600 text-sm font-medium">Cargando reporte de mantenimiento...</p>
      </div>
    );
  }

  if (error || !mantenimiento) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <button
            type="button"
            onClick={handleVolver}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al equipo
          </button>

          <div className="bg-white rounded-xl p-8 text-center border border-slate-200 shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-700 mb-4">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Error al cargar el mantenimiento</h2>
            <p className="text-slate-600 text-sm mb-6 max-w-md mx-auto">
              {error || 'No fue posible consultar la información del reporte seleccionado.'}
            </p>
            <button
              type="button"
              onClick={handleVolver}
              className="inline-flex items-center justify-center rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-700"
            >
              Regresar al detalle del equipo
            </button>
          </div>
        </div>
      </div>
    );
  }

  const esPreventivo = mantenimiento.tipo === 'PREVENTIVO';

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navegación superior */}
        <div>
          <button
            type="button"
            onClick={handleVolver}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al equipo
          </button>
        </div>

        {/* Encabezado principal */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-red-50 p-3 text-red-700 shrink-0">
                <Wrench className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Reporte de Mantenimiento
                </span>
                <h1 className="text-2xl font-bold text-slate-900">
                  #{mantenimiento.numeroReporte}
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                  esPreventivo
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {mantenimiento.tipo}
              </span>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatearFecha(mantenimiento.fecha)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rejilla de Información: Atención y Contactos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Ubicación y Fechas */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-slate-500" />
              Atención y Fechas
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 block mb-0.5">Sede</span>
                <p className="font-medium text-slate-800 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {mantenimiento.sede}
                </p>
              </div>

              <div>
                <span className="text-slate-500 block mb-0.5">Unidad / Depto.</span>
                <p className="font-medium text-slate-800">{mantenimiento.unidad}</p>
              </div>

              <div>
                <span className="text-slate-500 block mb-0.5">Fecha de Inicio</span>
                <p className="font-medium text-slate-800 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  {formatearFecha(mantenimiento.fecha)}
                </p>
              </div>

              <div>
                <span className="text-slate-500 block mb-0.5">Fecha de Entrega</span>
                <p className="font-medium text-slate-800 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  {mantenimiento.fechaEntrega ? formatearFecha(mantenimiento.fechaEntrega) : 'Pendiente / No registrada'}
                </p>
              </div>
            </div>
          </div>

          {/* Solicitante */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <User className="h-4 w-4 text-slate-500" />
              Solicitante
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 block mb-0.5">Nombre</span>
                <p className="font-medium text-slate-800">{mantenimiento.solicitanteNombre}</p>
              </div>

              <div>
                <span className="text-slate-500 block mb-0.5">Correo Electrónico</span>
                <a
                  href={`mailto:${mantenimiento.solicitanteCorreo}`}
                  className="font-medium text-red-700 hover:underline flex items-center gap-1 break-all"
                >
                  <Mail className="h-3.5 w-3.5 text-red-700 shrink-0" />
                  {mantenimiento.solicitanteCorreo}
                </a>
              </div>

              <div>
                <span className="text-slate-500 block mb-0.5">Teléfono</span>
                {mantenimiento.solicitanteTelefono ? (
                  <a
                    href={`tel:${mantenimiento.solicitanteTelefono}`}
                    className="font-medium text-slate-800 hover:text-red-700 flex items-center gap-1"
                  >
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    {mantenimiento.solicitanteTelefono}
                  </a>
                ) : (
                  <p className="text-slate-400 italic">No proporcionado</p>
                )}
              </div>
            </div>
          </div>

          {/* Responsable Técnico y Costo */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-slate-500" />
                Técnico Responsable
              </h2>

              <div className="text-xs">
                <span className="text-slate-500 block mb-0.5">Asignado a</span>
                <p className="font-semibold text-slate-900 text-sm">
                  {mantenimiento.responsableNombre || 'Sin asignar'}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600 text-xs font-medium">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                  <span>Costo Total:</span>
                </div>
                <span className="text-lg font-bold text-slate-900">
                  {formatearCosto(mantenimiento.costo)}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Detalles Técnicos del Trabajo */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <FileText className="h-5 w-5 text-red-700" />
            Detalle Técnico de la Intervención
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Descripción de Falla */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Descripción de Falla / Motivo
              </h3>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 text-sm text-slate-800 whitespace-pre-line">
                {mantenimiento.descripcionFalla}
              </div>
            </div>

            {/* Actividades Realizadas */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Actividades Realizadas
              </h3>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 text-sm text-slate-800 whitespace-pre-line">
                {mantenimiento.actividadesRealizadas}
              </div>
            </div>
          </div>

          {/* Observaciones Técnicas (Condicional) */}
          {mantenimiento.observacionesTecnicas && (
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-slate-500" />
                Observaciones Técnicas
              </h3>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 text-sm text-slate-800 whitespace-pre-line">
                {mantenimiento.observacionesTecnicas}
              </div>
            </div>
          )}

          {/* Recomendaciones (Condicional) */}
          {mantenimiento.recomendaciones && (
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                Recomendaciones
              </h3>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 text-sm text-slate-800 whitespace-pre-line">
                {mantenimiento.recomendaciones}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
