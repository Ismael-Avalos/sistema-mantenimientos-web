import { api } from "./api";
import type { Categoria, CreateCategoriaRequest } from "../types/Categoria";

export const obtenerCategorias = async (): Promise<Categoria[]> => {
  const response = await api.get<Categoria[]>("/categories");
  return response.data;
};

export const crearCategoria = async (
  data: CreateCategoriaRequest
): Promise<Categoria> => {
  const response = await api.post<Categoria>("/categories", data);
  return response.data;
};

export const actualizarCategoria = async (
  id: string,
  data: CreateCategoriaRequest
): Promise<Categoria> => {
  const response = await api.put<Categoria>(`/categories/${id}`, data);
  return response.data;
};

export const eliminarCategoria = async (
  id: string,
  reassignTo?: string
): Promise<void> => {
  await api.delete(`/categories/${id}`, {
    params: reassignTo ? { reassignTo } : undefined,
  });
};