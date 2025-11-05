import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";
import api from "../../services/api";
import { FaLock, FaShieldAlt, FaKey, FaUserLock } from "react-icons/fa";
import CardStat from "../../components/CardStat";

const SecurityPage = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get("/auth/users");
      setUsers(data);
    } catch (error) {
      console.error("Erreur récupération utilisateurs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      alert("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    // En production, ceci devrait être une vraie API
    alert("Fonctionnalité de changement de mot de passe à implémenter côté backend");
    setShowPasswordModal(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  };

  const securityStats = {
    totalUsers: users.length,
    activeUsers: users.length, // Simplifié, en production on aurait un champ "active"
    adminUsers: users.filter(u => u.role === "admin").length,
    lastLogin: "Aujourd'hui" // Simplifié
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar role={user?.role} />
      <div className="main-content">
        <Navbar />
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Sécurité & Accès</h1>
          </div>

          <div className="stats-section mb-6">
            <CardStat title="Total utilisateurs" value={securityStats.totalUsers} color="#2196F3" />
            <CardStat title="Utilisateurs actifs" value={securityStats.activeUsers} color="#4CAF50" />
            <CardStat title="Administrateurs" value={securityStats.adminUsers} color="#9C27B0" />
            <CardStat title="Dernière connexion" value={securityStats.lastLogin} color="#FF9800" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FaLock className="text-blue-500" />
                Changer mon mot de passe
              </h3>
              <p className="text-gray-600 mb-4">
                Assurez-vous d'utiliser un mot de passe fort et unique.
              </p>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <FaKey /> Changer le mot de passe
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FaShieldAlt className="text-green-500" />
                Paramètres de sécurité
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Authentification à deux facteurs</span>
                  <span className="text-gray-500">Non disponible</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Expiration de session</span>
                  <span className="text-gray-500">7 jours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Complexité mot de passe</span>
                  <span className="text-green-600">Activée</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaUserLock className="text-purple-500" />
              Gestion des accès
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dernière activité</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((userData) => (
                    <tr key={userData._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-semibold">{userData.name}</td>
                      <td className="px-6 py-4">{userData.role}</td>
                      <td className="px-6 py-4">
                        {new Date(userData.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          Actif
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {showPasswordModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Changer le mot de passe</h2>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Mot de passe actuel *</label>
                    <input
                      type="password"
                      required
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Nouveau mot de passe *</label>
                    <input
                      type="password"
                      required
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      minLength={6}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Confirmer le mot de passe *</label>
                    <input
                      type="password"
                      required
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      minLength={6}
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordModal(false);
                        setPasswordData({
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: ""
                        });
                      }}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Changer
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecurityPage;

