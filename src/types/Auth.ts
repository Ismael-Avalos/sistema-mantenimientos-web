export type UserRole = "ADMIN" | "TECNICO";

export interface AuthUser {
  id: string;
  nombre: string;
  correo: string;
  rol: UserRole;
  activo: boolean;
  debeCambiarContrasena: boolean;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  usuario: AuthUser;
}

export interface LoginCredentials {
  correo: string;
  contrasena: string;
}

export interface ChangePasswordPayload {
  contrasenaActual: string;
  nuevaContrasena: string;
}

export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  code?: string;
  timestamp?: string;
  errors?: Record<string, string | string[]>;
}
