import axios from "axios";

export const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:5000/api/v1";

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});
