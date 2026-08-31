import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";

import type { AuthResponse, ProblemDetails } from "@/types/Auth";
import { publishApiConnectionStatus } from "./api-connection";
import { normalizeAuthResponse } from "@/utils/roles";
import {
  getAccessToken,
  publishAuthenticated,
  publishPasswordChangeRequired,
  publishUnauthenticated,
  setAccessToken,
} from "./session";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export const authApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

type RetryableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<AuthResponse> | null = null;

export function refreshAccessToken(options: { silent?: boolean } = {}): Promise<AuthResponse> {
  if (!refreshPromise) {
    refreshPromise = authApi
      .post<AuthResponse>("/api/auth/refresh")
      .then(({ data }) => {
        const session = normalizeAuthResponse(data);
        setAccessToken(session.accessToken);
        publishAuthenticated(session.usuario);
        return session;
      })
      .catch((error: unknown) => {
        const code = axios.isAxiosError<ProblemDetails>(error)
          ? error.response?.data?.code
          : undefined;

        if (options.silent) {
          setAccessToken(null);
        } else {
          publishUnauthenticated(
            code === "AUTH_REFRESH_REUSED"
              ? "La sesión dejó de ser válida. Inicia sesión nuevamente."
              : "Tu sesión expiró. Inicia sesión nuevamente."
          );
        }
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

api.interceptors.response.use(
  (response) => {
    publishApiConnectionStatus(true);
    return response;
  },
  async (error: AxiosError<ProblemDetails>) => {
    publishApiConnectionStatus(error.response !== undefined);

    const config = error.config as RetryableRequestConfig | undefined;
    const status = error.response?.status;
    const code = error.response?.data?.code;

    if (status === 403 && code === "AUTH_PASSWORD_CHANGE_REQUIRED") {
      publishPasswordChangeRequired();
      return Promise.reject(error);
    }

    if (status === 403 && (code === "AUTH_ACCESS_DENIED" || code === "AUTH_ORIGIN_DENIED")) {
      window.dispatchEvent(
        new CustomEvent("auth:access-denied", {
          detail: error.response?.data?.detail || "No tienes permisos para realizar esta acción.",
        })
      );
      return Promise.reject(error);
    }

    if (status !== 401 || !config || config._retry) {
      return Promise.reject(error);
    }

    config._retry = true;

    try {
      const session = await refreshAccessToken();
      config.headers.Authorization = `Bearer ${session.accessToken}`;
      return api(config);
    } catch {
      return Promise.reject(error);
    }
  }
);
