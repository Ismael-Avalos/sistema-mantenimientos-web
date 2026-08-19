import type { Categoria, CreateCategoriaRequest } from "../types/Categoria";

const API_URL = "http://localhost:8080/categories";

export const obtenerCategorias = async (): Promise<Categoria[]> => {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error("Error al obtener las categorías");
  return response.json();
};

export const crearCategoria = async (data: CreateCategoriaRequest): Promise<Categoria> => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Error al crear la categoría");
  return response.json();
};

export const actualizarCategoria = async (id: string, data: CreateCategoriaRequest): Promise<Categoria> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Error al actualizar la categoría");
  return response.json();
};

export const eliminarCategoria = async (id: string, reassignTo?: string): Promise<void> => {
  const url = reassignTo ? `${API_URL}/${id}?reassignTo=${reassignTo}` : `${API_URL}/${id}`;

  const response = await fetch(url, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "No se pudo eliminar la categoría");
  }
};