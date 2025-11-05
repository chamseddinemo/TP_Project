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
  FaFilePdf,
  FaFileExcel,
  FaCalendar,
  FaDollarSign,
  FaTimes,
  FaExclamationTriangle,
  FaCheckCircle,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const BudgetsPage = () => {
  const { user } = useContext(AuthContext);
  const { darkMode } = useTheme();
  const [budgets, setBudgets] = useState([]);
  const [stats, setStats] = useState({
    totalBudgeted: 0,
    totalActual: 0,
    totalVariance: 0,
    totalVariancePercent: 0,
    count: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [filterCategory, setFilterCategory] = useState("");
  const [filterPeriodType, setFilterPeriodType] = useState("");
  const [formData, setFormData] = useState({
    category: "",
    budgetedAmount: "",
    periodType: "annuel",
    year: new Date().getFullYear(),
    month: "",
    quarter: "",
    description: "",
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
    "Marketing",
    "Autre",
  ];

  const months = [
    { value: 1, label: "Janvier" },
    { value: 2, label: "Février" },
    { value: 3, label: "Mars" },
    { value: 4, label: "Avril" },
    { value: 5, label: "Mai" },
    { value: 6, label: "Juin" },
    { value: 7, label: "Juillet" },
    { value: 8, label: "Août" },
    { value: 9, label: "Septembre" },
    { value: 10, label: "Octobre" },
    { value: 11, label: "Novembre" },
    { value: 12, label: "Décembre" },
  ];

  useEffect(() => {
    fetchData();
  }, [selectedYear, filterCategory, filterPeriodType]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("year", selectedYear);
      if (filterCategory) params.append("category", filterCategory);
      if (filterPeriodType) params.append("periodType", filterPeriodType);

      const [budgetsRes, statsRes] = await Promise.all([
        api.get(`/finance/budgets?${params.toString()}`),
        api.get(`/finance/budgets/stats?year=${selectedYear}`),
      ]);

      setBudgets(budgetsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Erreur récupération données:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      // Réinitialiser mois et trimestre si on change le type de période
      if (name === "periodType") {
        if (value === "annuel") {
          newData.month = "";
          newData.quarter = "";
        } else if (value === "mensuel") {
          newData.quarter = "";
        }
      }
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category || !formData.budgetedAmount || !formData.year) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (formData.periodType === "mensuel" && !formData.month) {
      toast.error("Veuillez sélectionner un mois");
      return;
    }

    if (formData.periodType === "trimestriel" && !formData.quarter) {
      toast.error("Veuillez sélectionner un trimestre");
      return;
    }

    try {
      const budgetData = {
        ...formData,
        budgetedAmount: parseFloat(formData.budgetedAmount),
        year: parseInt(formData.year),
        month: formData.month ? parseInt(formData.month) : undefined,
        quarter: formData.quarter ? parseInt(formData.quarter) : undefined,
      };

      if (editingBudget) {
        await api.put(`/finance/budgets/${editingBudget._id}`, budgetData);
        toast.success("Budget modifié avec succès !");
      } else {
        await api.post("/finance/budgets", budgetData);
        toast.success("Budget créé avec succès !");
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la sauvegarde");
    }
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      budgetedAmount: budget.budgetedAmount,
      periodType: budget.periodType || "annuel",
      year: budget.year,
      month: budget.month || "",
      quarter: budget.quarter || "",
      description: budget.description || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce budget ?")) return;
    try {
      await api.delete(`/finance/budgets/${id}`);
      toast.success("Budget supprimé avec succès !");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  const resetForm = () => {
    setFormData({
      category: "",
      budgetedAmount: "",
      periodType: "annuel",
      year: new Date().getFullYear(),
      month: "",
      quarter: "",
      description: "",
    });
    setEditingBudget(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fr-CA", {
      style: "currency",
      currency: "CAD",
    }).format(amount || 0);
  };

  const formatPeriod = (budget) => {
    if (budget.periodType === "annuel") {
      return budget.year.toString();
    } else if (budget.periodType === "mensuel" && budget.month) {
      const monthName = months.find((m) => m.value === budget.month)?.label || budget.month;
      return `${monthName} ${budget.year}`;
    } else if (budget.periodType === "trimestriel" && budget.quarter) {
      return `T${budget.quarter} ${budget.year}`;
    }
    return `${budget.year}`;
  };

  const getVarianceColor = (variancePercent) => {
    if (variancePercent > 0) {
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"; // Sous budget
    } else if (variancePercent < 0) {
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"; // Dépassement
    }
    return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"; // À l'équilibre
  };

  const getVarianceIcon = (variancePercent) => {
    if (variancePercent > 0) {
      return <FaCheckCircle className="inline mr-1" />;
    } else if (variancePercent < 0) {
      return <FaExclamationTriangle className="inline mr-1" />;
    }
    return null;
  };

  const filteredBudgets = budgets.filter((budget) => {
    return true; // Filtrage déjà fait côté API
  });

  // Données pour le graphique comparatif
  const chartData = filteredBudgets.map((budget) => ({
    name: budget.category,
    Budget: budget.budgetedAmount,
    Réalisé: budget.actualAmount || 0,
    Écart: budget.variance || 0,
  }));

  // Données pour le graphique linéaire par catégorie (top 5)
  const topBudgets = [...filteredBudgets]
    .sort((a, b) => Math.abs(b.variancePercent || 0) - Math.abs(a.variancePercent || 0))
    .slice(0, 5);

  const lineChartData = topBudgets.map((budget) => ({
    name: budget.category,
    Budget: budget.budgetedAmount,
    Réalisé: budget.actualAmount || 0,
  }));

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
                Gestion des Budgets
              </h1>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Planification et suivi des budgets prévisionnels
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
                <FaPlus /> Nouveau budget
              </button>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-4`}>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${darkMode ? "bg-blue-900" : "bg-blue-100"}`}>
                <FaDollarSign className={`text-xl ${darkMode ? "text-blue-400" : "text-blue-600"}`} />
              </div>
              <div>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Budget total</p>
                <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
                  {formatCurrency(stats.totalBudgeted)}
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
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Réalisé</p>
                <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
                  {formatCurrency(stats.totalActual)}
                </p>
              </div>
            </div>
          </div>
          <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-4`}>
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-lg ${
                  stats.totalVariance >= 0
                    ? darkMode
                      ? "bg-green-900"
                      : "bg-green-100"
                    : darkMode
                    ? "bg-red-900"
                    : "bg-red-100"
                }`}
              >
                {stats.totalVariance >= 0 ? (
                  <FaArrowDown
                    className={`text-xl ${darkMode ? "text-green-400" : "text-green-600"}`}
                  />
                ) : (
                  <FaArrowUp className={`text-xl ${darkMode ? "text-red-400" : "text-red-600"}`} />
                )}
              </div>
              <div>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Écart</p>
                <p
                  className={`text-2xl font-bold ${
                    stats.totalVariance >= 0
                      ? darkMode
                        ? "text-green-400"
                        : "text-green-600"
                      : darkMode
                      ? "text-red-400"
                      : "text-red-600"
                  }`}
                >
                  {formatCurrency(Math.abs(stats.totalVariance))}
                </p>
              </div>
            </div>
          </div>
          <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-4`}>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                <FaCalendar className={`text-xl ${darkMode ? "text-gray-400" : "text-gray-600"}`} />
              </div>
              <div>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Budgets</p>
                <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>{stats.count}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-6`}>
            <h2 className={`text-xl font-bold mb-4 ${darkMode ? "text-white" : "text-gray-800"}`}>
              Comparaison Budget vs Réalisé
            </h2>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
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
                  <Bar dataKey="Budget" fill="#3B82F6" />
                  <Bar dataKey="Réalisé" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className={`text-center py-12 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Aucune donnée disponible
              </div>
            )}
          </div>
          <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-6`}>
            <h2 className={`text-xl font-bold mb-4 ${darkMode ? "text-white" : "text-gray-800"}`}>
              Analyse des Écarts (Top 5)
            </h2>
            {lineChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineChartData}>
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
                  <Line type="monotone" dataKey="Budget" stroke="#3B82F6" strokeWidth={2} />
                  <Line type="monotone" dataKey="Réalisé" stroke="#10B981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className={`text-center py-12 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Aucune donnée disponible
              </div>
            )}
          </div>
        </div>

        {/* Filtres */}
        <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-6 mb-6`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Année
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                }`}
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Catégorie
              </label>
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
              <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Type de période
              </label>
              <select
                value={filterPeriodType}
                onChange={(e) => setFilterPeriodType(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                }`}
              >
                <option value="">Tous les types</option>
                <option value="annuel">Annuel</option>
                <option value="mensuel">Mensuel</option>
                <option value="trimestriel">Trimestriel</option>
              </select>
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
                      <span className={darkMode ? "text-gray-300" : "text-gray-500"}>Catégorie</span>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      <span className={darkMode ? "text-gray-300" : "text-gray-500"}>Budget prévu</span>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      <span className={darkMode ? "text-gray-300" : "text-gray-500"}>Réalisé</span>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      <span className={darkMode ? "text-gray-300" : "text-gray-500"}>Écart (%)</span>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      <span className={darkMode ? "text-gray-300" : "text-gray-500"}>Période</span>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      <span className={darkMode ? "text-gray-300" : "text-gray-500"}>Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? "divide-gray-700 bg-gray-800" : "divide-gray-200 bg-white"}`}>
                  {filteredBudgets.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className={`px-6 py-12 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                      >
                        Aucun budget trouvé
                      </td>
                    </tr>
                  ) : (
                    filteredBudgets.map((budget) => {
                      const variancePercent = budget.variancePercent || 0;
                      const isOverBudget = variancePercent < 0;
                      return (
                        <tr
                          key={budget._id}
                          className={`hover:${darkMode ? "bg-gray-700" : "bg-gray-50"} transition-colors ${
                            isOverBudget && darkMode ? "bg-red-900/20" : isOverBudget ? "bg-red-50" : ""
                          }`}
                        >
                          <td className={`px-6 py-4 ${darkMode ? "text-white" : "text-gray-900"} font-medium`}>
                            {budget.category}
                          </td>
                          <td className={`px-6 py-4 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                            {formatCurrency(budget.budgetedAmount)}
                          </td>
                          <td className={`px-6 py-4 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                            {formatCurrency(budget.actualAmount || 0)}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center w-fit ${getVarianceColor(
                                variancePercent
                              )}`}
                            >
                              {getVarianceIcon(variancePercent)}
                              {variancePercent > 0 ? "+" : ""}
                              {variancePercent.toFixed(2)}%
                            </span>
                            {isOverBudget && (
                              <span className="ml-2 text-xs text-red-600 dark:text-red-400">
                                <FaExclamationTriangle className="inline" /> Dépassement
                              </span>
                            )}
                          </td>
                          <td className={`px-6 py-4 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                            {formatPeriod(budget)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEdit(budget)}
                                className={`p-2 rounded-lg transition-colors ${
                                  darkMode ? "text-yellow-400 hover:bg-gray-700" : "text-yellow-600 hover:bg-yellow-50"
                                }`}
                                title="Modifier"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDelete(budget._id)}
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
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Ajouter/Modifier budget */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl`}>
              <div
                className={`sticky top-0 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border-b px-6 py-4 flex items-center justify-between`}
              >
                <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
                  {editingBudget ? "Modifier le budget" : "Nouveau budget"}
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
                      <option value="">Sélectionner une catégorie</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Montant budgété ($) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      name="budgetedAmount"
                      value={formData.budgetedAmount}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Type de période *
                    </label>
                    <select
                      required
                      name="periodType"
                      value={formData.periodType}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                      }`}
                    >
                      <option value="annuel">Annuel</option>
                      <option value="mensuel">Mensuel</option>
                      <option value="trimestriel">Trimestriel</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Année *
                    </label>
                    <input
                      type="number"
                      required
                      min="2020"
                      max="2100"
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                      }`}
                    />
                  </div>
                  {formData.periodType === "mensuel" && (
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Mois *
                      </label>
                      <select
                        required
                        name="month"
                        value={formData.month}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                        }`}
                      >
                        <option value="">Sélectionner un mois</option>
                        {months.map((m) => (
                          <option key={m.value} value={m.value}>
                            {m.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {formData.periodType === "trimestriel" && (
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Trimestre *
                      </label>
                      <select
                        required
                        name="quarter"
                        value={formData.quarter}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                        }`}
                      >
                        <option value="">Sélectionner un trimestre</option>
                        <option value="1">T1 (Janvier - Mars)</option>
                        <option value="2">T2 (Avril - Juin)</option>
                        <option value="3">T3 (Juillet - Septembre)</option>
                        <option value="4">T4 (Octobre - Décembre)</option>
                      </select>
                    </div>
                  )}
                  <div className="col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                      }`}
                      rows="3"
                      placeholder="Description du budget (optionnel)"
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
                    {editingBudget ? "Modifier" : "Créer"}
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

export default BudgetsPage;

