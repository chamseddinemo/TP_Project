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
  FaEye,
  FaFilePdf,
  FaFileExcel,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaTimes,
  FaImage,
  FaTools,
  FaMapMarkerAlt,
  FaUser,
} from "react-icons/fa";

const EquipmentListPage = () => {
  const { user } = useContext(AuthContext);
  const { darkMode } = useTheme();
  
  // États pour les équipements
  const [equipments, setEquipments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterOverdue, setFilterOverdue] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    category: "Autre",
    type: "",
    status: "en service",
    location: "",
    dateAcquisition: new Date().toISOString().split("T")[0],
    responsible: "",
    photo: "",
    nextMaintenance: "",
    notes: "",
  });
  const [maintenanceData, setMaintenanceData] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "entretien",
    description: "",
    cost: "",
    technician: "",
    nextMaintenanceDate: "",
  });

  const categories = ["Engin lourd", "Véhicule", "Outillage", "Matériel de sécurité", "Autre"];
  const statuses = ["en service", "en maintenance", "hors service"];
  const maintenanceTypes = ["entretien", "réparation", "inspection"];

  useEffect(() => {
    fetchData();
    fetchEmployees();
  }, [filterCategory, filterStatus, filterOverdue]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterCategory) params.append("category", filterCategory);
      if (filterStatus) params.append("status", filterStatus);
      if (filterOverdue) params.append("overdue", "true");
      if (searchTerm) params.append("search", searchTerm);

      const { data } = await api.get(`/equipements/equipments${params.toString() ? `?${params.toString()}` : ""}`);
      setEquipments(data);
    } catch (error) {
      console.error("Erreur récupération équipements:", error);
      toast.error("Erreur lors du chargement des équipements");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const { data } = await api.get("/rh/employees");
      setEmployees(data || []);
    } catch (error) {
      console.error("Erreur récupération employés:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.name) {
      toast.error("Le code et le nom sont obligatoires");
      return;
    }

    try {
      const submitData = {
        ...formData,
        dateAcquisition: formData.dateAcquisition ? new Date(formData.dateAcquisition).toISOString() : new Date(),
        nextMaintenance: formData.nextMaintenance ? new Date(formData.nextMaintenance).toISOString() : null,
        responsible: formData.responsible || undefined,
      };

      if (editingEquipment) {
        await api.put(`/equipements/equipments/${editingEquipment._id}`, submitData);
        toast.success("Équipement modifié avec succès !");
      } else {
        await api.post("/equipements/equipments", submitData);
        toast.success("Équipement créé avec succès !");
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la sauvegarde");
    }
  };

  const handleEdit = (equipment) => {
    setEditingEquipment(equipment);
    setFormData({
      code: equipment.code || "",
      name: equipment.name || "",
      category: equipment.category || "Autre",
      type: equipment.type || "",
      status: equipment.status || "en service",
      location: equipment.location || "",
      dateAcquisition: equipment.dateAcquisition
        ? new Date(equipment.dateAcquisition).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      responsible: equipment.responsible?._id || equipment.responsible || "",
      photo: equipment.photo || "",
      nextMaintenance: equipment.nextMaintenance
        ? new Date(equipment.nextMaintenance).toISOString().split("T")[0]
        : "",
      notes: equipment.notes || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet équipement ?")) return;
    try {
      await api.delete(`/equipements/equipments/${id}`);
      toast.success("Équipement supprimé avec succès !");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  const handleViewDetails = async (equipment) => {
    try {
      const { data } = await api.get(`/equipements/equipments/${equipment._id}`);
      setSelectedEquipment(data);
      setShowDetailModal(true);
    } catch (error) {
      toast.error("Erreur lors du chargement des détails");
    }
  };

  const handleAddMaintenance = async (e) => {
    e.preventDefault();
    if (!selectedEquipment) return;

    try {
      await api.post(`/equipements/equipments/${selectedEquipment._id}/maintenance`, maintenanceData);
      toast.success("Entretien ajouté avec succès !");
      setShowMaintenanceModal(false);
      setMaintenanceData({
        date: new Date().toISOString().split("T")[0],
        type: "entretien",
        description: "",
        cost: "",
        technician: "",
        nextMaintenanceDate: "",
      });
      handleViewDetails(selectedEquipment);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de l'ajout de l'entretien");
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      category: "Autre",
      type: "",
      status: "en service",
      location: "",
      dateAcquisition: new Date().toISOString().split("T")[0],
      responsible: "",
      photo: "",
      nextMaintenance: "",
      notes: "",
    });
    setEditingEquipment(null);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("fr-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getStatusColor = (status, isOverdue) => {
    if (isOverdue) {
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    }
    switch (status) {
      case "en service":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "en maintenance":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "hors service":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const getStatusIcon = (status, isOverdue) => {
    if (isOverdue) {
      return <FaExclamationTriangle className="inline mr-1" />;
    }
    switch (status) {
      case "en service":
        return <FaCheckCircle className="inline mr-1" />;
      case "en maintenance":
        return <FaClock className="inline mr-1" />;
      case "hors service":
        return <FaTimes className="inline mr-1" />;
      default:
        return null;
    }
  };

  const exportToPDF = () => {
    toast.info("Fonctionnalité d'export PDF à implémenter");
  };

  const exportToExcel = () => {
    toast.info("Fonctionnalité d'export Excel à implémenter");
  };

  const filteredEquipments = equipments.filter((equipment) => {
    const matchesSearch =
      searchTerm === "" ||
      equipment.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipment.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipment.type?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <DashboardLayout role={user?.role}>
      <div className={`p-6 min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
        <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-6 mb-6`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-800"} mb-2`}>
                Gestion des Équipements
              </h1>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Suivi et maintenance du matériel de travaux publics
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
                <FaPlus /> Nouvel équipement
              </button>
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-4`}>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${darkMode ? "bg-green-900" : "bg-green-100"}`}>
                  <FaCheckCircle className={`text-xl ${darkMode ? "text-green-400" : "text-green-600"}`} />
                </div>
                <div>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>En service</p>
                  <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
                    {equipments.filter((e) => e.status === "en service").length}
                  </p>
                </div>
              </div>
            </div>
            <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-4`}>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${darkMode ? "bg-orange-900" : "bg-orange-100"}`}>
                  <FaClock className={`text-xl ${darkMode ? "text-orange-400" : "text-orange-600"}`} />
                </div>
                <div>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>En maintenance</p>
                  <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
                    {equipments.filter((e) => e.status === "en maintenance").length}
                  </p>
                </div>
              </div>
            </div>
            <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-4`}>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${darkMode ? "bg-red-900" : "bg-red-100"}`}>
                  <FaExclamationTriangle className={`text-xl ${darkMode ? "text-red-400" : "text-red-600"}`} />
                </div>
                <div>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>En retard</p>
                  <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
                    {equipments.filter((e) => e.isOverdue).length}
                  </p>
                </div>
              </div>
            </div>
            <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-4`}>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${darkMode ? "bg-blue-900" : "bg-blue-100"}`}>
                  <FaTools className={`text-xl ${darkMode ? "text-blue-400" : "text-blue-600"}`} />
                </div>
                <div>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Total</p>
                  <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
                    {equipments.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Barre de recherche et filtres */}
        <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-6 mb-6`}>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <FaSearch
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                      darkMode ? "text-gray-400" : "text-gray-400"
                    }`}
                  />
                  <input
                    type="text"
                    placeholder="Rechercher par code, nom ou type..."
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
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`flex items-center gap-2 cursor-pointer ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  <input
                    type="checkbox"
                    checked={filterOverdue}
                    onChange={(e) => setFilterOverdue(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  En retard d'entretien
                </label>
              </div>
          </div>
        </div>

        {/* Contenu */}
        {
          loading ? (
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
                        <span className={darkMode ? "text-gray-300" : "text-gray-500"}>Photo</span>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        <span className={darkMode ? "text-gray-300" : "text-gray-500"}>Code</span>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        <span className={darkMode ? "text-gray-300" : "text-gray-500"}>Nom</span>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        <span className={darkMode ? "text-gray-300" : "text-gray-500"}>Catégorie</span>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        <span className={darkMode ? "text-gray-300" : "text-gray-500"}>Statut</span>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        <span className={darkMode ? "text-gray-300" : "text-gray-500"}>Date d'acquisition</span>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        <span className={darkMode ? "text-gray-300" : "text-gray-500"}>Responsable</span>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        <span className={darkMode ? "text-gray-300" : "text-gray-500"}>Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? "divide-gray-700 bg-gray-800" : "divide-gray-200 bg-white"}`}>
                    {filteredEquipments.length === 0 ? (
                      <tr>
                        <td
                          colSpan="8"
                          className={`px-6 py-12 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                        >
                          Aucun équipement trouvé
                        </td>
                      </tr>
                    ) : (
                      filteredEquipments.map((equipment) => (
                        <tr
                          key={equipment._id}
                          className={`hover:${darkMode ? "bg-gray-700" : "bg-gray-50"} transition-colors ${
                            equipment.isOverdue && darkMode
                              ? "bg-red-900/20"
                              : equipment.isOverdue
                              ? "bg-red-50"
                              : ""
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            {equipment.photo ? (
                              <img
                                src={equipment.photo}
                                alt={equipment.name}
                                className="w-12 h-12 rounded-lg object-cover"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.nextSibling.style.display = "flex";
                                }}
                              />
                            ) : null}
                            <div
                              className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                darkMode ? "bg-gray-700" : "bg-gray-200"
                              }`}
                              style={{ display: equipment.photo ? "none" : "flex" }}
                            >
                              <FaImage className={darkMode ? "text-gray-400" : "text-gray-500"} />
                            </div>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                            {equipment.code}
                          </td>
                          <td className={`px-6 py-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
                            <div className="font-medium">{equipment.name}</div>
                            {equipment.type && (
                              <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                {equipment.type}
                              </div>
                            )}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                            {equipment.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center w-fit ${getStatusColor(
                                equipment.status,
                                equipment.isOverdue
                              )}`}
                            >
                              {getStatusIcon(equipment.status, equipment.isOverdue)}
                              {equipment.status}
                            </span>
                            {equipment.isOverdue && (
                              <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                                Retard d'entretien
                              </div>
                            )}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                            {formatDate(equipment.dateAcquisition)}
                          </td>
                          <td className={`px-6 py-4 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                            {equipment.responsible ? (
                              <div>
                                <div>{equipment.responsible.nom} {equipment.responsible.prenom}</div>
                                {equipment.responsible.poste && (
                                  <div className="text-xs text-gray-500">{equipment.responsible.poste}</div>
                                )}
                              </div>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleViewDetails(equipment)}
                                className={`p-2 rounded-lg transition-colors ${
                                  darkMode ? "text-blue-400 hover:bg-gray-700" : "text-blue-600 hover:bg-blue-50"
                                }`}
                                title="Voir détails"
                              >
                                <FaEye />
                              </button>
                              <button
                                onClick={() => handleEdit(equipment)}
                                className={`p-2 rounded-lg transition-colors ${
                                  darkMode ? "text-yellow-400 hover:bg-gray-700" : "text-yellow-600 hover:bg-yellow-50"
                                }`}
                                title="Modifier"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDelete(equipment._id)}
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
          )
        }

        {/* Modal Ajouter/Modifier équipement */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl`}>
              <div
                className={`sticky top-0 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border-b px-6 py-4 flex items-center justify-between`}
              >
                <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
                  {editingEquipment ? "Modifier l'équipement" : "Nouvel équipement"}
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
                      Code équipement *
                    </label>
                    <input
                      type="text"
                      required
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                      }`}
                      placeholder="EQ-001"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Nom *
                    </label>
                    <input
                      type="text"
                      required
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                      }`}
                    />
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
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Type
                    </label>
                    <input
                      type="text"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                      }`}
                      placeholder="Ex: Pelle mécanique"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Statut *
                    </label>
                    <select
                      required
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                      }`}
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Localisation
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                      }`}
                      placeholder="Ex: Chantier A"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Date d'acquisition *
                    </label>
                    <input
                      type="date"
                      required
                      name="dateAcquisition"
                      value={formData.dateAcquisition}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Responsable
                    </label>
                    <select
                      name="responsible"
                      value={formData.responsible}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                      }`}
                    >
                      <option value="">Aucun</option>
                      {employees.map((emp) => (
                        <option key={emp._id} value={emp._id}>
                          {emp.nom} {emp.prenom} - {emp.poste}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Photo (URL)
                    </label>
                    <input
                      type="text"
                      name="photo"
                      value={formData.photo}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                      }`}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Prochain entretien
                    </label>
                    <input
                      type="date"
                      name="nextMaintenance"
                      value={formData.nextMaintenance}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                      }`}
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
                    {editingEquipment ? "Modifier" : "Créer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Détails équipement */}
        {showDetailModal && selectedEquipment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl`}>
              <div
                className={`sticky top-0 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border-b px-6 py-4 flex items-center justify-between`}
              >
                <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
                  Détails de l'équipement
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowMaintenanceModal(true)}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-semibold flex items-center gap-2"
                  >
                    <FaTools /> Ajouter entretien
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      setSelectedEquipment(null);
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      darkMode ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100 text-gray-500"
                    }`}
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                {/* Informations principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    {selectedEquipment.photo ? (
                      <img
                        src={selectedEquipment.photo}
                        alt={selectedEquipment.name}
                        className="w-full h-64 rounded-lg object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-full h-64 rounded-lg flex items-center justify-center ${
                        darkMode ? "bg-gray-700" : "bg-gray-200"
                      }`}
                      style={{ display: selectedEquipment.photo ? "none" : "flex" }}
                    >
                      <FaImage className={`text-4xl ${darkMode ? "text-gray-500" : "text-gray-400"}`} />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className={`text-xl font-bold mb-2 ${darkMode ? "text-white" : "text-gray-800"}`}>
                        {selectedEquipment.name}
                      </h3>
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                        Code: {selectedEquipment.code}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Catégorie</p>
                        <p className={`font-medium ${darkMode ? "text-white" : "text-gray-800"}`}>
                          {selectedEquipment.category}
                        </p>
                      </div>
                      <div>
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Statut</p>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold inline-flex items-center ${getStatusColor(
                            selectedEquipment.status,
                            selectedEquipment.isOverdue
                          )}`}
                        >
                          {getStatusIcon(selectedEquipment.status, selectedEquipment.isOverdue)}
                          {selectedEquipment.status}
                        </span>
                      </div>
                      <div>
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Type</p>
                        <p className={`font-medium ${darkMode ? "text-white" : "text-gray-800"}`}>
                          {selectedEquipment.type || "-"}
                        </p>
                      </div>
                      <div>
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Localisation</p>
                        <p className={`font-medium ${darkMode ? "text-white" : "text-gray-800"}`}>
                          {selectedEquipment.location || "-"}
                        </p>
                      </div>
                      <div>
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Date d'acquisition</p>
                        <p className={`font-medium ${darkMode ? "text-white" : "text-gray-800"}`}>
                          {formatDate(selectedEquipment.dateAcquisition)}
                        </p>
                      </div>
                      <div>
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Responsable</p>
                        <p className={`font-medium ${darkMode ? "text-white" : "text-gray-800"}`}>
                          {selectedEquipment.responsible
                            ? `${selectedEquipment.responsible.nom} ${selectedEquipment.responsible.prenom}`
                            : "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Historique des entretiens */}
                <div>
                  <h3 className={`text-lg font-bold mb-4 ${darkMode ? "text-white" : "text-gray-800"}`}>
                    Historique des entretiens
                  </h3>
                  {selectedEquipment.maintenanceHistory && selectedEquipment.maintenanceHistory.length > 0 ? (
                    <div className="space-y-3">
                      {selectedEquipment.maintenanceHistory
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .map((maintenance, index) => (
                          <div
                            key={index}
                            className={`p-4 rounded-lg border ${darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className={`font-medium ${darkMode ? "text-white" : "text-gray-800"}`}>
                                  {maintenance.type.charAt(0).toUpperCase() + maintenance.type.slice(1)}
                                </p>
                                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                                  {formatDate(maintenance.date)}
                                </p>
                              </div>
                              {maintenance.cost > 0 && (
                                <p className={`font-medium ${darkMode ? "text-green-400" : "text-green-600"}`}>
                                  ${maintenance.cost.toFixed(2)}
                                </p>
                              )}
                            </div>
                            {maintenance.description && (
                              <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                {maintenance.description}
                              </p>
                            )}
                            {maintenance.technician && (
                              <p className={`text-xs mt-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                                Technicien: {maintenance.technician}
                              </p>
                            )}
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className={`text-center py-8 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      Aucun historique d'entretien
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Ajouter entretien */}
        {showMaintenanceModal && selectedEquipment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg w-full max-w-2xl shadow-2xl`}>
              <div
                className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border-b px-6 py-4 flex items-center justify-between`}
              >
                <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
                  Ajouter un entretien
                </h2>
                <button
                  onClick={() => setShowMaintenanceModal(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100 text-gray-500"
                  }`}
                >
                  <FaTimes />
                </button>
              </div>
              <form onSubmit={handleAddMaintenance} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Date *
                    </label>
                    <input
                      type="date"
                      required
                      name="date"
                      value={maintenanceData.date}
                      onChange={(e) => setMaintenanceData({ ...maintenanceData, date: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Type *
                    </label>
                    <select
                      required
                      name="type"
                      value={maintenanceData.type}
                      onChange={(e) => setMaintenanceData({ ...maintenanceData, type: e.target.value })}
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
                      value={maintenanceData.cost}
                      onChange={(e) => setMaintenanceData({ ...maintenanceData, cost: e.target.value })}
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
                      value={maintenanceData.technician}
                      onChange={(e) => setMaintenanceData({ ...maintenanceData, technician: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Prochain entretien
                    </label>
                    <input
                      type="date"
                      name="nextMaintenanceDate"
                      value={maintenanceData.nextMaintenanceDate}
                      onChange={(e) =>
                        setMaintenanceData({ ...maintenanceData, nextMaintenanceDate: e.target.value })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                      }`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={maintenanceData.description}
                    onChange={(e) => setMaintenanceData({ ...maintenanceData, description: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                    }`}
                    rows="3"
                  />
                </div>
                <div className={`flex justify-end gap-3 pt-4 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                  <button
                    type="button"
                    onClick={() => setShowMaintenanceModal(false)}
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
                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold"
                  >
                    Ajouter
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

export default EquipmentListPage;
