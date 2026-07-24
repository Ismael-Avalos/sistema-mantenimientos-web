import axios from "axios";

export const api = axios.create({
  //baseURL: "https://sistema-mantenimientos-api-production.up.railway.app",
  baseURL: "http://localhost:8080"
});