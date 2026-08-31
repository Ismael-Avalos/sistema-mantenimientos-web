import type { AuthUser } from "@/types/Auth";

interface SessionListener {
  onAuthenticated: (usuario: AuthUser) => void;
  onUnauthenticated: (message?: string) => void;
  onPasswordChangeRequired: () => void;
}

let accessToken: string | null = null;
const listeners = new Set<SessionListener>();

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function publishAuthenticated(usuario: AuthUser): void {
  listeners.forEach((listener) => listener.onAuthenticated(usuario));
}

export function publishUnauthenticated(message?: string): void {
  accessToken = null;
  listeners.forEach((listener) => listener.onUnauthenticated(message));
}

export function publishPasswordChangeRequired(): void {
  listeners.forEach((listener) => listener.onPasswordChangeRequired());
}

export function subscribeToSession(listener: SessionListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
