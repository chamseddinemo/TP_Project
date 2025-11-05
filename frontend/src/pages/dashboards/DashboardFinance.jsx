import React, { useContext, useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import CardStat from "../../components/CardStat";
import { AuthContext } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import api from "../../services/api";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { FaDollarSign, FaArrowUp, FaArrowDown, FaFileInvoice, FaChartLine, FaCreditCard } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const DashboardFinance = () => {
  const { user } = useContext(AuthContext);
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
    monthlyBalance: 0,
    paidInvoices: 0,
    paidInvoicesAmount: 0,
    pendingInvoices: 0,
    pendingInvoicesAmount: 0,
    recentTransactions: [],
    recentPaidInvoices: [],
    transactionsByCategory: [],
    transactionsByMonth: [],
    topExpenseCategories: [],
    topIncomeCategories: [],
    totalTransactions: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/finance/dashboard-stats");
        setStats(data);
      } catch (error) {
        console.error("Erreur récupération stats finance:", error);
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

  const getTypeColor = (type) => {
    return type === 'entrée' 
      ? darkMode ? "text-green-400" : "text-green-600"
      : darkMode ? "text-red-400" : "text-red-600";
  };

  const getTypeIcon = (type) => {
    return type === 'entrée' ? <FaArrowUp /> : <FaArrowDown />;
  };

  const COLORS = {
    income: darkMode ? "#10B981" : "#059669",
    expense: darkMode ? "#EF4444" : "#DC2626",
    balance: darkMode ? "#3B82F6" : "#2563EB",
    pie: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"]
  };

  // Formatage des données pour les graphiques mensuels
  const formatMonthlyData = () => {
    if (!stats.transactionsByMonth || stats.transactionsByMonth.length === 0) {
      return [];
    }
    
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    
    return stats.transactionsByMonth.map(item => ({
      month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      income: item.income || 0,
      expense: item.expense || 0,
      balance: item.balance || 0
    }));
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
            Dashboard Finance
          </h1>
          <p className={`text-lg ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Vue d'ensemble financière et suivi des revenus, dépenses et factures
          </p>
        </div>

        {/* Statistiques principales */}
        <div className="stats-section mb-8">
          <CardStat 
            title="Revenus" 
            value={formatCurrency(stats.totalIncome)} 
            color="#4CAF50"
            icon={<FaArrowUp className="text-2xl" />}
            subtitle={`${formatCurrency(stats.monthlyIncome)} ce mois`}
            onClick={() => navigate("/finance/transactions")}
          />
          <CardStat 
            title="Dépenses" 
            value={formatCurrency(stats.totalExpense)} 
            color="#F44336"
            icon={<FaArrowDown className="text-2xl" />}
            subtitle={`${formatCurrency(stats.monthlyExpense)} ce mois`}
            onClick={() => navigate("/finance/transactions")}
          />
          <CardStat 
            title="Bénéfice" 
            value={formatCurrency(stats.balance)} 
            color={stats.balance >= 0 ? "#00BCD4" : "#F44336"}
            icon={stats.balance >= 0 ? <FaArrowUp className="text-2xl" /> : <FaArrowDown className="text-2xl" />}
            subtitle={`${formatCurrency(stats.monthlyBalance)} ce mois`}
            onClick={() => navigate("/finance/transactions")}
          />
          <CardStat 
            title="Factures payées" 
            value={stats.paidInvoices} 
            color="#9C27B0"
            icon={<FaFileInvoice className="text-2xl" />}
            subtitle={`${formatCurrency(stats.paidInvoicesAmount)} total`}
            onClick={() => navigate("/vente/factures")}
          />
        </div>

        {/* Graphiques et données détaillées */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Graphique : Revenus vs Dépenses par mois */}
          <div className={`rounded-lg shadow-md p-6 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}>
            <h2 className={`text-xl font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-800"}`}>
              Évolution mensuelle (6 derniers mois)
            </h2>
            {stats.transactionsByMonth && stats.transactionsByMonth.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={formatMonthlyData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#E5E7EB"} />
                  <XAxis 
                    dataKey="month" 
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
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="income" 
                    stroke={COLORS.income} 
                    strokeWidth={2}
                    name="Revenus"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="expense" 
                    stroke={COLORS.expense} 
                    strokeWidth={2}
                    name="Dépenses"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="balance" 
                    stroke={COLORS.balance} 
                    strokeWidth={2}
                    name="Bénéfice"
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className={`p-8 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                <p>Aucune donnée disponible</p>
              </div>
            )}
          </div>

          {/* Graphique : Répartition par catégorie */}
          <div className={`rounded-lg shadow-md p-6 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}>
            <h2 className={`text-xl font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-800"}`}>
              Répartition par catégorie
            </h2>
            {stats.transactionsByCategory && stats.transactionsByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.transactionsByCategory}>
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
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Legend />
                  <Bar dataKey="income" fill={COLORS.income} name="Revenus" />
                  <Bar dataKey="expense" fill={COLORS.expense} name="Dépenses" />
                </BarChart>
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
          {/* Dernières transactions */}
          <div className={`rounded-lg shadow-md p-6 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-semibold flex items-center gap-2 ${darkMode ? "text-white" : "text-gray-800"}`}>
                <FaCreditCard className="text-blue-500" />
                Dernières transactions
              </h2>
              <button
                onClick={() => navigate("/finance/transactions")}
                className={`text-sm ${darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"}`}
              >
                Voir tout
              </button>
            </div>
            {stats.recentTransactions && stats.recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {stats.recentTransactions.map((transaction) => (
                  <div
                    key={transaction._id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                    }`}
                    onClick={() => navigate("/finance/transactions")}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className={`font-medium ${darkMode ? "text-white" : "text-gray-800"}`}>
                        {transaction.description}
                      </p>
                      <span className={`flex items-center gap-1 ${getTypeColor(transaction.type)}`}>
                        {getTypeIcon(transaction.type)}
                        {formatCurrency(transaction.amount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {transaction.category}
                      </p>
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {formatDate(transaction.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`p-4 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                <p className="text-sm">Aucune transaction récente</p>
              </div>
            )}
          </div>

          {/* Dernières factures payées */}
          <div className={`rounded-lg shadow-md p-6 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-semibold flex items-center gap-2 ${darkMode ? "text-white" : "text-gray-800"}`}>
                <FaFileInvoice className="text-purple-500" />
                Factures payées
              </h2>
              <button
                onClick={() => navigate("/vente/factures")}
                className={`text-sm ${darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"}`}
              >
                Voir tout
              </button>
            </div>
            {stats.recentPaidInvoices && stats.recentPaidInvoices.length > 0 ? (
              <div className="space-y-3">
                {stats.recentPaidInvoices.map((invoice) => (
                  <div
                    key={invoice._id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                    }`}
                    onClick={() => navigate("/vente/factures")}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className={`font-medium ${darkMode ? "text-white" : "text-gray-800"}`}>
                        {invoice.numeroCommande || `Facture #${invoice._id.slice(-6)}`}
                      </p>
                      <span className={`font-semibold ${darkMode ? "text-green-400" : "text-green-600"}`}>
                        {formatCurrency(invoice.totalAmount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {invoice.clientId?.name || "Client"}
                      </p>
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {formatDate(invoice.dateCommande || invoice.updatedAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`p-4 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                <p className="text-sm">Aucune facture payée récente</p>
              </div>
            )}
          </div>

          {/* Top catégories de dépenses */}
          <div className={`rounded-lg shadow-md p-6 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-semibold flex items-center gap-2 ${darkMode ? "text-white" : "text-gray-800"}`}>
                <FaChartLine className="text-red-500" />
                Top dépenses
              </h2>
            </div>
            {stats.topExpenseCategories && stats.topExpenseCategories.length > 0 ? (
              <div className="space-y-3">
                {stats.topExpenseCategories.map((item, index) => (
                  <div
                    key={item._id || index}
                    className={`p-3 rounded-lg ${
                      darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className={`font-medium ${darkMode ? "text-white" : "text-gray-800"}`}>
                        {item._id}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded ${
                        index === 0 
                          ? darkMode ? "bg-red-900 text-red-200" : "bg-red-100 text-red-800"
                          : darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-800"
                      }`}>
                        #{index + 1}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {item.count} {item.count > 1 ? "transactions" : "transaction"}
                      </p>
                      <p className={`text-sm font-semibold ${darkMode ? "text-red-400" : "text-red-600"}`}>
                        {formatCurrency(item.total)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`p-4 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                <p className="text-sm">Aucune dépense</p>
              </div>
            )}
          </div>
        </div>

        {/* Alertes et informations */}
        {stats.pendingInvoices > 0 && (
          <div className={`mt-6 rounded-lg shadow-md p-6 ${darkMode ? "bg-yellow-900 border border-yellow-700" : "bg-yellow-50 border border-yellow-200"}`}>
            <div className="flex items-start gap-3">
              <FaFileInvoice className={`text-2xl ${darkMode ? "text-yellow-300" : "text-yellow-600"} mt-1`} />
              <div>
                <h3 className={`text-lg font-semibold mb-2 ${darkMode ? "text-yellow-200" : "text-yellow-800"}`}>
                  Factures en attente de paiement
                </h3>
                <p className={`text-sm ${darkMode ? "text-yellow-300" : "text-yellow-700"}`}>
                  {stats.pendingInvoices} facture(s) pour un montant total de {formatCurrency(stats.pendingInvoicesAmount)}.
                  <button
                    onClick={() => navigate("/vente/factures")}
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
            Gestion financière
          </h2>
          <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
            Suivi des revenus, dépenses et factures payées. Accédez rapidement aux différentes sections via les cartes ci-dessus ou utilisez le menu latéral.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardFinance;
