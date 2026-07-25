export interface Ubicacion {
  id: string;
  nombre: string;
  edificio?: string | null;
  createdAt?: string;
}

export type CrearUbicacionDTO = Omit<Ubicacion, "id" | "createdAt">;