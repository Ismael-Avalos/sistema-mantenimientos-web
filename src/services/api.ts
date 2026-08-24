import axios from "axios";

export const api = axios.create({
  // Si existe la variable de entorno la toma; si no, usa la IP local por defecto
  baseURL: import.meta.env.VITE_API_URL || "http://192.168.28.242:8080",
});

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