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
  FaUser,
  FaPhone,
  FaEnvelope,
  FaBriefcase,
  FaBuilding,
  FaDollarSign,
  FaCalendar,
  FaMapMarkerAlt,
  FaIdCard,
  FaFileAlt,
  FaUpload,
  FaDownload,
  FaTimes,
  FaImage,
  FaFilter,
} from "react-icons/fa";

const EmployeesPage = () => {
  const { user } = useContext(AuthContext);
  const { darkMode } = useTheme();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPoste, setFilterPoste] = useState("");
  const [filterService, setFilterService] = useState("");
  const [viewMode, setViewMode] = useState("table"); // "table" ou "cards"
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    poste: "",
    service: "",
    salaire: "",
    dateEmbauche: "",
    adresse: "",
    cin: "",
    numeroSecuriteSociale: "",
    situationFamiliale: "Célibataire",
    nombreEnfants: 0,
    statut: "Actif",
    photo: null,
  });
  const [documents, setDocuments] = useState({});
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/rh/employees");
      setEmployees(data);
    } catch (error) {
      console.error("Erreur récupération employés:", error);
      toast.error("Erreur lors du chargement des employés");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = { ...formData };
      
      // Si une photo est sélectionnée, convertir en base64 (simulation)
      if (formData.photo && typeof formData.photo === 'object') {
        // En production, il faudrait uploader le fichier vers un serveur
        submitData.photo = URL.createObjectURL(formData.photo);
      }

      if (editingEmployee) {
        await api.put(`/rh/employees/${editingEmployee._id}`, submitData);
        toast.success("Employé modifié avec succès !");
      } else {
        await api.post("/rh/employees", submitData);
        toast.success("Employé ajouté avec succès !");
      }
      setShowModal(false);
      resetForm();
      fetchEmployees();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la sauvegarde");
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      nom: employee.nom || "",
      prenom: employee.prenom || "",
      email: employee.email || "",
      telephone: employee.telephone || "",
      poste: employee.poste || "",
      service: employee.service || "",
      salaire: employee.salaire || "",
      dateEmbauche: employee.dateEmbauche ? new Date(employee.dateEmbauche).toISOString().split('T')[0] : "",
      adresse: employee.adresse || "",
      cin: employee.cin || "",
      numeroSecuriteSociale: employee.numeroSecuriteSociale || "",
      situationFamiliale: employee.situationFamiliale || "Célibataire",
      nombreEnfants: employee.nombreEnfants || 0,
      statut: employee.statut || "Actif",
      photo: null,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet employé ?")) return;
    try {
      await api.delete(`/rh/employees/${id}`);
      toast.success("Employé supprimé avec succès !");
      fetchEmployees();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  const handleViewDetails = (employee) => {
    setSelectedEmployee(employee);
    setShowDetailModal(true);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("La photo ne doit pas dépasser 5 MB");
        return;
      }
      setFormData({ ...formData, photo: file });
    }
  };

  const resetForm = () => {
    setFormData({
      nom: "",
      prenom: "",
      email: "",
      telephone: "",
      poste: "",
      service: "",
      salaire: "",
      dateEmbauche: "",
      adresse: "",
      cin: "",
      numeroSecuriteSociale: "",
      situationFamiliale: "Célibataire",
      nombreEnfants: 0,
      statut: "Actif",
      photo: null,
    });
    setEditingEmployee(null);
  };

  // Obtenir les postes et services uniques pour les filtres
  const uniquePostes = [...new Set(employees.map(emp => emp.poste).filter(Boolean))];
  const uniqueServices = [...new Set(employees.map(emp => emp.service).filter(Boolean))];

  // Filtrer les employés
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = `${emp.nom} ${emp.prenom} ${emp.email} ${emp.poste} ${emp.service || ""}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPoste = !filterPoste || emp.poste === filterPoste;
    const matchesService = !filterService || emp.service === filterService;
    return matchesSearch && matchesPoste && matchesService;
  });

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("fr-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getStatusColor = (statut) => {
    switch (statut) {
      case "Actif":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Inactif":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
      case "Congé":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Démission":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout role={user?.role}>
      <div className={`p-6 min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* En-tête */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 mb-6`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>
                Gestion des Employés
              </h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {filteredEmployees.length} employé{filteredEmployees.length > 1 ? 's' : ''} trouvé{filteredEmployees.length > 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => { resetForm(); setShowModal(true); }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-semibold transition-colors shadow-md hover:shadow-lg"
            >
              <FaPlus /> Ajouter un employé
            </button>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 mb-6`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Recherche */}
            <div className="md:col-span-2">
              <div className="relative">
                <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                <input
                  type="text"
                  placeholder="Rechercher par nom, email, poste ou service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-800'
                  }`}
                />
              </div>
            </div>

            {/* Filtre Poste */}
            <div>
              <div className="relative">
                <FaFilter className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                <select
                  value={filterPoste}
                  onChange={(e) => setFilterPoste(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                  }`}
                >
                  <option value="">Tous les postes</option>
                  {uniquePostes.map(poste => (
                    <option key={poste} value={poste}>{poste}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filtre Service */}
            <div>
              <select
                value={filterService}
                onChange={(e) => setFilterService(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                }`}
              >
                <option value="">Tous les services</option>
                {uniqueServices.map(service => (
                  <option key={service} value={service}>{service}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Toggle vue */}
          <div className="flex items-center gap-4 mt-4">
            <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Vue :</span>
            <button
              onClick={() => setViewMode("table")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === "table"
                  ? "bg-blue-600 text-white"
                  : darkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Tableau
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === "cards"
                  ? "bg-blue-600 text-white"
                  : darkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Cartes
            </button>
          </div>
        </div>

        {/* Contenu */}
        {loading ? (
          <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4">Chargement des employés...</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-12 text-center`}>
            <FaUser className={`text-6xl mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
            <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Aucun employé trouvé
            </h3>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              {searchTerm || filterPoste || filterService
                ? "Aucun employé ne correspond à vos critères de recherche."
                : "Commencez par ajouter un nouvel employé."}
            </p>
          </div>
        ) : viewMode === "table" ? (
          /* Vue Tableau */
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-500'}>Photo</span>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-500'}>Nom</span>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-500'}>Contact</span>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-500'}>Poste</span>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-500'}>Service</span>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-500'}>Salaire</span>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-500'}>Statut</span>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-500'}>Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'}`}>
                  {filteredEmployees.map((employee) => (
                    <tr key={employee._id} className={`hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="shrink-0 h-10 w-10">
                          {employee.photo ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={employee.photo}
                              alt={`${employee.prenom} ${employee.nom}`}
                            />
                          ) : (
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                              <FaUser className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        <div className="font-medium">{employee.prenom} {employee.nom}</div>
                        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{employee.email}</div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        {employee.telephone || "-"}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        {employee.poste}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        {employee.service || "-"}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        {employee.salaire ? `${employee.salaire.toLocaleString('fr-CA')} $` : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(employee.statut)}`}>
                          {employee.statut}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(employee)}
                            className={`p-2 rounded-lg transition-colors ${darkMode ? 'text-blue-400 hover:bg-gray-700' : 'text-blue-600 hover:bg-blue-50'}`}
                            title="Voir détails"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => handleEdit(employee)}
                            className={`p-2 rounded-lg transition-colors ${darkMode ? 'text-green-400 hover:bg-gray-700' : 'text-green-600 hover:bg-green-50'}`}
                            title="Modifier"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(employee._id)}
                            className={`p-2 rounded-lg transition-colors ${darkMode ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-red-50'}`}
                            title="Supprimer"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Vue Cartes */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEmployees.map((employee) => (
              <div
                key={employee._id}
                className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-md border overflow-hidden hover:shadow-lg transition-shadow`}
              >
                <div className={`p-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-4">
                    <div className="shrink-0">
                      {employee.photo ? (
                        <img
                          className="h-16 w-16 rounded-full object-cover border-2 border-white"
                          src={employee.photo}
                          alt={`${employee.prenom} ${employee.nom}`}
                        />
                      ) : (
                        <div className={`h-16 w-16 rounded-full flex items-center justify-center ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}>
                          <FaUser className={`text-2xl ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold text-lg truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {employee.prenom} {employee.nom}
                      </h3>
                      <p className={`text-sm truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{employee.poste}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <FaEnvelope className={darkMode ? 'text-gray-400' : 'text-gray-400'} />
                    <span className={`truncate ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{employee.email}</span>
                  </div>
                  {employee.telephone && (
                    <div className="flex items-center gap-2 text-sm">
                      <FaPhone className={darkMode ? 'text-gray-400' : 'text-gray-400'} />
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{employee.telephone}</span>
                    </div>
                  )}
                  {employee.service && (
                    <div className="flex items-center gap-2 text-sm">
                      <FaBuilding className={darkMode ? 'text-gray-400' : 'text-gray-400'} />
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{employee.service}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(employee.statut)}`}>
                      {employee.statut}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => handleViewDetails(employee)}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                      }`}
                    >
                      <FaEye className="inline mr-1" /> Détails
                    </button>
                    <button
                      onClick={() => handleEdit(employee)}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                        darkMode ? 'text-green-400 hover:bg-gray-700' : 'text-green-600 hover:bg-green-50'
                      }`}
                      title="Modifier"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(employee._id)}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                        darkMode ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-red-50'
                      }`}
                      title="Supprimer"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Formulaire */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl`}>
              <div className={`sticky top-0 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4 flex items-center justify-between`}>
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {editingEmployee ? "Modifier l'employé" : "Nouvel employé"}
                </h2>
                <button
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-500'}`}
                >
                  <FaTimes />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Photo de profil */}
                <div className="flex items-center gap-6">
                  <div className="shrink-0">
                    {formData.photo ? (
                      <img
                        src={typeof formData.photo === 'object' ? URL.createObjectURL(formData.photo) : formData.photo}
                        alt="Photo de profil"
                        className="h-24 w-24 rounded-full object-cover border-4 border-blue-500"
                      />
                    ) : editingEmployee?.photo ? (
                      <img
                        src={editingEmployee.photo}
                        alt="Photo de profil"
                        className="h-24 w-24 rounded-full object-cover border-4 border-blue-500"
                      />
                    ) : (
                      <div className="h-24 w-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <FaImage className="text-3xl text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Photo de profil
                    </label>
                    <label className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer transition-colors ${
                      darkMode ? 'border-gray-600 hover:bg-gray-700 text-gray-300' : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                    }`}>
                      <FaUpload /> Choisir une photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </label>
                    <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Formats acceptés: JPG, PNG (max 5 MB)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Nom * <FaUser className="inline text-xs" />
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Prénom * <FaUser className="inline text-xs" />
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.prenom}
                      onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Email * <FaEnvelope className="inline text-xs" />
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Téléphone <FaPhone className="inline text-xs" />
                    </label>
                    <input
                      type="tel"
                      placeholder="(514) 123-4567"
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Poste * <FaBriefcase className="inline text-xs" />
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.poste}
                      onChange={(e) => setFormData({ ...formData, poste: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Service <FaBuilding className="inline text-xs" />
                    </label>
                    <input
                      type="text"
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Salaire ($ CAD) <FaDollarSign className="inline text-xs" />
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.salaire}
                      onChange={(e) => setFormData({ ...formData, salaire: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Date d'embauche <FaCalendar className="inline text-xs" />
                    </label>
                    <input
                      type="date"
                      value={formData.dateEmbauche}
                      onChange={(e) => setFormData({ ...formData, dateEmbauche: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      CIN <FaIdCard className="inline text-xs" />
                    </label>
                    <input
                      type="text"
                      value={formData.cin}
                      onChange={(e) => setFormData({ ...formData, cin: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      N° Sécurité Sociale
                    </label>
                    <input
                      type="text"
                      value={formData.numeroSecuriteSociale}
                      onChange={(e) => setFormData({ ...formData, numeroSecuriteSociale: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Situation familiale
                    </label>
                    <select
                      value={formData.situationFamiliale}
                      onChange={(e) => setFormData({ ...formData, situationFamiliale: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                      }`}
                    >
                      <option>Célibataire</option>
                      <option>Marié(e)</option>
                      <option>Divorcé(e)</option>
                      <option>Veuf(ve)</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Nombre d'enfants
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.nombreEnfants}
                      onChange={(e) => setFormData({ ...formData, nombreEnfants: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Statut
                    </label>
                    <select
                      value={formData.statut}
                      onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                      }`}
                    >
                      <option>Actif</option>
                      <option>Inactif</option>
                      <option>Congé</option>
                      <option>Démission</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Adresse <FaMapMarkerAlt className="inline text-xs" />
                  </label>
                  <textarea
                    value={formData.adresse}
                    onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                    rows="2"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                    }`}
                  />
                </div>
                <div className={`flex justify-end gap-3 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); resetForm(); }}
                    className={`px-6 py-2 border rounded-lg transition-colors ${
                      darkMode ? 'border-gray-600 hover:bg-gray-700 text-gray-300' : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    {editingEmployee ? "Modifier" : "Créer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Détails Employé */}
        {showDetailModal && selectedEmployee && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl`}>
              <div className={`sticky top-0 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4 flex items-center justify-between`}>
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Détails de l'employé
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-500'}`}
                >
                  <FaTimes />
                </button>
              </div>
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6 mb-6">
                  <div className="shrink-0">
                    {selectedEmployee.photo ? (
                      <img
                        src={selectedEmployee.photo}
                        alt={`${selectedEmployee.prenom} ${selectedEmployee.nom}`}
                        className="h-32 w-32 rounded-full object-cover border-4 border-blue-500"
                      />
                    ) : (
                      <div className="h-32 w-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <FaUser className="text-5xl text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {selectedEmployee.prenom} {selectedEmployee.nom}
                    </h3>
                    <p className={`text-lg mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{selectedEmployee.poste}</p>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedEmployee.statut)}`}>
                      {selectedEmployee.statut}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      Informations personnelles
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <FaEnvelope className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{selectedEmployee.email}</span>
                      </div>
                      {selectedEmployee.telephone && (
                        <div className="flex items-center gap-2">
                          <FaPhone className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                          <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{selectedEmployee.telephone}</span>
                        </div>
                      )}
                      {selectedEmployee.adresse && (
                        <div className="flex items-start gap-2">
                          <FaMapMarkerAlt className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                          <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{selectedEmployee.adresse}</span>
                        </div>
                      )}
                      {selectedEmployee.cin && (
                        <div className="flex items-center gap-2">
                          <FaIdCard className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                          <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>CIN: {selectedEmployee.cin}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      Informations professionnelles
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <FaBuilding className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                          Service: {selectedEmployee.service || "-"}
                        </span>
                      </div>
                      {selectedEmployee.salaire && (
                        <div className="flex items-center gap-2">
                          <FaDollarSign className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                          <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                            {selectedEmployee.salaire.toLocaleString('fr-CA')} $ CAD
                          </span>
                        </div>
                      )}
                      {selectedEmployee.dateEmbauche && (
                        <div className="flex items-center gap-2">
                          <FaCalendar className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                          <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                            Embauché le: {formatDate(selectedEmployee.dateEmbauche)}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <FaUser className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                          {selectedEmployee.situationFamiliale}, {selectedEmployee.nombreEnfants} enfant{selectedEmployee.nombreEnfants > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section Documents */}
                <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      <FaFileAlt className="inline mr-2" />
                      Documents associés
                    </h4>
                    <button
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                      }`}
                    >
                      <FaUpload className="inline mr-1" /> Ajouter un document
                    </button>
                  </div>
                  {documents[selectedEmployee._id] && documents[selectedEmployee._id].length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {documents[selectedEmployee._id].map((doc, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border flex items-center justify-between ${
                            darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <FaFileAlt className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                            <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{doc.name}</span>
                          </div>
                          <button
                            className={`p-2 rounded-lg transition-colors ${
                              darkMode ? 'text-blue-400 hover:bg-gray-700' : 'text-blue-600 hover:bg-blue-50'
                            }`}
                          >
                            <FaDownload />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-center py-4`}>
                      Aucun document associé pour le moment
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => { setShowDetailModal(false); handleEdit(selectedEmployee); }}
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

export default EmployeesPage;
