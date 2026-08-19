import type { Ubicacion } from "./Ubicacion";
import type { Categoria } from "./Categoria";

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
  ubicacionId?: string | null;
  categoriaId?: string;
  ubicacion?: Ubicacion | null;
  categoria?: Categoria | null;
  createdAt: string;
}

export interface CrearEquipoDTO extends Omit<Equipo, "id" | "qrUuid" | "createdAt" | "ubicacion" | "categoria"> {
  ubicacionId?: string | null;
  categoriaId: string;
}