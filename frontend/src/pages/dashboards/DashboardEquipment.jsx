import React, { useContext, useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import CardStat from "../../components/CardStat";
import { AuthContext } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import api from "../../services/api";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { FaTools, FaCheckCircle, FaCog, FaTimesCircle, FaWrench, FaExclamationTriangle, FaCalendarAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const DashboardEquipment = () => {
  const { user } = useContext(AuthContext);
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEquipments: 0,
    operationalEquipments: 0,
    maintenanceEquipments: 0,
    outOfServiceEquipments: 0,
    equipmentsByCategory: [],
    equipmentsNeedingMaintenance: [],
    plannedMaintenances: 0,
    upcomingMaintenances: [],
    overdueMaintenances: 0,
    recentEquipments: [],
    totalMaintenanceEntries: 0,
    totalMaintenanceCost: 0,
    maintenancesByType: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/equipements/stats");
        setStats(data);
      } catch (error) {
        console.error("Erreur récupération stats équipements:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Rafraîchir toutes les 30 secondes

    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fr-CA", {
      style: "currency",
      currency: "CAD",
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-CA", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'en service':
        return darkMode ? "text-green-400" : "text-green-600";
      case 'en maintenance':
        return darkMode ? "text-yellow-400" : "text-yellow-600";
      case 'hors service':
        return darkMode ? "text-red-400" : "text-red-600";
      default:
        return darkMode ? "text-gray-400" : "text-gray-600";
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'en service':
        return darkMode ? "bg-green-900" : "bg-green-100";
      case 'en maintenance':
        return darkMode ? "bg-yellow-900" : "bg-yellow-100";
      case 'hors service':
        return darkMode ? "bg-red-900" : "bg-red-100";
      default:
        return darkMode ? "bg-gray-700" : "bg-gray-100";
    }
  };

  const COLORS = {
    bar: darkMode ? "#3B82F6" : "#2563EB",
    pie: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"]
  };

  if (loading) {
    return (
      <DashboardLayout role={user?.role}>
        <div className={`p-6 ${darkMode ? "text-white" : "text-gray-800"}`}>
          <div className="flex items-center justify-center h-64">
            <p className="text-lg">Chargement des statistiques...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={user?.role}>
      <div className={`p-6 min-h-screen ${darkMode ? "text-white bg-gray-900" : "text-gray-800 bg-gray-50"}`}>
        <div className="mb-6">
          <h1 className={`text-3xl font-bold mb-2 ${darkMode ? "text-white" : "text-gray-800"}`}>
            Dashboard Équipements
          </h1>
          <p className={`text-lg ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Vue d'ensemble des équipements et de leur maintenance
          </p>
        </div>

        {/* Statistiques principales */}
        <div className="stats-section mb-8">
          <CardStat 
            title="Équipements" 
            value={stats.totalEquipments} 
            color="#795548"
            icon={<FaTools className="text-2xl" />}
            subtitle={`${stats.plannedMaintenances} maintenances planifiées`}
            onClick={() => navigate("/equipements/liste")}
          />
          <CardStat 
            title="Opérationnels" 
            value={stats.operationalEquipments} 
            color="#4CAF50"
            icon={<FaCheckCircle className="text-2xl" />}
            subtitle={`${stats.totalEquipments > 0 ? Math.round((stats.operationalEquipments / stats.totalEquipments) * 100) : 0}% du total`}
            onClick={() => navigate("/equipements/liste")}
          />
          <CardStat 
            title="En maintenance" 
            value={stats.maintenanceEquipments} 
            color="#FF9800"
            icon={<FaCog className="text-2xl" />}
            subtitle={`${stats.totalEquipments > 0 ? Math.round((stats.maintenanceEquipments / stats.totalEquipments) * 100) : 0}% du total`}
            onClick={() => navigate("/equipements/liste")}
          />
          <CardStat 
            title="Hors service" 
            value={stats.outOfServiceEquipments} 
            color="#F44336"
            icon={<FaTimesCircle className="text-2xl" />}
            subtitle={`${stats.totalEquipments > 0 ? Math.round((stats.outOfServiceEquipments / stats.totalEquipments) * 100) : 0}% du total`}
            onClick={() => navigate("/equipements/liste")}
          />
        </div>

        {/* Graphiques et données détaillées */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Graphique : Répartition par catégorie */}
          <div className={`rounded-lg shadow-md p-6 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}>
            <h2 className={`text-xl font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-800"}`}>
              Répartition par catégorie
            </h2>
            {stats.equipmentsByCategory && stats.equipmentsByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.equipmentsByCategory}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#E5E7EB"} />
                  <XAxis 
                    dataKey="_id" 
                    tick={{ fill: darkMode ? "#D1D5DB" : "#6B7280" }}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis tick={{ fill: darkMode ? "#D1D5DB" : "#6B7280" }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
                      border: darkMode ? "1px solid #374151" : "1px solid #E5E7EB",
                      color: darkMode ? "#F9FAFB" : "#111827"
                    }}
                    formatter={(value) => value}
                  />
                  <Legend />
                  <Bar dataKey="operational" fill={COLORS.pie[1]} name="Opérationnels" />
                  <Bar dataKey="maintenance" fill={COLORS.pie[2]} name="En maintenance" />
                  <Bar dataKey="outOfService" fill={COLORS.pie[3]} name="Hors service" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className={`p-8 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                <p>Aucune donnée disponible</p>
              </div>
            )}
          </div>

          {/* Graphique : Statut des équipements */}
          <div className={`rounded-lg shadow-md p-6 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}>
            <h2 className={`text-xl font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-800"}`}>
              Répartition du statut
            </h2>
            {stats.totalEquipments > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Opérationnels', value: stats.operationalEquipments },
                      { name: 'En maintenance', value: stats.maintenanceEquipments },
                      { name: 'Hors service', value: stats.outOfServiceEquipments }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill={COLORS.pie[1]} />
                    <Cell fill={COLORS.pie[2]} />
                    <Cell fill={COLORS.pie[3]} />
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
                      border: darkMode ? "1px solid #374151" : "1px solid #E5E7EB",
                      color: darkMode ? "#F9FAFB" : "#111827"
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className={`p-8 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                <p>Aucune donnée disponible</p>
              </div>
            )}
          </div>
        </div>

        {/* Listes récentes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Équipements nécessitant une maintenance */}
          <div className={`rounded-lg shadow-md p-6 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-semibold flex items-center gap-2 ${darkMode ? "text-white" : "text-gray-800"}`}>
                <FaExclamationTriangle className="text-yellow-500" />
                Nécessitent maintenance
              </h2>
              {stats.equipmentsNeedingMaintenance && stats.equipmentsNeedingMaintenance.length > 0 && (
                <span className={`flex items-center gap-1 text-sm font-semibold ${
                  darkMode ? "text-yellow-400" : "text-yellow-600"
                }`}>
                  {stats.equipmentsNeedingMaintenance.length}
                </span>
              )}
            </div>
            {stats.equipmentsNeedingMaintenance && stats.equipmentsNeedingMaintenance.length > 0 ? (
              <div className="space-y-3">
                {stats.equipmentsNeedingMaintenance.slice(0, 5).map((equipment) => (
                  <div
                    key={equipment._id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                    }`}
                    onClick={() => navigate("/equipements/liste")}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className={`font-medium ${darkMode ? "text-white" : "text-gray-800"}`}>
                        {equipment.name}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded ${getStatusBg(equipment.status)} ${getStatusColor(equipment.status)}`}>
                        {equipment.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {equipment.code}
                      </p>
                      {equipment.nextMaintenance && (
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          {formatDate(equipment.nextMaintenance)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`p-4 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                <p className="text-sm">Tous les équipements sont à jour</p>
              </div>
            )}
          </div>

          {/* Derniers équipements */}
          <div className={`rounded-lg shadow-md p-6 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>
                Derniers équipements
              </h2>
              <button
                onClick={() => navigate("/equipements/liste")}
                className={`text-sm ${darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"}`}
              >
                Voir tout
              </button>
            </div>
            {stats.recentEquipments && stats.recentEquipments.length > 0 ? (
              <div className="space-y-3">
                {stats.recentEquipments.map((equipment) => (
                  <div
                    key={equipment._id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                    }`}
                    onClick={() => navigate("/equipements/liste")}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className={`font-medium ${darkMode ? "text-white" : "text-gray-800"}`}>
                        {equipment.name}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded ${getStatusBg(equipment.status)} ${getStatusColor(equipment.status)}`}>
                        {equipment.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {equipment.category || "Sans catégorie"}
                      </p>
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {equipment.code}
                      </p>
                    </div>
                    {equipment.createdAt && (
                      <p className={`text-xs mt-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                        Ajouté le {formatDate(equipment.createdAt)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className={`p-4 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                <p className="text-sm">Aucun équipement récent</p>
              </div>
            )}
          </div>

          {/* Maintenances à venir */}
          <div className={`rounded-lg shadow-md p-6 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-semibold flex items-center gap-2 ${darkMode ? "text-white" : "text-gray-800"}`}>
                <FaCalendarAlt className="text-blue-500" />
                Maintenances à venir
              </h2>
              <button
                onClick={() => navigate("/equipements/maintenance")}
                className={`text-sm ${darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"}`}
              >
                Voir tout
              </button>
            </div>
            {stats.upcomingMaintenances && stats.upcomingMaintenances.length > 0 ? (
              <div className="space-y-3">
                {stats.upcomingMaintenances.map((maintenance) => (
                  <div
                    key={maintenance._id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                    }`}
                    onClick={() => navigate("/equipements/maintenance")}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className={`font-medium ${darkMode ? "text-white" : "text-gray-800"}`}>
                        {maintenance.equipment?.name || "Équipement"}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded ${
                        maintenance.status === 'planifiée' 
                          ? darkMode ? "bg-blue-900 text-blue-200" : "bg-blue-100 text-blue-800"
                          : darkMode ? "bg-yellow-900 text-yellow-200" : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {maintenance.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {maintenance.type}
                      </p>
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {formatDate(maintenance.datePrevue)}
                      </p>
                    </div>
                    {maintenance.responsible && (
                      <p className={`text-xs mt-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                        Responsable: {maintenance.responsible?.nom} {maintenance.responsible?.prenom}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className={`p-4 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                <p className="text-sm">Aucune maintenance à venir</p>
              </div>
            )}
          </div>
        </div>

        {/* Alertes et informations */}
        {stats.overdueMaintenances > 0 && (
          <div className={`mt-6 rounded-lg shadow-md p-6 ${darkMode ? "bg-red-900 border border-red-700" : "bg-red-50 border border-red-200"}`}>
            <div className="flex items-start gap-3">
              <FaExclamationTriangle className={`text-2xl ${darkMode ? "text-red-300" : "text-red-600"} mt-1`} />
              <div>
                <h3 className={`text-lg font-semibold mb-2 ${darkMode ? "text-red-200" : "text-red-800"}`}>
                  Attention : Maintenances en retard
                </h3>
                <p className={`text-sm ${darkMode ? "text-red-300" : "text-red-700"}`}>
                  {stats.overdueMaintenances} maintenance(s) sont en retard de réalisation.
                  <button
                    onClick={() => navigate("/equipements/maintenance")}
                    className="ml-2 underline font-semibold"
                  >
                    Voir les détails
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}

        {stats.equipmentsNeedingMaintenance && stats.equipmentsNeedingMaintenance.length > 0 && (
          <div className={`mt-6 rounded-lg shadow-md p-6 ${darkMode ? "bg-yellow-900 border border-yellow-700" : "bg-yellow-50 border border-yellow-200"}`}>
            <div className="flex items-start gap-3">
              <FaWrench className={`text-2xl ${darkMode ? "text-yellow-300" : "text-yellow-600"} mt-1`} />
              <div>
                <h3 className={`text-lg font-semibold mb-2 ${darkMode ? "text-yellow-200" : "text-yellow-800"}`}>
                  Équipements nécessitant une maintenance
                </h3>
                <p className={`text-sm ${darkMode ? "text-yellow-300" : "text-yellow-700"}`}>
                  {stats.equipmentsNeedingMaintenance.length} équipement(s) nécessitent une attention immédiate.
                  <button
                    onClick={() => navigate("/equipements/liste")}
                    className="ml-2 underline font-semibold"
                  >
                    Voir les détails
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Section d'information */}
        <div className={`mt-8 rounded-lg shadow-md p-6 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}>
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-800"}`}>
            Gestion des équipements
          </h2>
          <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
            Gestion des machines, chantiers et maintenance. Accédez rapidement aux différentes sections via les cartes ci-dessus ou utilisez le menu latéral.
          </p>
          {stats.totalMaintenanceCost > 0 && (
            <div className={`mt-4 p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
              <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                <span className="font-semibold">Coût total des maintenances :</span> {formatCurrency(stats.totalMaintenanceCost)}
              </p>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                {stats.totalMaintenanceEntries} entrée(s) d'historique de maintenance
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardEquipment;
