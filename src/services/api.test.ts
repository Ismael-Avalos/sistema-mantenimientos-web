import MockAdapter from "axios-mock-adapter";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { api, authApi, refreshAccessToken } from "./api";
import { cambiarContrasenaService, logoutService } from "./auth.service";
import { getProblemDetails } from "./problem-details";
import { getAccessToken, setAccessToken } from "./session";
import type { AuthResponse } from "@/types/Auth";

const session: AuthResponse = {
  accessToken: "access-token-nuevo",
  tokenType: "Bearer",
  expiresIn: 900,
  usuario: {
    id: "user-id",
    nombre: "Usuario Prueba",
    correo: "usuario@dominio.com",
    rol: "ADMIN",
    activo: true,
    debeCambiarContrasena: false,
  },
};

describe("cliente HTTP autenticado", () => {
  const apiMock = new MockAdapter(api);
  const authMock = new MockAdapter(authApi);

  beforeEach(() => {
    apiMock.reset();
    authMock.reset();
    setAccessToken(null);
  });

  afterEach(() => {
    apiMock.reset();
    authMock.reset();
  });

  it("envía credenciales para transportar la cookie HttpOnly", () => {
    expect(api.defaults.withCredentials).toBe(true);
    expect(authApi.defaults.withCredentials).toBe(true);
  });

  it("incluye el access token en las llamadas protegidas", async () => {
    setAccessToken("access-token-actual");
    apiMock.onGet("/recurso").reply(200, { ok: true });

    await api.get("/recurso");

    expect(apiMock.history.get[0].headers?.Authorization).toBe(
      "Bearer access-token-actual"
    );
  });

  it("realiza un único refresh para varios 401 concurrentes y reintenta una sola vez", async () => {
    setAccessToken("access-token-vencido");
    authMock.onPost("/api/auth/refresh").reply(200, session);
    apiMock
      .onGet("/recurso")
      .replyOnce(401, { code: "AUTH_TOKEN_EXPIRED" })
      .onGet("/recurso")
      .replyOnce(401, { code: "AUTH_TOKEN_EXPIRED" })
      .onGet("/recurso")
      .reply(200, { ok: true });

    const responses = await Promise.all([api.get("/recurso"), api.get("/recurso")]);

    expect(responses.every(({ status }) => status === 200)).toBe(true);
    expect(authMock.history.post).toHaveLength(1);
    expect(apiMock.history.get).toHaveLength(4);
    expect(apiMock.history.get.slice(-2).every(
      ({ headers }) => headers?.Authorization === "Bearer access-token-nuevo"
    )).toBe(true);
  });

  it("limpia el access token cuando falla el refresh", async () => {
    setAccessToken("access-token-vencido");
    authMock.onPost("/api/auth/refresh").reply(401, {
      code: "AUTH_REFRESH_EXPIRED",
    });

    await expect(refreshAccessToken()).rejects.toBeDefined();
    expect(getAccessToken()).toBeNull();
  });

  it("cambia la contraseña sin enviar usuarioId", async () => {
    setAccessToken("access-token-actual");
    apiMock.onPost("/api/auth/cambiar-contrasena").reply(204);

    await cambiarContrasenaService({
      contrasenaActual: "Anterior#1234",
      nuevaContrasena: "NuevaSegura#1234",
    });

    const body = JSON.parse(apiMock.history.post[0].data as string) as Record<string, string>;
    expect(body).toEqual({
      contrasenaActual: "Anterior#1234",
      nuevaContrasena: "NuevaSegura#1234",
    });
    expect(body).not.toHaveProperty("usuarioId");
  });

  it("envía Bearer y cookie al cerrar sesión", async () => {
    setAccessToken("access-token-actual");
    authMock.onPost("/api/auth/logout").reply(204);

    await logoutService();

    expect(authMock.history.post[0].headers?.Authorization).toBe(
      "Bearer access-token-actual"
    );
  });

  it("interpreta Problem Details sin exponer el objeto completo", () => {
    const problem = getProblemDetails({
      isAxiosError: true,
      response: {
        data: {
          status: 403,
          code: "AUTH_ACCESS_DENIED",
          detail: "Permisos insuficientes.",
        },
      },
    });

    expect(problem).toMatchObject({
      status: 403,
      code: "AUTH_ACCESS_DENIED",
      detail: "Permisos insuficientes.",
    });
  });
});
