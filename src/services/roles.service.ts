import { api } from "./api";
import type { Rol } from "../types/Rol";

export async function obtenerRoles(): Promise<Rol[]> {
  const response = await api.get<Rol[]>("/maintenances/roles");
  return response.data;
}