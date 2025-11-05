import React, { useContext, useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import CardStat from "../../components/CardStat";
import { AuthContext } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import axios from "axios";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { FaShoppingCart, FaClock, FaUsers, FaDollarSign, FaChartLine, FaTrophy, FaBox } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const DashboardVentes = () => {
  const { user } = useContext(AuthContext);
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSales: 0,
    pendingSales: 0,
    completedSales: 0,
    totalClients: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    recentSales: [],
    topClients: [],
    salesByStatus: [],
    salesByMonth: [],
    topProducts: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get("/api/vente/stats");
        setStats(data);
      } catch (error) {
        console.error("Erreur récupération stats ventes:", error);
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
    const colors = {
      'proposition': darkMode ? "bg-yellow-900 text-yellow-200" : "bg-yellow-100 text-yellow-800",
      'devis': darkMode ? "bg-blue-900 text-blue-200" : "bg-blue-100 text-blue-800",
      'facture': darkMode ? "bg-green-900 text-green-200" : "bg-green-100 text-green-800",
      'payé': darkMode ? "bg-green-900 text-green-200" : "bg-green-100 text-green-800"
    };
    return colors[status] || (darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-800");
  };

  const COLORS = {
    bar: darkMode ? "#3B82F6" : "#2563EB",
    pie: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"]
  };

  // Préparer les données pour les graphiques
  const salesByMonthData = stats.salesByMonth?.map(item => ({
    month: `${item._id.month}/${item._id.year}`,
    revenus: item.total,
    ventes: item.count
  })) || [];

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
            Dashboard Ventes
          </h1>
          <p className={`text-lg ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Vue d'ensemble des ventes et des clients
          </p>
        </div>

        {/* Statistiques principales */}
        <div className="stats-section mb-8">
          <CardStat 
            title="Ventes totales" 
            value={stats.totalSales} 
            color="#4CAF50"
            icon={<FaShoppingCart className="text-2xl" />}
            subtitle={`${stats.completedSales} complétées`}
            onClick={() => navigate("/vente/commandes")}
          />
          <CardStat 
            title="En attente" 
            value={stats.pendingSales} 
            color="#FF9800"
            icon={<FaClock className="text-2xl" />}
            subtitle="propositions & devis"
            onClick={() => navigate("/vente/commandes")}
          />
          <CardStat 
            title="Clients" 
            value={stats.totalClients} 
            color="#2196F3"
            icon={<FaUsers className="text-2xl" />}
            subtitle={`${stats.topClients?.length || 0} meilleurs clients`}
            onClick={() => navigate("/vente/commandes")}
          />
          <CardStat 
            title="Revenus" 
            value={formatCurrency(stats.totalRevenue)} 
            color="#9C27B0"
            icon={<FaDollarSign className="text-2xl" />}
            subtitle={`${formatCurrency(stats.monthlyRevenue)} ce mois`}
            onClick={() => navigate("/vente/factures")}
          />
        </div>

        {/* Graphiques et données détaillées */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Graphique : Ventes par statut */}
          <div className={`rounded-lg shadow-md p-6 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}>
            <h2 className={`text-xl font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-800"}`}>
              Répartition par statut
            </h2>
            {stats.salesByStatus && stats.salesByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.salesByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ _id, count }) => `${_id}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {stats.salesByStatus.map((entry, index) => (
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

          {/* Graphique : Revenus par mois */}
          <div className={`rounded-lg shadow-md p-6 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}>
            <h2 className={`text-xl font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-800"}`}>
              Évolution des revenus (6 derniers mois)
            </h2>
            {salesByMonthData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesByMonthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#E5E7EB"} />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: darkMode ? "#D1D5DB" : "#6B7280" }}
                  />
                  <YAxis tick={{ fill: darkMode ? "#D1D5DB" : "#6B7280" }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
                      border: darkMode ? "1px solid #374151" : "1px solid #E5E7EB",
                      color: darkMode ? "#F9FAFB" : "#111827"
                    }}
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Line type="monotone" dataKey="revenus" stroke={COLORS.bar} strokeWidth={2} />
                </LineChart>
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
          {/* Dernières ventes */}
          <div className={`rounded-lg shadow-md p-6 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>
                Dernières ventes
              </h2>
              <button
                onClick={() => navigate("/vente/commandes")}
                className={`text-sm ${darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"}`}
              >
                Voir tout
              </button>
            </div>
            {stats.recentSales && stats.recentSales.length > 0 ? (
              <div className="space-y-3">
                {stats.recentSales.map((sale) => (
                  <div
                    key={sale._id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                    }`}
                    onClick={() => navigate("/vente/commandes")}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className={`font-medium ${darkMode ? "text-white" : "text-gray-800"}`}>
                        {sale.clientId?.name || "Client supprimé"}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(sale.status)}`}>
                        {sale.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {sale.numeroCommande || `#${sale._id.slice(-6)}`}
                      </p>
                      <p className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>
                        {formatCurrency(sale.totalAmount)}
                      </p>
                    </div>
                    {sale.dateCommande && (
                      <p className={`text-xs mt-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                        {formatDate(sale.dateCommande)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className={`p-4 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                <p className="text-sm">Aucune vente récente</p>
              </div>
            )}
          </div>

          {/* Meilleurs clients */}
          <div className={`rounded-lg shadow-md p-6 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-semibold flex items-center gap-2 ${darkMode ? "text-white" : "text-gray-800"}`}>
                <FaTrophy className="text-yellow-500" />
                Meilleurs clients
              </h2>
            </div>
            {stats.topClients && stats.topClients.length > 0 ? (
              <div className="space-y-3">
                {stats.topClients.map((item, index) => (
                  <div
                    key={item._id || index}
                    className={`p-3 rounded-lg ${
                      darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className={`font-medium ${darkMode ? "text-white" : "text-gray-800"}`}>
                        {item.client?.name || "Client supprimé"}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded ${
                        index === 0 
                          ? darkMode ? "bg-yellow-900 text-yellow-200" : "bg-yellow-100 text-yellow-800"
                          : darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-800"
                      }`}>
                        #{index + 1}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {item.count} {item.count > 1 ? "commandes" : "commande"}
                      </p>
                      <p className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>
                        {formatCurrency(item.total)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`p-4 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                <p className="text-sm">Aucun client</p>
              </div>
            )}
          </div>

          {/* Produits les plus vendus */}
          <div className={`rounded-lg shadow-md p-6 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-semibold flex items-center gap-2 ${darkMode ? "text-white" : "text-gray-800"}`}>
                <FaBox className="text-blue-500" />
                Produits populaires
              </h2>
            </div>
            {stats.topProducts && stats.topProducts.length > 0 ? (
              <div className="space-y-3">
                {stats.topProducts.map((item, index) => (
                  <div
                    key={item._id || index}
                    className={`p-3 rounded-lg ${
                      darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className={`font-medium ${darkMode ? "text-white" : "text-gray-800"}`}>
                        {item.product?.name || "Produit supprimé"}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded ${
                        index === 0 
                          ? darkMode ? "bg-blue-900 text-blue-200" : "bg-blue-100 text-blue-800"
                          : darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-800"
                      }`}>
                        {item.totalQuantity} unités
                      </span>
                    </div>
                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      {formatCurrency(item.totalRevenue)} de revenus
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`p-4 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                <p className="text-sm">Aucun produit vendu</p>
              </div>
            )}
          </div>
        </div>

        {/* Section d'information */}
        <div className={`mt-8 rounded-lg shadow-md p-6 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}>
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-800"}`}>
            Gestion des ventes
          </h2>
          <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
            Suivez les ventes, clients et factures. Accédez rapidement aux différentes sections via les cartes ci-dessus ou utilisez le menu latéral.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardVentes;
