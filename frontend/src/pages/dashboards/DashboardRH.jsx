import React, { useContext, useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import CardStat from "../../components/CardStat";
import { AuthContext } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import axios from "axios";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { FaUsers, FaUserCheck, FaCalendarAlt, FaBriefcase, FaClock, FaExclamationTriangle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const DashboardRH = () => {
  const { user } = useContext(AuthContext);
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentEmployees: 0,
    totalLeaves: 0,
    pendingLeaves: 0,
    activeJobOffers: 0,
    totalApplications: 0,
    recentApplications: 0,
    recentEmployees: [],
    latestApplications: [],
    pendingLeavesList: [],
    employeesByService: [],
    leavesByType: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get("/api/rh/stats");
        setStats(data);
      } catch (error) {
        console.error("Erreur récupération stats RH:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Rafraîchir toutes les 30 secondes

    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-CA", { day: "2-digit", month: "2-digit", year: "numeric" });
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
            Dashboard RH
          </h1>
          <p className={`text-lg ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Vue d'ensemble des ressources humaines
          </p>
        </div>

        {/* Statistiques principales */}
        <div className="stats-section mb-8">
          <CardStat 
            title="Employés" 
            value={stats.totalEmployees} 
            color="#F44336"
            icon={<FaUsers className="text-2xl" />}
            onClick={() => navigate("/rh/employes")}
          />
          <CardStat 
            title="Présents" 
            value={stats.presentEmployees} 
            color="#4CAF50"
            icon={<FaUserCheck className="text-2xl" />}
            subtitle={`sur ${stats.totalEmployees}`}
          />
          <CardStat 
            title="Congés" 
            value={stats.totalLeaves} 
            color="#FF9800"
            icon={<FaCalendarAlt className="text-2xl" />}
            subtitle={`${stats.pendingLeaves} en attente`}
            onClick={() => navigate("/rh/temps")}
          />
          <CardStat 
            title="Recrutements" 
            value={stats.activeJobOffers} 
            color="#2196F3"
            icon={<FaBriefcase className="text-2xl" />}
            subtitle={`${stats.totalApplications} candidatures`}
            onClick={() => navigate("/rh/recrutement")}
          />
        </div>

        {/* Graphiques et données détaillées */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Graphique : Employés par service */}
          <div className={`rounded-lg shadow-md p-6 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}>
            <h2 className={`text-xl font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-800"}`}>
              Répartition par service
            </h2>
            {stats.employeesByService && stats.employeesByService.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.employeesByService}>
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
                  />
                  <Bar dataKey="count" fill={COLORS.bar} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className={`p-8 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                <p>Aucune donnée disponible</p>
              </div>
            )}
          </div>

          {/* Graphique : Congés par type */}
          <div className={`rounded-lg shadow-md p-6 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}>
            <h2 className={`text-xl font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-800"}`}>
              Répartition des congés
            </h2>
            {stats.leavesByType && stats.leavesByType.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.leavesByType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ _id, count }) => `${_id}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {stats.leavesByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS.pie[index % COLORS.pie.length]} />
                    ))}
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
          {/* Derniers employés */}
          <div className={`rounded-lg shadow-md p-6 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>
                Derniers employés
              </h2>
              <button
                onClick={() => navigate("/rh/employes")}
                className={`text-sm ${darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"}`}
              >
                Voir tout
              </button>
            </div>
            {stats.recentEmployees && stats.recentEmployees.length > 0 ? (
              <div className="space-y-3">
                {stats.recentEmployees.map((employee) => (
                  <div
                    key={employee._id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                    }`}
                    onClick={() => navigate("/rh/employes")}
                  >
                    {employee.photo ? (
                      <img
                        src={employee.photo}
                        alt={`${employee.nom} ${employee.prenom}`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        darkMode ? "bg-gray-700" : "bg-gray-200"
                      }`}>
                        <FaUsers className={darkMode ? "text-gray-400" : "text-gray-600"} />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className={`font-medium ${darkMode ? "text-white" : "text-gray-800"}`}>
                        {employee.prenom} {employee.nom}
                      </p>
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {employee.poste}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`p-4 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                <p className="text-sm">Aucun employé récent</p>
              </div>
            )}
          </div>

          {/* Dernières candidatures */}
          <div className={`rounded-lg shadow-md p-6 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>
                Dernières candidatures
              </h2>
              <button
                onClick={() => navigate("/rh/recrutement")}
                className={`text-sm ${darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"}`}
              >
                Voir tout
              </button>
            </div>
            {stats.latestApplications && stats.latestApplications.length > 0 ? (
              <div className="space-y-3">
                {stats.latestApplications.map((app) => (
                  <div
                    key={app._id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                    }`}
                    onClick={() => navigate("/rh/recrutement")}
                  >
                    <p className={`font-medium mb-1 ${darkMode ? "text-white" : "text-gray-800"}`}>
                      {app.prenom} {app.nom}
                    </p>
                    <p className={`text-sm mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      {app.offreId?.titre || "N/A"}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded ${
                        app.statut === "Nouveau" 
                          ? darkMode ? "bg-blue-900 text-blue-200" : "bg-blue-100 text-blue-800"
                          : app.statut === "Accepté"
                          ? darkMode ? "bg-green-900 text-green-200" : "bg-green-100 text-green-800"
                          : darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-800"
                      }`}>
                        {app.statut}
                      </span>
                      {app.datePostulation && (
                        <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          {formatDate(app.datePostulation)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`p-4 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                <p className="text-sm">Aucune candidature récente</p>
              </div>
            )}
          </div>

          {/* Congés en attente */}
          <div className={`rounded-lg shadow-md p-6 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>
                Congés en attente
              </h2>
              {stats.pendingLeaves > 0 && (
                <span className={`flex items-center gap-1 text-sm font-semibold ${
                  darkMode ? "text-yellow-400" : "text-yellow-600"
                }`}>
                  <FaExclamationTriangle />
                  {stats.pendingLeaves}
                </span>
              )}
            </div>
            {stats.pendingLeavesList && stats.pendingLeavesList.length > 0 ? (
              <div className="space-y-3">
                {stats.pendingLeavesList.map((leave) => (
                  <div
                    key={leave._id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                    }`}
                    onClick={() => navigate("/rh/temps")}
                  >
                    <p className={`font-medium mb-1 ${darkMode ? "text-white" : "text-gray-800"}`}>
                      {leave.employeId?.nom} {leave.employeId?.prenom}
                    </p>
                    <p className={`text-sm mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      {leave.type}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {formatDate(leave.dateDebut)} - {formatDate(leave.dateFin)}
                      </span>
                      <FaClock className={`text-xs ${darkMode ? "text-yellow-400" : "text-yellow-600"}`} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`p-4 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                <p className="text-sm">Aucun congé en attente</p>
              </div>
            )}
          </div>
        </div>

        {/* Section d'information */}
        <div className={`mt-8 rounded-lg shadow-md p-6 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}>
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-800"}`}>
            Gestion des ressources humaines
          </h2>
          <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
            Gestion des employés, pointage, salaire et présence. Accédez rapidement aux différentes sections via les cartes ci-dessus ou utilisez le menu latéral.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardRH;
