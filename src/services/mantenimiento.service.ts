import { api } from './api';
import type { MaintenanceResponse, CrearMantenimientoDTO } from '../types/Maintenance';

// Obtener el historial filtrando por el UUID del QR del equipo
export const obtenerMantenimientosPorQrUuid = async (qrUuid: string): Promise<MaintenanceResponse[]> => {
  const { data } = await api.get<MaintenanceResponse[]>(`/api/mantenimientos/equipo/qr/${qrUuid}`);
  return data;
};

// Obtener el historial filtrando por el ID de la BD del equipo
export const obtenerMantenimientosPorEquipoId = async (equipoId: string): Promise<MaintenanceResponse[]> => {
  const { data } = await api.get<MaintenanceResponse[]>(`/api/mantenimientos/equipo/${equipoId}`);
  return data;
};

// Obtener un mantenimiento por su ID
export const obtenerMantenimientoPorId = async (id: string): Promise<MaintenanceResponse> => {
  const { data } = await api.get<MaintenanceResponse>(`/api/mantenimientos/${id}`);
  return data;
};

// Crear un nuevo mantenimiento
export const crearMantenimiento = async (datos: CrearMantenimientoDTO): Promise<MaintenanceResponse> => {
  const { data } = await api.post<MaintenanceResponse>('/api/mantenimientos', datos);
  return data;
};