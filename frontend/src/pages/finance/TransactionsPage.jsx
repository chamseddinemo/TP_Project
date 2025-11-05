import React, { useState, useEffect, useContext } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { AuthContext } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import api from "../../services/api";
import { toast } from "react-toastify";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaFilePdf,
  FaFileExcel,
  FaArrowUp,
  FaArrowDown,
  FaCalendar,
  FaDollarSign,
  FaTimes,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
} from "react-icons/fa";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const TransactionsPage = () => {
  const { user } = useContext(AuthContext);
  const { darkMode } = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    count: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [formData, setFormData] = useState({
    type: "entrée",
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    category: "Autre",
    status: "validée",
    reference: "",
    notes: "",
  });

  const categories = [
    "Vente",
    "Achat",
    "Salaire",
    "Fournisseur",
    "Frais généraux",
    "Impôt",
    "Intérêt",
    "Location",
    "Autre",
  ];

  useEffect(() => {
    fetchData();
  }, [filterType, filterCategory, filterStatus, filterDateFrom, filterDateTo]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterType) params.append("type", filterType);
      if (filterCategory) params.append("category", filterCategory);
      if (filterStatus) params.append("status", filterStatus);
      if (filterDateFrom) params.append("dateFrom", filterDateFrom);
      if (filterDateTo) params.append("dateTo", filterDateTo);

      const [transactionsRes, statsRes] = await Promise.all([
        api.get(`/finance/transactions${params.toString() ? `?${params.toString()}` : ""}`),
        api.get(`/finance/stats${params.toString() ? `?${params.toString()}` : ""}`),
      ]);

      setTransactions(transactionsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Erreur récupération données:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description || !formData.amount || !formData.date || !formData.category) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount),
      };

      if (editingTransaction) {
        await api.put(`/finance/transactions/${editingTransaction._id}`, transactionData);
        toast.success("Transaction modifiée avec succès !");
      } else {
        await api.post("/finance/transactions", transactionData);
        toast.success("Transaction créée avec succès !");
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la sauvegarde");
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type,
      description: transaction.description,
      amount: transaction.amount,
      date: transaction.date ? new Date(transaction.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      category: transaction.category,
      status: transaction.status,
      reference: transaction.reference || "",
      notes: transaction.notes || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette transaction ?")) return;
    try {
      await api.delete(`/finance/transactions/${id}`);
      toast.success("Transaction supprimée avec succès !");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  const resetForm = () => {
    setFormData({
      type: "entrée",
      description: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      category: "Autre",
      status: "validée",
      reference: "",
      notes: "",
    });
    setEditingTransaction(null);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("fr-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fr-CA", {
      style: "currency",
      currency: "CAD",
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "validée":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "en attente":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "annulée":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      `${transaction.description} ${transaction.reference || ""}`.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Données pour le graphique des entrées/sorties
  const chartData = [
    { name: "Entrées", value: stats.totalIncome, color: "#10B981" },
    { name: "Sorties", value: stats.totalExpense, color: "#EF4444" },
  ];

  // Données pour le graphique par catégorie (top 5)
  const categoryChartData = Object.entries(stats.categoryStats || {})
    .map(([category, data]) => ({
      name: category,
      entrées: data.income || 0,
      sorties: data.expense || 0,
    }))
    .sort((a, b) => (b.entrées + b.sorties) - (a.entrées + a.sorties))
    .slice(0, 5);

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316", "#6366F1"];

  const exportToPDF = () => {
    toast.info("Fonctionnalité d'export PDF à implémenter");
  };

  const exportToExcel = () => {
    toast.info("Fonctionnalité d'export Excel à implémenter");
  };

  return (
    <DashboardLayout role={user?.role}>
      <div className={`p-6 min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
        <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-6 mb-6`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-800"} mb-2`}>
                Gestion des Transactions Financières
              </h1>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Suivi complet des entrées et sorties de fonds
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={exportToExcel}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
                title="Exporter en Excel"
              >
                <FaFileExcel /> Excel
              </button>
              <button
                onClick={exportToPDF}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
                title="Exporter en PDF"
              >
                <FaFilePdf /> PDF
              </button>
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 font-semibold transition-colors shadow-md hover:shadow-lg"
              >
                <FaPlus /> Nouvelle transaction
              </button>
            </div>
          </div>
        </div>

        {/* Statistiques et solde global */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-4`}>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${darkMode ? "bg-green-900" : "bg-green-100"}`}>
                <FaArrowUp className={`text-xl ${darkMode ? "text-green-400" : "text-green-600"}`} />
              </div>
              <div>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Total entrées</p>
                <p className={`text-2xl font-bold ${darkMode ? "text-green-400" : "text-green-600"}`}>
                  {formatCurrency(stats.totalIncome)}
                </p>
              </div>
            </div>
          </div>
          <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-4`}>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${darkMode ? "bg-red-900" : "bg-red-100"}`}>
                <FaArrowDown className={`text-xl ${darkMode ? "text-red-400" : "text-red-600"}`} />
              </div>
              <div>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Total sorties</p>
                <p className={`text-2xl font-bold ${darkMode ? "text-red-400" : "text-red-600"}`}>
                  {formatCurrency(stats.totalExpense)}
                </p>
              </div>
            </div>
          </div>
          <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-4`}>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${stats.balance >= 0 ? (darkMode ? "bg-blue-900" : "bg-blue-100") : (darkMode ? "bg-orange-900" : "bg-orange-100")}`}>
                <FaDollarSign className={`text-xl ${stats.balance >= 0 ? (darkMode ? "text-blue-400" : "text-blue-600") : (darkMode ? "text-orange-400" : "text-orange-600")}`} />
              </div>
              <div>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Solde global</p>
                <p className={`text-2xl font-bold ${stats.balance >= 0 ? (darkMode ? "text-blue-400" : "text-blue-600") : (darkMode ? "text-orange-400" : "text-orange-600")}`}>
                  {formatCurrency(stats.balance)}
                </p>
              </div>
            </div>
          </div>
          <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-4`}>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${darkMode ? "bg-purple-900" : "bg-purple-100"}`}>
                <FaCalendar className={`text-xl ${darkMode ? "text-purple-400" : "text-purple-600"}`} />
              </div>
              <div>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Transactions</p>
                <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>{stats.count}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Graphiques récapitulatifs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-6`}>
            <h2 className={`text-xl font-bold mb-4 ${darkMode ? "text-white" : "text-gray-800"}`}>
              Répartition Entrées / Sorties
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-6`}>
            <h2 className={`text-xl font-bold mb-4 ${darkMode ? "text-white" : "text-gray-800"}`}>
              Répartition par Catégorie (Top 5)
            </h2>
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#E5E7EB"} />
                  <XAxis dataKey="name" stroke={darkMode ? "#9CA3AF" : "#6B7280"} />
                  <YAxis stroke={darkMode ? "#9CA3AF" : "#6B7280"} tickFormatter={(value) => `$${value}`} />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
                      border: darkMode ? "1px solid #374151" : "1px solid #E5E7EB",
                      color: darkMode ? "#F3F4F6" : "#111827",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="entrées" fill="#10B981" />
                  <Bar dataKey="sorties" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className={`text-center py-12 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Aucune donnée disponible
              </div>
            )}
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-6 mb-6`}>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <FaSearch
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    darkMode ? "text-gray-400" : "text-gray-400"
                  }`}
                />
                <input
                  type="text"
                  placeholder="Rechercher par description ou référence..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-800"
                  }`}
                />
              </div>
            </div>
            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                }`}
              >
                <option value="">Tous les types</option>
                <option value="entrée">Entrée</option>
                <option value="sortie">Sortie</option>
              </select>
            </div>
            <div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                }`}
              >
                <option value="">Toutes les catégories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                }`}
              >
                <option value="">Tous les statuts</option>
                <option value="validée">Validée</option>
                <option value="en attente">En attente</option>
                <option value="annulée">Annulée</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                }`}
                placeholder="Du"
              />
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                }`}
                placeholder="Au"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className={`text-center py-12 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4">Chargement...</p>
          </div>
        ) : (
          <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      <span className={darkMode ? "text-gray-300" : "text-gray-500"}>Type</span>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      <span className={darkMode ? "text-gray-300" : "text-gray-500"}>Description</span>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      <span className={darkMode ? "text-gray-300" : "text-gray-500"}>Montant</span>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      <span className={darkMode ? "text-gray-300" : "text-gray-500"}>Date</span>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      <span className={darkMode ? "text-gray-300" : "text-gray-500"}>Catégorie</span>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      <span className={darkMode ? "text-gray-300" : "text-gray-500"}>Statut</span>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      <span className={darkMode ? "text-gray-300" : "text-gray-500"}>Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? "divide-gray-700 bg-gray-800" : "divide-gray-200 bg-white"}`}>
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className={`px-6 py-12 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                      >
                        Aucune transaction trouvée
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((transaction) => (
                      <tr
                        key={transaction._id}
                        className={`hover:${darkMode ? "bg-gray-700" : "bg-gray-50"} transition-colors`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${
                              transaction.type === "entrée"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {transaction.type === "entrée" ? <FaArrowUp /> : <FaArrowDown />}
                            {transaction.type === "entrée" ? "Entrée" : "Sortie"}
                          </span>
                        </td>
                        <td className={`px-6 py-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
                          <div>
                            <div className="font-medium">{transaction.description}</div>
                            {transaction.reference && (
                              <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"} font-mono`}>
                                Ref: {transaction.reference}
                              </div>
                            )}
                          </div>
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap font-semibold ${
                            transaction.type === "entrée"
                              ? darkMode
                                ? "text-green-400"
                                : "text-green-600"
                              : darkMode
                              ? "text-red-400"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.type === "entrée" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                          <div className="flex items-center gap-1">
                            <FaCalendar className="text-xs" />
                            {formatDate(transaction.date)}
                          </div>
                        </td>
                        <td className={`px-6 py-4 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                          {transaction.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(transaction.status)}`}>
                            {transaction.status === "validée" && <FaCheckCircle className="inline mr-1" />}
                            {transaction.status === "en attente" && <FaClock className="inline mr-1" />}
                            {transaction.status === "annulée" && <FaTimesCircle className="inline mr-1" />}
                            {transaction.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(transaction)}
                              className={`p-2 rounded-lg transition-colors ${
                                darkMode ? "text-yellow-400 hover:bg-gray-700" : "text-yellow-600 hover:bg-yellow-50"
                              }`}
                              title="Modifier"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(transaction._id)}
                              className={`p-2 rounded-lg transition-colors ${
                                darkMode ? "text-red-400 hover:bg-gray-700" : "text-red-600 hover:bg-red-50"
                              }`}
                              title="Supprimer"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Ajouter/Modifier transaction */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl`}>
              <div
                className={`sticky top-0 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border-b px-6 py-4 flex items-center justify-between`}
              >
                <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
                  {editingTransaction ? "Modifier la transaction" : "Nouvelle transaction"}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100 text-gray-500"
                  }`}
                >
                  <FaTimes />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Type *
                    </label>
                    <select
                      required
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                      }`}
                    >
                      <option value="entrée">Entrée</option>
                      <option value="sortie">Sortie</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Catégorie *
                    </label>
                    <select
                      required
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                      }`}
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Description *
                    </label>
                    <input
                      type="text"
                      required
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                      }`}
                      placeholder="Description de la transaction"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Montant ($) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Date *
                    </label>
                    <input
                      type="date"
                      required
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Statut
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                      }`}
                    >
                      <option value="validée">Validée</option>
                      <option value="en attente">En attente</option>
                      <option value="annulée">Annulée</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Référence
                    </label>
                    <input
                      type="text"
                      name="reference"
                      value={formData.reference}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                      }`}
                      placeholder="Référence (optionnel)"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                      }`}
                      rows="3"
                      placeholder="Notes supplémentaires (optionnel)"
                    />
                  </div>
                </div>

                <div className={`flex justify-end gap-3 pt-4 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className={`px-6 py-2 border rounded-lg transition-colors ${
                      darkMode
                        ? "border-gray-600 hover:bg-gray-700 text-gray-300"
                        : "border-gray-300 hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    {editingTransaction ? "Modifier" : "Créer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TransactionsPage;

