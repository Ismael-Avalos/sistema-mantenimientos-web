import { api, authApi } from "./api";
import { getAccessToken } from "./session";
import type {
  AuthResponse,
  AuthUser,
  ChangePasswordPayload,
  LoginCredentials,
} from "@/types/Auth";
import { normalizeAuthResponse, normalizeAuthUser } from "@/utils/roles";

export const loginService = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const { data } = await authApi.post("/api/auth/login", credentials);
  return normalizeAuthResponse(data);
};

export const obtenerUsuarioActual = async (): Promise<AuthUser> => {
  const { data } = await api.get("/api/auth/me");
  return normalizeAuthUser(data);
};

export const cambiarContrasenaService = async (payload: ChangePasswordPayload): Promise<void> => {
  await api.post("/api/auth/cambiar-contrasena", payload);
};

export const logoutService = async (): Promise<void> => {
  const token = getAccessToken();
  await authApi.post(
    "/api/auth/logout",
    undefined,
    token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
  );
};
