import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { AuthContext } from "./auth-context";
import {
  cambiarContrasenaService,
  loginService,
  logoutService,
  obtenerUsuarioActual,
} from "@/services/auth.service";
import { refreshAccessToken } from "@/services/api";
import {
  getAccessToken,
  publishUnauthenticated,
  setAccessToken,
  subscribeToSession,
} from "@/services/session";
import type {
  AuthUser,
  ChangePasswordPayload,
  LoginCredentials,
} from "@/types/Auth";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [accessToken, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setTokenState(null);
    setUser(null);
  }, []);

  const restoreSession = useCallback(async () => {
    try {
      const session = await refreshAccessToken({ silent: true });
      setTokenState(session.accessToken);
      setUser(await obtenerUsuarioActual());
    } catch {
      clearSession();
    } finally {
      setIsInitializing(false);
    }
  }, [clearSession]);

  useEffect(() => {
    const unsubscribe = subscribeToSession({
      onAuthenticated: (usuario) => {
        setTokenState(getAccessToken());
        setUser(usuario);
      },
      onUnauthenticated: (message) => {
        clearSession();
        setSessionMessage(message ?? null);
      },
      onPasswordChangeRequired: () => {
        setUser((currentUser) =>
          currentUser ? { ...currentUser, debeCambiarContrasena: true } : currentUser
        );
      },
    });

    const restoreId = window.setTimeout(() => {
      void restoreSession();
    }, 0);

    return () => {
      window.clearTimeout(restoreId);
      unsubscribe();
    };
  }, [clearSession, restoreSession]);

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthUser> => {
    const session = await loginService(credentials);
    setAccessToken(session.accessToken);
    setTokenState(session.accessToken);
    setUser(session.usuario);
    setSessionMessage(null);
    return session.usuario;
  }, []);

  const refresh = useCallback(async (): Promise<AuthUser> => {
    const session = await refreshAccessToken();
    setTokenState(session.accessToken);
    setUser(session.usuario);
    return session.usuario;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutService();
    } finally {
      publishUnauthenticated();
      clearSession();
    }
  }, [clearSession]);

  const changePassword = useCallback(
    async (payload: ChangePasswordPayload) => {
      await cambiarContrasenaService(payload);
      publishUnauthenticated();
      clearSession();
    },
    [clearSession]
  );

  const value = useMemo(
    () => ({
      accessToken,
      user,
      isAuthenticated: Boolean(accessToken && user),
      isInitializing,
      sessionMessage,
      login,
      logout,
      refresh,
      restoreSession,
      changePassword,
    }),
    [
      accessToken,
      user,
      isInitializing,
      sessionMessage,
      login,
      logout,
      refresh,
      restoreSession,
      changePassword,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
