import axios from "axios";

export const api = axios.create({
  // baseURL: "https://sistema-mantenimientos-api-production.up.railway.app",
  baseURL: "http://localhost:8080",
});

// Interceptor para inyectar el token en cada petición HTTP
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);