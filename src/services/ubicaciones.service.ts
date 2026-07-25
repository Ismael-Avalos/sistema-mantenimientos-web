import { api } from "./api";
import type { Ubicacion, CrearUbicacionDTO } from "../types/Ubicacion";

// ✅ Re-exportamos para que ModalCrearUbicacion.tsx pueda importarlo desde el servicio
export type { CrearUbicacionDTO };

export async function obtenerUbicaciones(): Promise<Ubicacion[]> {
  const response = await api.get("/maintenances/locations");
  return response.data;
}

export async function obtenerUbicacionPorId(id: string): Promise<Ubicacion> {
  const response = await api.get(`/maintenances/locations/${id}`);
  return response.data;
}

export async function crearUbicacion(datos: CrearUbicacionDTO): Promise<Ubicacion> {
  const response = await api.post("/maintenances/locations", datos);
  return response.data;
}