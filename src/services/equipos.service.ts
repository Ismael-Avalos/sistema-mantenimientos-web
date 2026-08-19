import { api } from "./api";
import type { Equipo, CrearEquipoDTO } from "../types/Equipo";

export type { CrearEquipoDTO };

export async function obtenerEquipos(): Promise<Equipo[]> {
  const response = await api.get("/maintenances/assets");
  return response.data;
}

export async function crearEquipo(datos: CrearEquipoDTO): Promise<Equipo> {
  const response = await api.post("/maintenances/assets", datos);
  return response.data;
}

export async function actualizarEquipo(id: number | string, datos: CrearEquipoDTO): Promise<Equipo> {
  const response = await api.put(`/maintenances/assets/${id}`, datos);
  return response.data;
}

export async function eliminarEquipo(id: number | string): Promise<void> {
  await api.delete(`/maintenances/assets/${id}`);
}

// Nueva función para obtener el equipo al escanear el QR
export async function obtenerEquipoPorQrUuid(qrUuid: string): Promise<Equipo> {
  const response = await api.get(`/maintenances/assets/qr/${qrUuid}`);
  return response.data;
}