export interface UserResponse {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  activo: boolean;
  debeCambiarContrasena: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDTO {
  nombre: string;
  correo: string;
  contrasena: string;
  rolId: string;
}