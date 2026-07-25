import { api } from "./api";
import type { Equipo, CrearEquipoDTO } from "../types/Equipo";

// Re-exportamos el DTO para facilitar la importación en componentes
export type { CrearEquipoDTO };

export async function obtenerEquipos(): Promise<Equipo[]> {
  const response = await api.get("/maintenances/assets");
  return response.data;
}

export async function crearEquipo(datos: CrearEquipoDTO): Promise<Equipo> {
  const response = await api.post("/maintenances/assets", datos);
  return response.data;
}