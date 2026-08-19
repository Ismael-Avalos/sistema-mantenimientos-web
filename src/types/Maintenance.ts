export type MaintenanceType = 'PREVENTIVO' | 'CORRECTIVO';

export interface MaintenanceResponse {
  id: string;
  numeroReporte: number;
  tipo: MaintenanceType;
  fecha: string;
  fechaEntrega?: string | null;
  sede: string;
  unidad: string;
  solicitanteNombre: string;
  solicitanteCorreo: string;
  solicitanteTelefono?: string | null;
  descripcionFalla: string;
  actividadesRealizadas: string;
  observacionesTecnicas?: string | null;
  recomendaciones?: string | null;
  costo: number;
  responsableId?: string | null;
  responsableNombre: string;
}