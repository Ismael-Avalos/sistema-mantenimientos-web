import { api } from "./api";
import type { Equipo } from "../types/Equipo";

export async function obtenerEquipos(): Promise<Equipo[]> {
  const response = await api.get("/maintenances/assets");
  return response.data;
}