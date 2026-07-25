import type { Ubicacion } from "./Ubicacion";

export interface Equipo {
  id: string;
  qrUuid: string;
  codigoInventario: string;
  nombre: string;
  tipo: string;
  marca: string;
  modelo: string;
  serialEquipo: string;
  estado: string;
  fechaAdquisicion: string;
  ubicacion?: Ubicacion | null;
  createdAt: string;
}

// ✅ Definición profesional utilizando interfaz y extensiones de Omit
export interface CrearEquipoDTO extends Omit<Equipo, "id" | "qrUuid" | "createdAt" | "ubicacion"> {
  ubicacionId?: string | null;
}