import axios from "axios";

export type UiErrorCode = "DUPLICATE_ENTRY" | "DATA_INTEGRITY_ERROR" | "VALIDATION_ERROR" | "INVALID_REQUEST" | "RESOURCE_NOT_FOUND" | "RESOURCE_CONFLICT" | "INTERNAL_ERROR" | "NETWORK_ERROR" | "TIMEOUT" | "UNKNOWN_ERROR";
export interface ProblemDetails { type?: string; title?: string; status?: number; detail?: string; instance?: string; code?: string; timestamp?: string; errors?: Record<string, string | string[]>; }
export interface UiError { type?: string; title: string; status?: number; detail: string; instance?: string; code: UiErrorCode | string; timestamp?: string; fieldErrors: Record<string, string>; field?: string; kind: "warning" | "validation" | "not-found" | "server" | "network" | "unknown"; canRetry: boolean; }

const SAFE_SERVER_MESSAGE = "Ocurrió un problema en el servidor. Intenta nuevamente más tarde.";
const NETWORK_MESSAGE = "No fue posible comunicarse con el servidor. Revisa tu conexión e intenta nuevamente.";
const TIMEOUT_MESSAGE = "El servidor tardó demasiado en responder. Intenta nuevamente.";
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const text = (value: unknown) => typeof value === "string" && value.trim() ? value.trim() : undefined;
const number = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : undefined;

function parseFieldErrors(value: unknown): Record<string, string> {
  if (!isRecord(value)) return {};
  return Object.fromEntries(Object.entries(value).flatMap(([field, message]) => {
    if (typeof message === "string" && message.trim()) return [[field, message.trim()]];
    if (Array.isArray(message)) { const joined = message.filter((item): item is string => typeof item === "string").join(" ").trim(); return joined ? [[field, joined]] : []; }
    return [];
  }));
}

function inferField(detail: string, fieldErrors: Record<string, string>): string | undefined {
  const explicit = Object.keys(fieldErrors)[0];
  if (explicit) return explicit;
  const normalized = detail.toLocaleLowerCase("es");
  if (normalized.includes("número de serie") || normalized.includes("numero de serie") || normalized.includes("serial")) return "serialEquipo";
  if (normalized.includes("inventario")) return "codigoInventario";
  return undefined;
}

function kindFor(code: string, status?: number): UiError["kind"] {
  if (code === "DUPLICATE_ENTRY" || code === "RESOURCE_CONFLICT" || status === 409) return "warning";
  if (["VALIDATION_ERROR", "INVALID_REQUEST", "DATA_INTEGRITY_ERROR"].includes(code) || status === 400) return "validation";
  if (code === "RESOURCE_NOT_FOUND" || status === 404) return "not-found";
  if (code === "INTERNAL_ERROR" || (status !== undefined && status >= 500)) return "server";
  if (code === "NETWORK_ERROR" || code === "TIMEOUT") return "network";
  return "unknown";
}

export function getProblemDetails(error: unknown): ProblemDetails | null {
  if (!axios.isAxiosError(error) || !isRecord(error.response?.data)) return null;
  const data = error.response.data;
  return { type: text(data.type), title: text(data.title), status: number(data.status), detail: text(data.detail), instance: text(data.instance), code: text(data.code), timestamp: text(data.timestamp), errors: isRecord(data.errors) ? data.errors as Record<string, string | string[]> : undefined };
}

export function normalizeApiError(error: unknown, options: { defaultField?: string } = {}): UiError {
  if (axios.isAxiosError(error)) {
    const timedOut = error.code === "ECONNABORTED" || error.code === "ETIMEDOUT";
    if (!error.response) {
      const code = timedOut ? "TIMEOUT" : "NETWORK_ERROR";
      return { title: timedOut ? "La solicitud tardó demasiado" : "Sin conexión con el servidor", detail: timedOut ? TIMEOUT_MESSAGE : NETWORK_MESSAGE, code, fieldErrors: {}, kind: "network", canRetry: true };
    }
    const problem = getProblemDetails(error);
    const status = problem?.status ?? error.response.status;
    const code = problem?.code ?? (status === 404 ? "RESOURCE_NOT_FOUND" : status === 409 ? "RESOURCE_CONFLICT" : status >= 500 ? "INTERNAL_ERROR" : "UNKNOWN_ERROR");
    const kind = kindFor(code, status);
    const fieldErrors = parseFieldErrors(problem?.errors);
    const safeDetail = kind === "server" ? SAFE_SERVER_MESSAGE : problem?.detail ?? (kind === "not-found" ? "El recurso solicitado ya no está disponible." : "No fue posible completar la operación.");
    return { type: problem?.type, title: problem?.title ?? (kind === "validation" ? "Revisa los datos ingresados" : kind === "not-found" ? "Recurso no disponible" : kind === "server" ? "No pudimos completar la operación" : "No fue posible completar la operación"), status, detail: safeDetail, instance: problem?.instance, code, timestamp: problem?.timestamp, fieldErrors, field: inferField(safeDetail, fieldErrors) ?? ((kind === "warning" || kind === "validation") ? options.defaultField : undefined), kind, canRetry: kind === "network" || kind === "server" };
  }
  return { title: "Ocurrió un error inesperado", detail: "No fue posible completar la operación. Intenta nuevamente.", code: "UNKNOWN_ERROR", fieldErrors: {}, kind: "unknown", canRetry: true };
}

export function getSafeErrorMessage(error: unknown, fallback: string): string {
  const normalized = normalizeApiError(error);
  return normalized.code === "UNKNOWN_ERROR" ? fallback : normalized.detail;
}
