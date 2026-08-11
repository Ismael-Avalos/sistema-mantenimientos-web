import { api } from "./api";
import type { UserResponse, CreateUserDTO } from "../types/Usuario";

export type { CreateUserDTO };

export async function obtenerUsuarios(): Promise<UserResponse[]> {
  const response = await api.get<UserResponse[]>("/maintenances/users");
  return response.data;
}

export async function crearUsuario(datos: CreateUserDTO): Promise<UserResponse> {
  const response = await api.post<UserResponse>("/maintenances/users", datos);
  return response.data;
}