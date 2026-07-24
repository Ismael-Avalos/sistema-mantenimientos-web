import { api } from "./api";
import type { Equipo } from "../types/Equipo";

export type CrearEquipoDTO = Omit<Equipo, "id" | "qrUuid" | "createdAt">;

export async function obtenerEquipos(): Promise<Equipo[]> {
  const response = await api.get("/maintenances/assets");
  return response.data;
}

export async function crearEquipo(datos: CrearEquipoDTO): Promise<Equipo> {
  const response = await api.post("/maintenances/assets", datos);
  return response.data;
}