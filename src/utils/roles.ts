import type { AuthResponse, AuthUser, UserRole } from "@/types/Auth";

type AuthUserPayload = Omit<AuthUser, "rol"> & { rol: unknown };
type AuthResponsePayload = Omit<AuthResponse, "usuario"> & { usuario: AuthUserPayload };

const ROLE_ALIASES: Record<string, UserRole> = {
  ADMIN: "ADMIN",
  ADMINISTRADOR: "ADMIN",
  TECNICO: "TECNICO",
};

/** Convierte los nombres de rol de BD/JWT al vocabulario interno del frontend. */
export function normalizeUserRole(role: unknown): UserRole | null {
  if (typeof role !== "string") return null;

  const normalized = role
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^ROLE_/, "");

  return ROLE_ALIASES[normalized] ?? null;
}

export function normalizeAuthUser(user: AuthUserPayload): AuthUser {
  const role = normalizeUserRole(user.rol);
  if (!role) {
    throw new Error("La sesión contiene un rol no reconocido.");
  }

  return { ...user, rol: role };
}

export function normalizeAuthResponse(response: AuthResponsePayload): AuthResponse {
  return { ...response, usuario: normalizeAuthUser(response.usuario) };
}

export function hasRole(role: unknown, allowedRoles: readonly UserRole[]): boolean {
  const normalizedRole = normalizeUserRole(role);
  return normalizedRole !== null && allowedRoles.includes(normalizedRole);
}
