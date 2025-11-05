import React, { useState, useEffect, useContext } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { AuthContext } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import api from "../../services/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaFilePdf,
  FaFileExcel,
  FaEye,
  FaTools,
  FaCalendar,
  FaDollarSign,
  FaUser,
  FaDownload,
  FaFile,
  FaTimes,
  FaCheck,
} from "react-icons/fa";

const HistoryPage = () => {
  const { user } = useContext(AuthContext);
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [filterEquipment, setFilterEquipment] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterTechnician, setFilterTechnician] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [formData, setFormData] = useState({
    equipment: "",
    date: new Date().toISOString().split("T")[0],
    type: "réparation",
    description: "",
    cost: "",
    technician: "",
    nextMaintenanceDate: "",
  });

  const maintenanceTypes = ["entretien", "réparation", "inspection"];

  useEffect(() => {
    fetchData();
    fetchEquipments();
  }, [filterEquipment, filterType, filterTechnician, filterDateFrom, filterDateTo]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterEquipment) params.append("equipment", filterEquipment);
      if (filterType) params.append("type", filterType);
      if (filterTechnician) params.append("technician", filterTechnician);
      if (filterDateFrom) params.append("dateFrom", filterDateFrom);
      if (filterDateTo) params.append("dateTo", filterDateTo);

      const { data } = await api.get(`/equipements/maintenance-history?${params.toString()}`);
      setHistory(data || []); // Utiliser un tableau vide par défaut
    } catch (error) {
      console.error("Erreur récupération historique:", error);
      toast.error("Erreur lors du chargement de l'historique");
      setHistory([]); // Éviter le crash en définissant un tableau vide
    } finally {
      setLoading(false);
    }
  };

  const fetchEquipments = async () => {
    try {
      const { data } = await api.get("/equipements/equipments");
      setEquipments(data || []);
    } catch (error) {
      console.error("Erreur récupération équipements:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.equipment || !formData.date || !formData.type) {
      toast.error("L'équipement, la date et le type sont obligatoires");
      return;
    }

    try {
      if (editingEntry) {
        await api.put(
          `/equipements/maintenance-history/${editingEntry.equipmentId}/${editingEntry._id}`,
          formData
        );
        toast.success("Entrée modifiée avec succès !");
      } else {
        await api.post(`/equipements/equipments/${formData.equipment}/maintenance`, {
          date: formData.date,
          type: formData.type,
          description: formData.description,
          cost: formData.cost ? parseFloat(formData.cost) : 0,
          technician: formData.technician,
          nextMaintenanceDate: formData.nextMaintenanceDate || null,
        });
        toast.success("Entrée ajoutée avec succès !");
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la sauvegarde");
    }
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setFormData({
      equipment: entry.equipmentId,
      date: entry.date ? new Date(entry.date).toISOString().split("T")[0] : "",
      type: entry.type,
      description: entry.description || "",
      cost: entry.cost || "",
      technician: entry.technician || "",
      nextMaintenanceDate: entry.nextMaintenanceDate
        ? new Date(entry.nextMaintenanceDate).toISOString().split("T")[0]
        : "",
    });
    setShowModal(true);
  };

  const handleDelete = async (entry) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette entrée ?")) return;
    try {
      await api.delete(`/equipements/maintenance-history/${entry.equipmentId}/${entry._id}`);
      toast.success("Entrée supprimée avec succès !");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  const handleViewDetails = (entry) => {
    setSelectedEntry(entry);
    setShowDetailModal(true);
  };

  const resetForm = () => {
    setFormData({
      equipment: "",
      date: new Date().toISOString().split("T")[0],
      type: "réparation",
      description: "",
      cost: "",
      technician: "",
      nextMaintenanceDate: "",
    });
    setEditingEntry(null);
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

  const getTypeColor = (type) => {
    const colors = {
      réparation: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      entretien: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      inspection: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    };
    return colors[type] || colors.entretien;
  };

  // Statistiques
  const totalCost = history.reduce((sum, entry) => sum + (entry.cost || 0), 0);
  const totalByType = history.reduce((acc, entry) => {
    acc[entry.type] = (acc[entry.type] || 0) + (entry.cost || 0);
    return acc;
  }, {});

  // Données pour le graphique par mois
  const dataByMonth = history.reduce((acc, entry) => {
    const date = new Date(entry.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (!acc[monthKey]) {
      acc[monthKey] = { month: monthKey, count: 0, cost: 0 };
    }
    acc[monthKey].count += 1;
    acc[monthKey].cost += entry.cost || 0;
    return acc;
  }, {});

  const chartDataByMonth = Object.values(dataByMonth)
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12)
    .map((item) => ({
      month: new Date(item.month + "-01").toLocaleDateString("fr-CA", { month: "short", year: "numeric" }),
      "Nombre d'interventions": item.count,
      "Coût total ($)": item.cost,
    }));

  // Données pour le graphique par type
  const chartDataByType = Object.entries(totalByType).map(([type, cost]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: cost,
  }));

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  const exportToPDF = () => {
    toast.info("Fonctionnalité d'export PDF à implémenter");
    // TODO: Implémenter l'export PDF avec jsPDF
  };

  const exportToExcel = () => {
    toast.info("Fonctionnalité d'export Excel à implémenter");
    // TODO: Implémenter l'export Excel avec xlsx
  };

  const costByEquipment = history.reduce((acc, entry) => {
    const key = entry.equipmentName;
    if (!acc[key]) {
      acc[key] = 0;
    }
    acc[key] += entry.cost || 0;
    return acc;
  }, {});

  return (
    <DashboardLayout role={user?.role}>
      <div className={`p-6 min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
        <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-6 mb-6`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-800"} mb-2`}>
                Historique des Réparations
              </h1>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Suivi complet des interventions et coûts de maintenance
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
                <FaPlus /> Ajouter une intervention
              </button>
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-4`}>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${darkMode ? "bg-blue-900" : "bg-blue-100"}`}>
                  <FaTools className={`text-xl ${darkMode ? "text-blue-400" : "text-blue-600"}`} />
                </div>
                <div>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Total interventions</p>
                  <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>{history.length}</p>
                </div>
              </div>
            </div>
            <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-4`}>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${darkMode ? "bg-green-900" : "bg-green-100"}`}>
                  <FaDollarSign className={`text-xl ${darkMode ? "text-green-400" : "text-green-600"}`} />
                </div>
                <div>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Coût total</p>
                  <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
                    {formatCurrency(totalCost)}
                  </p>
                </div>
              </div>
            </div>
            <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-4`}>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${darkMode ? "bg-red-900" : "bg-red-100"}`}>
                  <FaTools className={`text-xl ${darkMode ? "text-red-400" : "text-red-600"}`} />
                </div>
                <div>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Réparations</p>
                  <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
                    {history.filter((h) => h.type === "réparation").length}
                  </p>
                </div>
              </div>
            </div>
            <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-4`}>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${darkMode ? "bg-orange-900" : "bg-orange-100"}`}>
                  <FaCalendar className={`text-xl ${darkMode ? "text-orange-400" : "text-orange-600"}`} />
                </div>
                <div>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Coût moyen</p>
                  <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
                    {history.length > 0 ? formatCurrency(totalCost / history.length) : formatCurrency(0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtres */}
        <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-6 mb-6`}>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Équipement
              </label>
              <select
                value={filterEquipment}
                onChange={(e) => setFilterEquipment(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                }`}
              >
                <option value="">Tous les équipements</option>
                {equipments.map((eq) => (
                  <option key={eq._id} value={eq._id}>
                    {eq.code} - {eq.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                }`}
              >
                <option value="">Tous les types</option>
                {maintenanceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Technicien
              </label>
              <input
                type="text"
                value={filterTechnician}
                onChange={(e) => setFilterTechnician(e.target.value)}
                placeholder="Rechercher..."
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                }`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Date début
              </label>
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                }`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Date fin
              </label>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                }`}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tableau principal */}
          <div className={`lg:col-span-2 ${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md overflow-hidden`}>
            {loading ? (
              <div className={`text-center py-12 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4">Chargement...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        <span className={darkMode ? "text-gray-300" : "text-gray-500"}>Équipement</span>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        <span className={darkMode ? "text-gray-300" : "text-gray-500"}>Date</span>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        <span className={darkMode ? "text-gray-300" : "text-gray-500"}>Type</span>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        <span className={darkMode ? "text-gray-300" : "text-gray-500"}>Coût</span>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        <span className={darkMode ? "text-gray-300" : "text-gray-500"}>Technicien</span>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        <span className={darkMode ? "text-gray-300" : "text-gray-500"}>Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? "divide-gray-700 bg-gray-800" : "divide-gray-200 bg-white"}`}>
                    {history.length === 0 ? (
                      <tr>
                        <td
                          colSpan="6"
                          className={`px-6 py-12 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                        >
                          Aucune intervention trouvée
                        </td>
                      </tr>
                    ) : (
                      history.map((entry) => (
                        <tr
                          key={`${entry.equipmentId}-${entry._id}`}
                          className={`hover:${darkMode ? "bg-gray-700" : "bg-gray-50"} transition-colors cursor-pointer`}
                          onClick={() => handleViewDetails(entry)}
                        >
                          <td className={`px-4 py-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
                            <div className="font-medium">{entry.equipmentName}</div>
                            <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                              {entry.equipmentCode}
                            </div>
                          </td>
                          <td className={`px-4 py-4 whitespace-nowrap ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                            {formatDate(entry.date)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTypeColor(entry.type)}`}>
                              {entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
                            </span>
                          </td>
                          <td className={`px-4 py-4 whitespace-nowrap font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                            {formatCurrency(entry.cost)}
                          </td>
                          <td className={`px-4 py-4 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                            {entry.technician || "-"}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => handleViewDetails(entry)}
                                className={`p-2 rounded-lg transition-colors ${
                                  darkMode ? "text-blue-400 hover:bg-gray-700" : "text-blue-600 hover:bg-blue-50"
                                }`}
                                title="Voir détails"
                              >
                                <FaEye />
                              </button>
                              <button
                                onClick={() => handleEdit(entry)}
                                className={`p-2 rounded-lg transition-colors ${
                                  darkMode ? "text-yellow-400 hover:bg-gray-700" : "text-yellow-600 hover:bg-yellow-50"
                                }`}
                                title="Modifier"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDelete(entry)}
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
            )}
          </div>

          {/* Graphiques */}
          <div className="space-y-6">
            {/* Graphique par mois */}
            {chartDataByMonth.length > 0 && (
              <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-6`}>
                <h3 className={`text-lg font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-800"}`}>
                  Interventions par mois
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartDataByMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
                    <XAxis dataKey="month" tick={{ fill: darkMode ? "#9ca3af" : "#6b7280" }} />
                    <YAxis tick={{ fill: darkMode ? "#9ca3af" : "#6b7280" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: darkMode ? "#1f2937" : "#ffffff",
                        border: darkMode ? "1px solid #374151" : "1px solid #e5e7eb",
                        color: darkMode ? "#ffffff" : "#000000",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="Nombre d'interventions" fill="#3b82f6" />
                    <Bar dataKey="Coût total ($)" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Graphique par type */}
            {chartDataByType.length > 0 && (
              <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-6`}>
                <h3 className={`text-lg font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-800"}`}>
                  Coût par type d'intervention
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={chartDataByType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartDataByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: darkMode ? "#1f2937" : "#ffffff",
                        border: darkMode ? "1px solid #374151" : "1px solid #e5e7eb",
                        color: darkMode ? "#ffffff" : "#000000",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Top équipements par coût */}
            {Object.keys(costByEquipment).length > 0 && (
              <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-6`}>
                <h3 className={`text-lg font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-800"}`}>
                  Coûts par équipement
                </h3>
                <div className="space-y-2">
                  {Object.entries(costByEquipment)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([name, cost]) => (
                      <div key={name} className="flex justify-between items-center">
                        <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"} truncate`} title={name}>
                          {name}
                        </span>
                        <span className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                          {formatCurrency(cost)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Ajouter/Modifier */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl`}>
              <div
                className={`sticky top-0 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border-b px-6 py-4 flex items-center justify-between`}
              >
                <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
                  {editingEntry ? "Modifier l'intervention" : "Ajouter une intervention"}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Équipement *
                    </label>
                    <select
                      required
                      name="equipment"
                      value={formData.equipment}
                      onChange={handleChange}
                      disabled={!!editingEntry}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                      }`}
                    >
                      <option value="">Sélectionner un équipement</option>
                      {equipments.map((eq) => (
                        <option key={eq._id} value={eq._id}>
                          {eq.code} - {eq.name}
                        </option>
                      ))}
                    </select>
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
                      Type d'intervention *
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
                      {maintenanceTypes.map((type) => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Coût ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      name="cost"
                      value={formData.cost}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Technicien
                    </label>
                    <input
                      type="text"
                      name="technician"
                      value={formData.technician}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Prochaine maintenance
                    </label>
                    <input
                      type="date"
                      name="nextMaintenanceDate"
                      value={formData.nextMaintenanceDate}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                      }`}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Description / Commentaires
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="4"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                      }`}
                      placeholder="Détails de l'intervention..."
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
                    {editingEntry ? "Modifier" : "Ajouter"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Détails */}
        {showDetailModal && selectedEntry && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg w-full max-w-2xl shadow-2xl`}>
              <div
                className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border-b px-6 py-4 flex items-center justify-between`}
              >
                <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
                  Détails de l'intervention
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100 text-gray-500"
                  }`}
                >
                  <FaTimes />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Équipement</p>
                    <p className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {selectedEntry.equipmentName}
                    </p>
                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{selectedEntry.equipmentCode}</p>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Date</p>
                    <p className={`text-lg ${darkMode ? "text-white" : "text-gray-900"}`}>{formatDate(selectedEntry.date)}</p>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Type</p>
                    <span className={`px-2 py-1 rounded-full text-sm font-semibold inline-block ${getTypeColor(selectedEntry.type)}`}>
                      {selectedEntry.type.charAt(0).toUpperCase() + selectedEntry.type.slice(1)}
                    </span>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Coût</p>
                    <p className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {formatCurrency(selectedEntry.cost)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Technicien</p>
                    <p className={`text-lg ${darkMode ? "text-white" : "text-gray-900"}`}>{selectedEntry.technician || "-"}</p>
                  </div>
                  {selectedEntry.nextMaintenanceDate && (
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Prochaine maintenance
                      </p>
                      <p className={`text-lg ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {formatDate(selectedEntry.nextMaintenanceDate)}
                      </p>
                    </div>
                  )}
                </div>
                {selectedEntry.description && (
                  <div>
                    <p className={`text-sm font-medium mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      Description / Commentaires
                    </p>
                    <p className={`${darkMode ? "text-gray-300" : "text-gray-700"} whitespace-pre-wrap`}>
                      {selectedEntry.description}
                    </p>
                  </div>
                )}
                <div className={`flex justify-end gap-3 pt-4 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                  <button
                    onClick={() => {
                      handleEdit(selectedEntry);
                      setShowDetailModal(false);
                    }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    <FaEdit className="inline mr-2" /> Modifier
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default HistoryPage;
