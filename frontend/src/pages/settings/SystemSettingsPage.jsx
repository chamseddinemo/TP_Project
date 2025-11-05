import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";
import { useTheme } from "../../context/ThemeContext";
import api from "../../services/api";
import { FaCog, FaDatabase, FaServer, FaBell, FaSave } from "react-icons/fa";
import CardStat from "../../components/CardStat";

const SystemSettingsPage = () => {
  const { user } = useContext(AuthContext);
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    companyName: "ERP-TP",
    email: "contact@erp-tp.ca",
    phone: "+1 (418) 555-0123",
    address: "123 Rue Saint-Jean, Québec, QC G1R 1A1",
    language: "fr",
    timezone: "America/Toronto",
    currency: "CAD",
    dateFormat: "DD/MM/YYYY",
    notifications: {
      email: true,
      stockAlerts: true,
      maintenanceAlerts: true
    },
    database: {
      backupFrequency: "daily",
      lastBackup: new Date().toISOString()
    }
  });

  useEffect(() => {
    // En production, charger depuis l'API
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    // Simuler le chargement depuis l'API
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // En production, sauvegarder via l'API
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert("Paramètres sauvegardés avec succès");
    } catch (error) {
      alert("Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setSettings({
        ...settings,
        [parent]: {
          ...settings[parent],
          [child]: value
        }
      });
    } else {
      setSettings({
        ...settings,
        [field]: value
      });
    }
  };

  const systemStats = {
    database: "MongoDB",
    version: "1.0.0",
    uptime: "99.9%",
    totalUsers: 0 // Sera rempli dynamiquement
  };

  useEffect(() => {
    api.get("/auth/users")
      .then(res => {
        systemStats.totalUsers = res.data.length;
      })
      .catch(() => {});
  }, []);

  return (
    <DashboardLayout role={user?.role}>
      <div className={`p-6 ${darkMode ? "text-white" : "text-gray-800"}`}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${darkMode ? "text-white" : "text-gray-800"}`}>Paramètres Système</h1>
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              Configuration générale du système ERP-TP
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <CardStat title="Base de données" value={systemStats.database} color="#2196F3" />
          <CardStat title="Version" value={systemStats.version} color="#4CAF50" />
          <CardStat title="Disponibilité" value={systemStats.uptime} color="#FF9800" />
          <CardStat title="Utilisateurs" value={systemStats.totalUsers} color="#9C27B0" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className={`rounded-lg shadow-md p-6 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
            <h3 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${darkMode ? "text-white" : "text-gray-800"}`}>
              <FaCog className="text-blue-500" />
              Informations de l'entreprise
            </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Nom de l'entreprise</label>
                  <input
                    type="text"
                    value={settings.companyName}
                    onChange={(e) => handleChange("companyName", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Email</label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Téléphone</label>
                  <input
                    type="tel"
                    value={settings.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Adresse</label>
                  <input
                    type="text"
                    value={settings.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                  />
                </div>
              </div>
            </div>

          <div className={`rounded-lg shadow-md p-6 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
            <h3 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${darkMode ? "text-white" : "text-gray-800"}`}>
              <FaServer className="text-green-500" />
              Préférences régionales
            </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Langue</label>
                  <select
                    value={settings.language}
                    onChange={(e) => handleChange("language", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Fuseau horaire</label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => handleChange("timezone", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                  >
                    <option value="America/Toronto">America/Toronto (Québec)</option>
                    <option value="America/Montreal">America/Montreal (Montréal)</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Devise</label>
                  <select
                    value={settings.currency}
                    onChange={(e) => handleChange("currency", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                  >
                    <option value="CAD">CAD ($)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Format de date</label>
                  <select
                    value={settings.dateFormat}
                    onChange={(e) => handleChange("dateFormat", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </div>

          <div className={`rounded-lg shadow-md p-6 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
            <h3 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${darkMode ? "text-white" : "text-gray-800"}`}>
              <FaBell className="text-yellow-500" />
              Notifications
            </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.notifications.email}
                    onChange={(e) => handleChange("notifications.email", e.target.checked)}
                    className="w-5 h-5"
                  />
                  <span className={darkMode ? "text-gray-300" : "text-gray-700"}>Notifications par email</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.notifications.stockAlerts}
                    onChange={(e) => handleChange("notifications.stockAlerts", e.target.checked)}
                    className="w-5 h-5"
                  />
                  <span className={darkMode ? "text-gray-300" : "text-gray-700"}>Alertes de stock faible</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.notifications.maintenanceAlerts}
                    onChange={(e) => handleChange("notifications.maintenanceAlerts", e.target.checked)}
                    className="w-5 h-5"
                  />
                  <span className={darkMode ? "text-gray-300" : "text-gray-700"}>Alertes de maintenance</span>
                </label>
              </div>
            </div>

          <div className={`rounded-lg shadow-md p-6 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
            <h3 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${darkMode ? "text-white" : "text-gray-800"}`}>
              <FaDatabase className="text-purple-500" />
              Sauvegarde de la base de données
            </h3>
              <div className="space-y-3">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Fréquence de sauvegarde</label>
                  <select
                    value={settings.database.backupFrequency}
                    onChange={(e) => handleChange("database.backupFrequency", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                  >
                    <option value="hourly">Chaque heure</option>
                    <option value="daily">Quotidienne</option>
                    <option value="weekly">Hebdomadaire</option>
                    <option value="monthly">Mensuelle</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Dernière sauvegarde</label>
                  <input
                    type="text"
                    value={new Date(settings.database.lastBackup).toLocaleString()}
                    disabled
                    className={`w-full px-3 py-2 border rounded-lg ${darkMode ? "bg-gray-700 border-gray-600 text-gray-400" : "bg-gray-50 border-gray-300"}`}
                  />
                </div>
                <button
                  type="button"
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                >
                  Sauvegarder maintenant
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
              >
                <FaSave /> {loading ? "Sauvegarde..." : "Sauvegarder les paramètres"}
              </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default SystemSettingsPage;

