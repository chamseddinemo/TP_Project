// api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Intercepteur pour ajouter le token automatiquement
api.interceptors.request.use(
  (config) => {
    try {
      // Essayer d'abord depuis l'objet user dans localStorage
      const userStr = localStorage.getItem("user");
      let token = null;
      
      if (userStr) {
        const user = JSON.parse(userStr);
        token = user?.token;
      }
      
      // Si pas trouvé, essayer depuis localStorage directement
      if (!token) {
        token = localStorage.getItem("token");
      }
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
