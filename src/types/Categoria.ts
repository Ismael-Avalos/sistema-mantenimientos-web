export interface Categoria {
  id: string;
  nombre: string;
  descripcion?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoriaRequest {
  nombre: string;
  descripcion?: string;
}