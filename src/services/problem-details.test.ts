import axios from "axios";
import { describe, expect, it } from "vitest";

import { normalizeApiError } from "./problem-details";

function axiosError(status: number, data?: unknown) {
  return new axios.AxiosError("technical axios message", "ERR_BAD_RESPONSE", undefined, undefined, {
    status, data, statusText: "Error", headers: {}, config: { headers: new axios.AxiosHeaders() },
  });
}

describe("normalizeApiError", () => {
  it("normaliza RFC 7807 duplicado e identifica el campo serial", () => {
    const error = normalizeApiError(axiosError(409, {
      type: "https://api.mantenimientos.local/problems/duplicate_entry", title: "Recurso Duplicado", status: 409,
      detail: "El número de serie ingresado ya se encuentra registrado en el sistema.", instance: "/maintenances/assets",
      code: "DUPLICATE_ENTRY", timestamp: "2026-08-31T00:00:00Z",
    }));
    expect(error).toMatchObject({ code: "DUPLICATE_ENTRY", kind: "warning", field: "serialEquipo" });
    expect(error.detail).toBe("El número de serie ingresado ya se encuentra registrado en el sistema.");
  });

  it.each([
    ["categoría", "Ya existe una categoría con el nombre ingresado.", "nombre-categoria"],
    ["usuario", "El correo electrónico ingresado ya se encuentra registrado en el sistema.", "correo"],
    ["ubicación", "Ya existe una ubicación con ese nombre en el edificio indicado.", "nombre"],
  ])("conserva title/detail del 409 de %s y asigna su campo", (_module, detail, field) => {
    const error = normalizeApiError(axiosError(409, { title: "Recurso Duplicado", status: 409, detail, code: "DUPLICATE_ENTRY" }), { defaultField: field });
    expect(error).toMatchObject({ title: "Recurso Duplicado", detail, code: "DUPLICATE_ENTRY", field });
  });

  it("expone errores de validación por campo", () => {
    const error = normalizeApiError(axiosError(400, { code: "VALIDATION_ERROR", detail: "Datos inválidos", errors: { codigoInventario: ["El código es obligatorio"] } }));
    expect(error.fieldErrors.codigoInventario).toBe("El código es obligatorio");
    expect(error.field).toBe("codigoInventario");
  });

  it("reemplaza detalles internos de errores 500", () => {
    const error = normalizeApiError(axiosError(500, { code: "INTERNAL_ERROR", detail: "SQL constraint assets_serial_key" }));
    expect(error.detail).not.toContain("SQL");
    expect(error.kind).toBe("server");
  });

  it("distingue red y timeout sin revelar mensajes técnicos", () => {
    const network = normalizeApiError(new axios.AxiosError("Network Error", "ERR_NETWORK"));
    const timeout = normalizeApiError(new axios.AxiosError("timeout of 5000ms exceeded", "ECONNABORTED"));
    expect(network).toMatchObject({ code: "NETWORK_ERROR", canRetry: true });
    expect(timeout).toMatchObject({ code: "TIMEOUT", canRetry: true });
    expect(timeout.detail).not.toContain("5000ms");
  });

  it("tolera respuestas vacías y errores inesperados", () => {
    expect(normalizeApiError(axiosError(404)).kind).toBe("not-found");
    expect(normalizeApiError(new Error("stack trace"))).toMatchObject({ code: "UNKNOWN_ERROR", kind: "unknown" });
  });
});
