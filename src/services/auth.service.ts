import { api } from "./api";
import type { User } from "@/context/AuthContext";

export interface LoginCredentials {
  correo: string;
  contrasena: string;
}

export interface AuthResponse {
  token: string;
  usuario: User;
}

export interface CambiarContrasenaPayload {
  usuarioId: string;
  nuevaContrasena: string;
}

export const loginService = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>("/api/auth/login", credentials);
  return data;
};

export const cambiarContrasenaService = async (payload: CambiarContrasenaPayload): Promise<void> => {
  await api.post("/api/auth/cambiar-contrasena", payload);
};