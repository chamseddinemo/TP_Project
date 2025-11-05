import React, { useContext, useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import CardStat from "../../components/CardStat";
import { AuthContext } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import axios from "axios";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { FaShoppingCart, FaClock, FaTruck, FaDollarSign, FaChartLine, FaTrophy, FaBox } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const DashboardAchats = () => {
  const { user } = useContext(AuthContext);
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPurchases: 0,
    pendingPurchases: 0,
    receivedPurchases: 0,
    totalSuppliers: 0,
    totalExpenses: 0,
    monthlyExpenses: 0,
    recentPurchases: [],
    topSuppliers: [],
    purchasesByStatus: [],
    purchasesByMonth: [],
    topProducts: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get("/api/achat/stats");
        setStats(data);
      } catch (error) {
        console.error("Erreur récupération stats achats:", error);
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
      'pending': darkMode ? "bg-yellow-900 text-yellow-200" : "bg-yellow-100 text-yellow-800",
      'en attente': darkMode ? "bg-yellow-900 text-yellow-200" : "bg-yellow-100 text-yellow-800",
      'en cours': darkMode ? "bg-blue-900 text-blue-200" : "bg-blue-100 text-blue-800",
      'received': darkMode ? "bg-green-900 text-green-200" : "bg-green-100 text-green-800",
      'livrée': darkMode ? "bg-green-900 text-green-200" : "bg-green-100 text-green-800",
      'cancelled': darkMode ? "bg-red-900 text-red-200" : "bg-red-100 text-red-800",
      'annulée': darkMode ? "bg-red-900 text-red-200" : "bg-red-100 text-red-800"
    };
    return colors[status] || (darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-800");
  };

  const COLORS = {
    bar: darkMode ? "#3B82F6" : "#2563EB",
    pie: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"]
  };

  // Préparer les données pour les graphiques
  const purchasesByMonthData = stats.purchasesByMonth?.map(item => ({
    month: `${item._id.month}/${item._id.year}`,
    depenses: item.total,
    commandes: item.count
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
            Dashboard Achats
          </h1>
          <p className={`text-lg ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Vue d'ensemble des achats et fournisseurs
          </p>
        </div>

        {/* Statistiques principales */}
        <div className="stats-section mb-8">
          <CardStat 
            title="Commandes" 
            value={stats.totalPurchases} 
            color="#9C27B0"
            icon={<FaShoppingCart className="text-2xl" />}
            subtitle={`${stats.receivedPurchases} reçues`}
            onClick={() => navigate("/achat/achats")}
          />
          <CardStat 
            title="En attente" 
            value={stats.pendingPurchases} 
            color="#FF9800"
            icon={<FaClock className="text-2xl" />}
            subtitle="commandes en cours"
            onClick={() => navigate("/achat/achats")}
          />
          <CardStat 
            title="Fournisseurs" 
            value={stats.totalSuppliers} 
            color="#2196F3"
            icon={<FaTruck className="text-2xl" />}
            subtitle={`${stats.topSuppliers?.length || 0} principaux`}
            onClick={() => navigate("/achat/achats")}
          />
          <CardStat 
            title="Dépenses" 
            value={formatCurrency(stats.totalExpenses)} 
            color="#F44336"
            icon={<FaDollarSign className="text-2xl" />}
            subtitle={`${formatCurrency(stats.monthlyExpenses)} ce mois`}
            onClick={() => navigate("/achat/achats")}
          />
        </div>

        {/* Graphiques et données détaillées */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Graphique : Achats par statut */}
          <div className={`rounded-lg shadow-md p-6 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}>
            <h2 className={`text-xl font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-800"}`}>
              Répartition par statut
            </h2>
            {stats.purchasesByStatus && stats.purchasesByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.purchasesByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ _id, count }) => `${_id}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {stats.purchasesByStatus.map((entry, index) => (
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

          {/* Graphique : Dépenses par mois */}
          <div className={`rounded-lg shadow-md p-6 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}>
            <h2 className={`text-xl font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-800"}`}>
              Évolution des dépenses (6 derniers mois)
            </h2>
            {purchasesByMonthData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={purchasesByMonthData}>
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
                  <Line type="monotone" dataKey="depenses" stroke={COLORS.bar} strokeWidth={2} />
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
          {/* Dernières commandes */}
          <div className={`rounded-lg shadow-md p-6 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>
                Dernières commandes
              </h2>
              <button
                onClick={() => navigate("/achat/achats")}
                className={`text-sm ${darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"}`}
              >
                Voir tout
              </button>
            </div>
            {stats.recentPurchases && stats.recentPurchases.length > 0 ? (
              <div className="space-y-3">
                {stats.recentPurchases.map((purchase) => (
                  <div
                    key={purchase._id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                    }`}
                    onClick={() => navigate("/achat/achats")}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className={`font-medium ${darkMode ? "text-white" : "text-gray-800"}`}>
                        {purchase.supplierId?.name || "Fournisseur supprimé"}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(purchase.status)}`}>
                        {purchase.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {purchase.reference || `#${purchase._id.slice(-6)}`}
                      </p>
                      <p className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>
                        {formatCurrency(purchase.totalAmount)}
                      </p>
                    </div>
                    {purchase.date && (
                      <p className={`text-xs mt-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                        {formatDate(purchase.date)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className={`p-4 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                <p className="text-sm">Aucune commande récente</p>
              </div>
            )}
          </div>

          {/* Meilleurs fournisseurs */}
          <div className={`rounded-lg shadow-md p-6 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-semibold flex items-center gap-2 ${darkMode ? "text-white" : "text-gray-800"}`}>
                <FaTrophy className="text-yellow-500" />
                Meilleurs fournisseurs
              </h2>
            </div>
            {stats.topSuppliers && stats.topSuppliers.length > 0 ? (
              <div className="space-y-3">
                {stats.topSuppliers.map((item, index) => (
                  <div
                    key={item._id || index}
                    className={`p-3 rounded-lg ${
                      darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className={`font-medium ${darkMode ? "text-white" : "text-gray-800"}`}>
                        {item.supplier?.name || "Fournisseur supprimé"}
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
                <p className="text-sm">Aucun fournisseur</p>
              </div>
            )}
          </div>

          {/* Produits les plus achetés */}
          <div className={`rounded-lg shadow-md p-6 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-semibold flex items-center gap-2 ${darkMode ? "text-white" : "text-gray-800"}`}>
                <FaBox className="text-blue-500" />
                Produits achetés
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
                      {formatCurrency(item.totalCost)} de coût
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`p-4 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                <p className="text-sm">Aucun produit acheté</p>
              </div>
            )}
          </div>
        </div>

        {/* Section d'information */}
        <div className={`mt-8 rounded-lg shadow-md p-6 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}>
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-800"}`}>
            Gestion des achats
          </h2>
          <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
            Gérez les commandes fournisseurs et stocks entrants. Accédez rapidement aux différentes sections via les cartes ci-dessus ou utilisez le menu latéral.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardAchats;
