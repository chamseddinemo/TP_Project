// api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Intercepteur pour ajouter le token automatiquement
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem("user")); // ⚠️ doit correspondre à AuthContext
    const token = user?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
