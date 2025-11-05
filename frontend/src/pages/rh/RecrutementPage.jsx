import React, { useState, useEffect, useContext } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { useTheme } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import { FiPlus, FiEdit, FiTrash2, FiEye, FiSearch, FiFileText, FiCheck, FiX } from "react-icons/fi";

const RecrutementPage = () => {
  const { darkMode } = useTheme();
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("offres");
  const [loading, setLoading] = useState(false);
  
  // États pour les offres d'emploi
  const [offers, setOffers] = useState([]);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [offerFormData, setOfferFormData] = useState({
    titre: "",
    departement: "",
    typeContrat: "CDI",
    salaire: "",
    dateLimite: "",
    description: "",
    competences: "",
    statut: "Actif"
  });
  const [offerSearchTerm, setOfferSearchTerm] = useState("");
  const [offerFilterStatus, setOfferFilterStatus] = useState("");
  const [offerFilterDepartement, setOfferFilterDepartement] = useState("");
  
  // États pour les candidatures
  const [applications, setApplications] = useState([]);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [applicationFormData, setApplicationFormData] = useState({
    statut: "",
    note: ""
  });
  const [applicationSearchTerm, setApplicationSearchTerm] = useState("");
  const [applicationFilterStatus, setApplicationFilterStatus] = useState("");
  const [applicationFilterOffer, setApplicationFilterOffer] = useState("");

  // Charger les offres d'emploi
  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/rh/job-offers");
      setOffers(response.data);
    } catch (error) {
      console.error("Erreur récupération offres:", error);
      toast.error("Erreur lors de la récupération des offres");
    } finally {
      setLoading(false);
    }
  };

  // Charger les candidatures
  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/rh/applications");
      setApplications(response.data);
    } catch (error) {
      console.error("Erreur récupération candidatures:", error);
      toast.error("Erreur lors de la récupération des candidatures");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
    fetchApplications();
  }, []);

  // Gérer les offres d'emploi
  const handleOfferSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingOffer) {
        await axios.put(`/api/rh/job-offers/${editingOffer._id}`, offerFormData);
        toast.success("Offre modifiée avec succès");
      } else {
        await axios.post("/api/rh/job-offers", offerFormData);
        toast.success("Offre créée avec succès");
      }
      fetchOffers();
      resetOfferForm();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la sauvegarde");
    }
  };

  const handleEditOffer = (offer) => {
    setEditingOffer(offer);
    setOfferFormData({
      titre: offer.titre || "",
      departement: offer.departement || "",
      typeContrat: offer.typeContrat || "CDI",
      salaire: offer.salaire || "",
      dateLimite: offer.dateLimite ? offer.dateLimite.split('T')[0] : "",
      description: offer.description || "",
      competences: offer.competences || "",
      statut: offer.statut || "Actif"
    });
    setShowOfferModal(true);
  };

  const handleDeleteOffer = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette offre ?")) return;
    try {
      await axios.delete(`/api/rh/job-offers/${id}`);
      toast.success("Offre supprimée avec succès");
      fetchOffers();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const resetOfferForm = () => {
    setOfferFormData({
      titre: "",
      departement: "",
      typeContrat: "CDI",
      salaire: "",
      dateLimite: "",
      description: "",
      competences: "",
      statut: "Actif"
    });
    setEditingOffer(null);
    setShowOfferModal(false);
  };

  // Gérer les candidatures
  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setApplicationFormData({
      statut: application.statut || "",
      note: application.note || ""
    });
    setShowApplicationModal(true);
  };

  const handleUpdateApplication = async () => {
    try {
      await axios.put(`/api/rh/applications/${selectedApplication._id}`, applicationFormData);
      toast.success("Candidature mise à jour avec succès");
      fetchApplications();
      setShowApplicationModal(false);
      setSelectedApplication(null);
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  // Filtrer les offres
  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.titre?.toLowerCase().includes(offerSearchTerm.toLowerCase()) ||
                         offer.departement?.toLowerCase().includes(offerSearchTerm.toLowerCase());
    const matchesStatus = !offerFilterStatus || offer.statut === offerFilterStatus;
    const matchesDepartement = !offerFilterDepartement || offer.departement === offerFilterDepartement;
    return matchesSearch && matchesStatus && matchesDepartement;
  });

  // Filtrer les candidatures
  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.nom?.toLowerCase().includes(applicationSearchTerm.toLowerCase()) ||
                         app.prenom?.toLowerCase().includes(applicationSearchTerm.toLowerCase()) ||
                         app.email?.toLowerCase().includes(applicationSearchTerm.toLowerCase());
    const matchesStatus = !applicationFilterStatus || app.statut === applicationFilterStatus;
    const matchesOffer = !applicationFilterOffer || app.offreId?._id === applicationFilterOffer;
    return matchesSearch && matchesStatus && matchesOffer;
  });

  // Formater la date
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("fr-CA");
  };

  // Formater le salaire
  const formatSalary = (salary) => {
    if (!salary) return "N/A";
    return new Intl.NumberFormat("fr-CA", { style: "currency", currency: "CAD" }).format(salary);
  };

  // Obtenir la couleur du statut
  const getStatusColor = (status) => {
    const colors = {
      "Actif": "bg-green-100 text-green-800",
      "Fermé": "bg-red-100 text-red-800",
      "Brouillon": "bg-gray-100 text-gray-800",
      "Nouveau": "bg-blue-100 text-blue-800",
      "En cours": "bg-yellow-100 text-yellow-800",
      "Accepté": "bg-green-100 text-green-800",
      "Refusé": "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusColorDark = (status) => {
    const colors = {
      "Actif": "bg-green-900 text-green-200",
      "Fermé": "bg-red-900 text-red-200",
      "Brouillon": "bg-gray-700 text-gray-200",
      "Nouveau": "bg-blue-900 text-blue-200",
      "En cours": "bg-yellow-900 text-yellow-200",
      "Accepté": "bg-green-900 text-green-200",
      "Refusé": "bg-red-900 text-red-200"
    };
    return colors[status] || "bg-gray-700 text-gray-200";
  };

  return (
    <DashboardLayout role={user?.role}>
      <div className={`p-6 min-h-screen ${darkMode ? "text-white bg-gray-900" : "text-gray-800 bg-gray-50"}`}>
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Recrutement</h1>
          <p className={`text-lg ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Gestion des offres d'emploi et des candidatures
          </p>
        </div>

        {/* Onglets */}
        <div className={`mb-6 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab("offres")}
              className={`px-4 py-2 font-medium ${
                activeTab === "offres"
                  ? `border-b-2 ${darkMode ? "border-blue-500 text-blue-400" : "border-blue-600 text-blue-600"}`
                  : `${darkMode ? "text-gray-400" : "text-gray-500"}`
              }`}
            >
              Offres d'emploi
            </button>
            <button
              onClick={() => setActiveTab("candidatures")}
              className={`px-4 py-2 font-medium ${
                activeTab === "candidatures"
                  ? `border-b-2 ${darkMode ? "border-blue-500 text-blue-400" : "border-blue-600 text-blue-600"}`
                  : `${darkMode ? "text-gray-400" : "text-gray-500"}`
              }`}
            >
              Candidatures
            </button>
          </div>
        </div>

        {/* Contenu des onglets */}
        {activeTab === "offres" && (
          <div>
            {/* En-tête avec recherche et bouton */}
            <div className={`mb-6 flex flex-col md:flex-row gap-4 ${darkMode ? "bg-gray-800" : "bg-white"} p-4 rounded-lg shadow`}>
              <div className="flex-1 relative">
                <FiSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
                <input
                  type="text"
                  placeholder="Rechercher une offre..."
                  value={offerSearchTerm}
                  onChange={(e) => setOfferSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
                  }`}
                />
              </div>
              <select
                value={offerFilterStatus}
                onChange={(e) => setOfferFilterStatus(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
                }`}
              >
                <option value="">Tous les statuts</option>
                <option value="Actif">Actif</option>
                <option value="Fermé">Fermé</option>
                <option value="Brouillon">Brouillon</option>
              </select>
              <select
                value={offerFilterDepartement}
                onChange={(e) => setOfferFilterDepartement(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
                }`}
              >
                <option value="">Tous les départements</option>
                {[...new Set(offers.map(o => o.departement).filter(Boolean))].map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <button
                onClick={() => setShowOfferModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <FiPlus /> Nouvelle offre
              </button>
            </div>

            {/* Liste des offres */}
            {loading ? (
              <div className="text-center py-8">Chargement...</div>
            ) : filteredOffers.length === 0 ? (
              <div className={`text-center py-8 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Aucune offre trouvée
              </div>
            ) : (
              <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Titre</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Département</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Salaire</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date limite</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Statut</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredOffers.map((offer) => (
                        <tr key={offer._id}>
                          <td className="px-6 py-4 whitespace-nowrap">{offer.titre}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{offer.departement || "N/A"}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{offer.typeContrat}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{formatSalary(offer.salaire)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{formatDate(offer.dateLimite)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs ${darkMode ? getStatusColorDark(offer.statut) : getStatusColor(offer.statut)}`}>
                              {offer.statut}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditOffer(offer)}
                                className={`p-2 rounded ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                              >
                                <FiEdit className={darkMode ? "text-blue-400" : "text-blue-600"} />
                              </button>
                              <button
                                onClick={() => handleDeleteOffer(offer._id)}
                                className={`p-2 rounded ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                              >
                                <FiTrash2 className={darkMode ? "text-red-400" : "text-red-600"} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "candidatures" && (
          <div>
            {/* En-tête avec recherche et filtres */}
            <div className={`mb-6 flex flex-col md:flex-row gap-4 ${darkMode ? "bg-gray-800" : "bg-white"} p-4 rounded-lg shadow`}>
              <div className="flex-1 relative">
                <FiSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
                <input
                  type="text"
                  placeholder="Rechercher une candidature..."
                  value={applicationSearchTerm}
                  onChange={(e) => setApplicationSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
                  }`}
                />
              </div>
              <select
                value={applicationFilterStatus}
                onChange={(e) => setApplicationFilterStatus(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
                }`}
              >
                <option value="">Tous les statuts</option>
                <option value="Nouveau">Nouveau</option>
                <option value="En cours">En cours</option>
                <option value="Accepté">Accepté</option>
                <option value="Refusé">Refusé</option>
              </select>
              <select
                value={applicationFilterOffer}
                onChange={(e) => setApplicationFilterOffer(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
                }`}
              >
                <option value="">Toutes les offres</option>
                {offers.map(offer => (
                  <option key={offer._id} value={offer._id}>{offer.titre}</option>
                ))}
              </select>
            </div>

            {/* Liste des candidatures */}
            {loading ? (
              <div className="text-center py-8">Chargement...</div>
            ) : filteredApplications.length === 0 ? (
              <div className={`text-center py-8 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Aucune candidature trouvée
              </div>
            ) : (
              <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Candidat</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Offre</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Statut</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Note</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredApplications.map((app) => (
                        <tr key={app._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {app.prenom} {app.nom}
                            <br />
                            <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{app.email}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{app.offreId?.titre || "N/A"}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{formatDate(app.datePostulation)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs ${darkMode ? getStatusColorDark(app.statut) : getStatusColor(app.statut)}`}>
                              {app.statut}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {app.note ? "⭐".repeat(app.note) : "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleViewApplication(app)}
                              className={`p-2 rounded ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                            >
                              <FiEye className={darkMode ? "text-blue-400" : "text-blue-600"} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Offre d'emploi */}
        {showOfferModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
              <h2 className="text-2xl font-bold mb-4">{editingOffer ? "Modifier l'offre" : "Nouvelle offre"}</h2>
              <form onSubmit={handleOfferSubmit} className="space-y-4">
                <div>
                  <label className="block mb-2 font-medium">Titre *</label>
                  <input
                    type="text"
                    required
                    value={offerFormData.titre}
                    onChange={(e) => setOfferFormData({ ...offerFormData, titre: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
                    }`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-medium">Département</label>
                    <input
                      type="text"
                      value={offerFormData.departement}
                      onChange={(e) => setOfferFormData({ ...offerFormData, departement: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium">Type de contrat</label>
                    <select
                      value={offerFormData.typeContrat}
                      onChange={(e) => setOfferFormData({ ...offerFormData, typeContrat: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
                      }`}
                    >
                      <option value="CDI">CDI</option>
                      <option value="CDD">CDD</option>
                      <option value="Stage">Stage</option>
                      <option value="Freelance">Freelance</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-medium">Salaire (CAD)</label>
                    <input
                      type="number"
                      value={offerFormData.salaire}
                      onChange={(e) => setOfferFormData({ ...offerFormData, salaire: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium">Date limite</label>
                    <input
                      type="date"
                      value={offerFormData.dateLimite}
                      onChange={(e) => setOfferFormData({ ...offerFormData, dateLimite: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
                      }`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block mb-2 font-medium">Description</label>
                  <textarea
                    value={offerFormData.description}
                    onChange={(e) => setOfferFormData({ ...offerFormData, description: e.target.value })}
                    rows={4}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
                    }`}
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium">Compétences</label>
                  <textarea
                    value={offerFormData.competences}
                    onChange={(e) => setOfferFormData({ ...offerFormData, competences: e.target.value })}
                    rows={3}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
                    }`}
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium">Statut</label>
                  <select
                    value={offerFormData.statut}
                    onChange={(e) => setOfferFormData({ ...offerFormData, statut: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
                    }`}
                  >
                    <option value="Actif">Actif</option>
                    <option value="Fermé">Fermé</option>
                    <option value="Brouillon">Brouillon</option>
                  </select>
                </div>
                <div className="flex gap-4 justify-end">
                  <button
                    type="button"
                    onClick={resetOfferForm}
                    className={`px-4 py-2 rounded-lg ${darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"}`}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingOffer ? "Modifier" : "Créer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Candidature */}
        {showApplicationModal && selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
              <h2 className="text-2xl font-bold mb-4">Détails de la candidature</h2>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 font-medium">Candidat</label>
                  <p className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    {selectedApplication.prenom} {selectedApplication.nom}
                  </p>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    {selectedApplication.email} {selectedApplication.telephone && `• ${selectedApplication.telephone}`}
                  </p>
                </div>
                <div>
                  <label className="block mb-2 font-medium">Offre</label>
                  <p className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    {selectedApplication.offreId?.titre || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block mb-2 font-medium">Date de postulation</label>
                  <p className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    {formatDate(selectedApplication.datePostulation)}
                  </p>
                </div>
                {selectedApplication.lettreMotivation && (
                  <div>
                    <label className="block mb-2 font-medium">Lettre de motivation</label>
                    <p className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      {selectedApplication.lettreMotivation}
                    </p>
                  </div>
                )}
                <div>
                  <label className="block mb-2 font-medium">Statut</label>
                  <select
                    value={applicationFormData.statut}
                    onChange={(e) => setApplicationFormData({ ...applicationFormData, statut: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
                    }`}
                  >
                    <option value="Nouveau">Nouveau</option>
                    <option value="En cours">En cours</option>
                    <option value="Accepté">Accepté</option>
                    <option value="Refusé">Refusé</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2 font-medium">Note (0-5)</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={applicationFormData.note}
                    onChange={(e) => setApplicationFormData({ ...applicationFormData, note: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
                    }`}
                  />
                </div>
                <div className="flex gap-4 justify-end">
                  <button
                    onClick={() => {
                      setShowApplicationModal(false);
                      setSelectedApplication(null);
                    }}
                    className={`px-4 py-2 rounded-lg ${darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"}`}
                  >
                    Fermer
                  </button>
                  <button
                    onClick={handleUpdateApplication}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Mettre à jour
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

export default RecrutementPage;
