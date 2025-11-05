import React, { useContext, useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import CardStat from "../../components/CardStat";
import { AuthContext } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import axios from "axios";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { FaBox, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaDollarSign, FaChartLine, FaTruck, FaTag } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const DashboardStock = () => {
  const { user } = useContext(AuthContext);
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    inStockProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    totalStockValue: 0,
    lowStockValue: 0,
    productsToReorder: [],
    productsByCategory: [],
    recentProducts: [],
    statsBySupplier: [],
    lowStockCategories: [],
    recentlyUpdatedProducts: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get("/api/stock/stats");
        setStats(data);
      } catch (error) {
        console.error("Erreur récupération stats stock:", error);
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

  const getStockStatus = (quantity, minQuantity) => {
    if (quantity === 0) return { status: "out", color: "text-red-600", bg: "bg-red-100", label: "Rupture" };
    if (quantity < minQuantity) return { status: "low", color: "text-yellow-600", bg: "bg-yellow-100", label: "Faible" };
    return { status: "ok", color: "text-green-600", bg: "bg-green-100", label: "Normal" };
  };

  const getStockStatusDark = (quantity, minQuantity) => {
    if (quantity === 0) return { status: "out", color: "text-red-400", bg: "bg-red-900", label: "Rupture" };
    if (quantity < minQuantity) return { status: "low", color: "text-yellow-400", bg: "bg-yellow-900", label: "Faible" };
    return { status: "ok", color: "text-green-400", bg: "bg-green-900", label: "Normal" };
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
            Dashboard Stock
          </h1>
          <p className={`text-lg ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Vue d'ensemble des stocks et inventaires
          </p>
        </div>

        {/* Statistiques principales */}
        <div className="stats-section mb-8">
          <CardStat 
            title="Produits totaux" 
            value={stats.totalProducts} 
            color="#2196F3"
            icon={<FaBox className="text-2xl" />}
            subtitle={`${formatCurrency(stats.totalStockValue)} valeur`}
            onClick={() => navigate("/stock/produits")}
          />
          <CardStat 
            title="En stock" 
            value={stats.inStockProducts} 
            color="#4CAF50"
            icon={<FaCheckCircle className="text-2xl" />}
            subtitle={`${stats.totalProducts > 0 ? Math.round((stats.inStockProducts / stats.totalProducts) * 100) : 0}% du total`}
            onClick={() => navigate("/stock/produits")}
          />
          <CardStat 
            title="Stock faible" 
            value={stats.lowStockProducts} 
            color="#FF9800"
            icon={<FaExclamationTriangle className="text-2xl" />}
            subtitle={`${formatCurrency(stats.lowStockValue)} valeur`}
            onClick={() => navigate("/stock/produits")}
          />
          <CardStat 
            title="Rupture" 
            value={stats.outOfStockProducts} 
            color="#F44336"
            icon={<FaTimesCircle className="text-2xl" />}
            subtitle={`${stats.totalProducts > 0 ? Math.round((stats.outOfStockProducts / stats.totalProducts) * 100) : 0}% du total`}
            onClick={() => navigate("/stock/produits")}
          />
        </div>

        {/* Graphiques et données détaillées */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Graphique : Répartition par catégorie */}
          <div className={`rounded-lg shadow-md p-6 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}>
            <h2 className={`text-xl font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-800"}`}>
              Répartition par catégorie
            </h2>
            {stats.productsByCategory && stats.productsByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.productsByCategory}>
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
                  <Bar dataKey="count" fill={COLORS.bar} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className={`p-8 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                <p>Aucune donnée disponible</p>
              </div>
            )}
          </div>

          {/* Graphique : Statut du stock */}
          <div className={`rounded-lg shadow-md p-6 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}>
            <h2 className={`text-xl font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-800"}`}>
              Répartition du statut
            </h2>
            {stats.totalProducts > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'En stock', value: stats.inStockProducts },
                      { name: 'Stock faible', value: stats.lowStockProducts },
                      { name: 'Rupture', value: stats.outOfStockProducts }
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
          {/* Produits à réapprovisionner */}
          <div className={`rounded-lg shadow-md p-6 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-semibold flex items-center gap-2 ${darkMode ? "text-white" : "text-gray-800"}`}>
                <FaExclamationTriangle className="text-yellow-500" />
                À réapprovisionner
              </h2>
              {stats.productsToReorder && stats.productsToReorder.length > 0 && (
                <span className={`flex items-center gap-1 text-sm font-semibold ${
                  darkMode ? "text-yellow-400" : "text-yellow-600"
                }`}>
                  {stats.productsToReorder.length}
                </span>
              )}
            </div>
            {stats.productsToReorder && stats.productsToReorder.length > 0 ? (
              <div className="space-y-3">
                {stats.productsToReorder.slice(0, 5).map((product) => {
                  const stockStatus = darkMode 
                    ? getStockStatusDark(product.quantity, product.minQuantity)
                    : getStockStatus(product.quantity, product.minQuantity);
                  
                  return (
                    <div
                      key={product._id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                      }`}
                      onClick={() => navigate("/stock/produits")}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className={`font-medium ${darkMode ? "text-white" : "text-gray-800"}`}>
                          {product.name}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded ${darkMode ? stockStatus.bg : stockStatus.bg} ${stockStatus.color}`}>
                          {stockStatus.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          {product.reference}
                        </p>
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          {product.quantity} / {product.minQuantity}
                        </p>
                      </div>
                      {product.supplier && (
                        <p className={`text-xs mt-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                          Fournisseur: {product.supplier?.name || "N/A"}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={`p-4 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                <p className="text-sm">Tous les stocks sont à jour</p>
              </div>
            )}
          </div>

          {/* Derniers produits */}
          <div className={`rounded-lg shadow-md p-6 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>
                Derniers produits
              </h2>
              <button
                onClick={() => navigate("/stock/produits")}
                className={`text-sm ${darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"}`}
              >
                Voir tout
              </button>
            </div>
            {stats.recentProducts && stats.recentProducts.length > 0 ? (
              <div className="space-y-3">
                {stats.recentProducts.map((product) => {
                  const stockStatus = darkMode 
                    ? getStockStatusDark(product.quantity, product.minQuantity)
                    : getStockStatus(product.quantity, product.minQuantity);
                  
                  return (
                    <div
                      key={product._id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                      }`}
                      onClick={() => navigate("/stock/produits")}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className={`font-medium ${darkMode ? "text-white" : "text-gray-800"}`}>
                          {product.name}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded ${darkMode ? stockStatus.bg : stockStatus.bg} ${stockStatus.color}`}>
                          {stockStatus.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          {product.category || "Sans catégorie"}
                        </p>
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          {product.quantity} {product.unit || "unité"}
                        </p>
                      </div>
                      {product.createdAt && (
                        <p className={`text-xs mt-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                          Ajouté le {formatDate(product.createdAt)}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={`p-4 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                <p className="text-sm">Aucun produit récent</p>
              </div>
            )}
          </div>

          {/* Fournisseurs principaux */}
          <div className={`rounded-lg shadow-md p-6 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-semibold flex items-center gap-2 ${darkMode ? "text-white" : "text-gray-800"}`}>
                <FaTruck className="text-blue-500" />
                Fournisseurs principaux
              </h2>
            </div>
            {stats.statsBySupplier && stats.statsBySupplier.length > 0 ? (
              <div className="space-y-3">
                {stats.statsBySupplier.map((item, index) => (
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
                          ? darkMode ? "bg-blue-900 text-blue-200" : "bg-blue-100 text-blue-800"
                          : darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-800"
                      }`}>
                        #{index + 1}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {item.count} {item.count > 1 ? "produits" : "produit"}
                      </p>
                      <p className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>
                        {formatCurrency(item.totalValue)}
                      </p>
                    </div>
                    <p className={`text-xs mt-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                      {item.totalQuantity} unités en stock
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`p-4 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                <p className="text-sm">Aucun fournisseur</p>
              </div>
            )}
          </div>
        </div>

        {/* Alertes et informations */}
        {stats.productsToReorder && stats.productsToReorder.length > 0 && (
          <div className={`mt-6 rounded-lg shadow-md p-6 ${darkMode ? "bg-red-900 border border-red-700" : "bg-red-50 border border-red-200"}`}>
            <div className="flex items-start gap-3">
              <FaExclamationTriangle className={`text-2xl ${darkMode ? "text-red-300" : "text-red-600"} mt-1`} />
              <div>
                <h3 className={`text-lg font-semibold mb-2 ${darkMode ? "text-red-200" : "text-red-800"}`}>
                  Attention : Produits nécessitant une réapprovisionnement
                </h3>
                <p className={`text-sm ${darkMode ? "text-red-300" : "text-red-700"}`}>
                  {stats.productsToReorder.length} produit(s) nécessitent une attention immédiate (stock faible ou rupture).
                  <button
                    onClick={() => navigate("/stock/produits")}
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
            Gestion des produits
          </h2>
          <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
            Visualisez et gérez les produits, quantités et fournisseurs. Accédez rapidement aux différentes sections via les cartes ci-dessus ou utilisez le menu latéral.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardStock;
