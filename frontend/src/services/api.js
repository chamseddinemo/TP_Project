// api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 10000, // Timeout de 10 secondes
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

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Gérer les erreurs de connexion
    if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
      error.response = {
        data: {
          message: "Impossible de se connecter au serveur. Vérifiez que le backend est démarré sur http://localhost:5000"
        },
        status: 503
      };
    }
    
    // Gérer les erreurs de timeout
    if (error.code === 'ECONNABORTED') {
      error.response = {
        data: {
          message: "La requête a expiré. Le serveur met trop de temps à répondre."
        },
        status: 408
      };
    }
    
    // Gérer les erreurs d'authentification
    if (error.response?.status === 401) {
      // Supprimer le token invalide
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    
    return Promise.reject(error);
  }
);

export default api;
