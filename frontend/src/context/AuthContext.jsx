import React, { createContext, useState, useEffect } from "react";
import { login as loginService } from "../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Vérifier si token existe dans localStorage au démarrage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Login
  const login = async (email, password) => {
    try {
      const data = await loginService(email, password);
      if (!data || !data.token) {
        throw new Error("Réponse invalide du serveur");
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);
      return data; // retour pour redirection dans Login.jsx
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      // Propager l'erreur pour qu'elle soit gérée par Login.jsx
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  // Mettre à jour l'utilisateur (pour les modifications de profil)
  const updateUser = (updatedUser) => {
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
