import React, { useState, useEffect } from "react";
import { FaPlus, FaBriefcase, FaUsers, FaEnvelope, FaStar, FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { toast } from "react-toastify";
import AppLayout from "../../components/AppLayout";
import { getJobOffers, createJobOffer, deleteJobOffer, getApplications, updateApplicationStatus, sendInterviewInvitation } from "../../services/hrService";

const RecruitmentPage = () => {
  const [activeTab, setActiveTab] = useState("offers");
  const [jobOffers, setJobOffers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const handleTheme = (e) => setDarkMode(e.detail.dark);
    document.addEventListener('erp-theme', handleTheme);
    const saved = localStorage.getItem("erp_sidebar_dark");
    if (saved !== null) setDarkMode(saved === "true");
    return () => document.removeEventListener('erp-theme', handleTheme);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [offersData, applicationsData] = await Promise.all([
        getJobOffers(),
        getApplications()
      ]);
      setJobOffers(offersData);
      setApplications(applicationsData);
    } catch (error) {
      toast.error("Erreur lors du chargement des données");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOffer = async (id) => {
    if (!window.confirm("Supprimer cette offre d'emploi ?")) return;
    try {
      await deleteJobOffer(id);
      toast.success("Offre supprimée");
      fetchData();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleUpdateStatus = async (applicationId, status) => {
    try {
      await updateApplicationStatus(applicationId, status);
      toast.success("Statut mis à jour");
      fetchData();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleSendInvitation = async (applicationId) => {
    const email = prompt("Email du candidat :");
    if (!email) return;

    try {
      await sendInterviewInvitation(applicationId, { 
        email,
        date: new Date().toISOString(),
        message: "Vous êtes invité(e) à un entretien."
      });
      toast.success("Invitation envoyée");
    } catch (error) {
      toast.error("Erreur lors de l'envoi");
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "Nouveau": return "bg-blue-500/20 text-blue-400";
      case "En cours": return "bg-yellow-500/20 text-yellow-400";
      case "Accepté": return "bg-green-500/20 text-green-400";
      case "Refusé": return "bg-red-500/20 text-red-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <AppLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Recrutement
            </h1>
            <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              {jobOffers.length} offre(s) · {applications.length} candidature(s)
            </p>
          </div>
          <button
            onClick={() => setShowOfferModal(true)}
            className="btn btn-primary flex items-center gap-2 px-4 py-2"
          >
            <FaPlus /> Nouvelle offre d'emploi
          </button>
        </div>

        {/* Tabs */}
        <div className={`flex gap-2 mb-6 border-b ${darkMode ? "border-gray-700" : "border-gray-300"}`}>
          <button
            onClick={() => setActiveTab("offers")}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === "offers"
                ? "border-b-2 border-blue-500 text-blue-400"
                : darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <FaBriefcase className="inline mr-2" />
            Offres d'emploi
          </button>
          <button
            onClick={() => setActiveTab("applications")}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === "applications"
                ? "border-b-2 border-blue-500 text-blue-400"
                : darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <FaUsers className="inline mr-2" />
            Candidatures
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : activeTab === "offers" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobOffers.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <FaBriefcase className="mx-auto text-6xl opacity-30 mb-4" />
                <p className="text-xl opacity-70">Aucune offre d'emploi</p>
              </div>
            ) : (
              jobOffers.map((offer) => (
                <div
                  key={offer._id}
                  className={`card p-6 hover:shadow-lg transition-all ${darkMode ? "bg-gray-800" : "bg-white"}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold">{offer.titre}</h3>
                    <div className="flex gap-2">
                      <button className="p-2 rounded hover:bg-blue-500/20 text-blue-400">
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteOffer(offer._id)}
                        className="p-2 rounded hover:bg-red-500/20 text-red-400"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm mb-4">
                    <p><span className="font-medium">Département:</span> {offer.departement}</p>
                    <p><span className="font-medium">Type:</span> {offer.typeContrat}</p>
                    <p><span className="font-medium">Salaire:</span> {offer.salaire} DT</p>
                    <p><span className="font-medium">Date limite:</span> {new Date(offer.dateLimite).toLocaleDateString()}</p>
                  </div>

                  <p className={`text-sm mb-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    {offer.description?.substring(0, 100)}...
                  </p>

                  <div className="flex justify-between items-center">
                    <span className={`text-xs px-3 py-1 rounded-full ${offer.statut === "Actif" ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}>
                      {offer.statut}
                    </span>
                    <button className="text-sm text-blue-400 hover:underline flex items-center gap-1">
                      <FaEye /> Voir détails
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className={`card overflow-hidden ${darkMode ? "bg-gray-800" : "bg-white"}`}>
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Candidat</th>
                    <th>Offre</th>
                    <th>Date</th>
                    <th>Statut</th>
                    <th>Note</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-12">
                        <FaUsers className="mx-auto text-6xl opacity-30 mb-4" />
                        <p className="text-xl opacity-70">Aucune candidature</p>
                      </td>
                    </tr>
                  ) : (
                    applications.map((app) => (
                      <tr key={app._id} className="hover-row">
                        <td>
                          <div>
                            <div className="font-medium">{app.nom} {app.prenom}</div>
                            <div className="text-sm opacity-70">{app.email}</div>
                          </div>
                        </td>
                        <td>{app.offreId?.titre || "N/A"}</td>
                        <td>{new Date(app.datePostulation).toLocaleDateString()}</td>
                        <td>
                          <select
                            value={app.statut}
                            onChange={(e) => handleUpdateStatus(app._id, e.target.value)}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(app.statut)}`}
                          >
                            <option value="Nouveau">Nouveau</option>
                            <option value="En cours">En cours</option>
                            <option value="Accepté">Accepté</option>
                            <option value="Refusé">Refusé</option>
                          </select>
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <FaStar
                                key={star}
                                className={star <= (app.note || 0) ? "text-yellow-400" : "text-gray-600"}
                                size={14}
                              />
                            ))}
                          </div>
                        </td>
                        <td>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSendInvitation(app._id)}
                              className="btn btn-primary text-xs px-3 py-1 flex items-center gap-1"
                            >
                              <FaEnvelope /> Inviter
                            </button>
                            <button className="btn text-xs px-3 py-1">
                              <FaEye /> CV
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

        {/* Modal pour nouvelle offre */}
        {showOfferModal && (
          <JobOfferModal
            onClose={(refresh) => {
              setShowOfferModal(false);
              if (refresh) fetchData();
            }}
          />
        )}
      </div>
    </AppLayout>
  );
};

// Composant Modal pour créer une offre
const JobOfferModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    titre: "",
    departement: "",
    typeContrat: "CDI",
    salaire: "",
    dateLimite: "",
    description: "",
    competences: "",
    statut: "Actif"
  });
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("erp_sidebar_dark");
    if (saved !== null) setDarkMode(saved === "true");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await createJobOffer(formData);
      toast.success("Offre créée avec succès");
      onClose(true);
    } catch (error) {
      toast.error("Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`card w-full max-w-2xl ${darkMode ? "bg-gray-800" : "bg-white"}`}>
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold">Nouvelle offre d'emploi</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Titre du poste *</label>
              <input
                type="text"
                value={formData.titre}
                onChange={(e) => setFormData({...formData, titre: e.target.value})}
                required
                className={`input w-full ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Département</label>
              <input
                type="text"
                value={formData.departement}
                onChange={(e) => setFormData({...formData, departement: e.target.value})}
                className={`input w-full ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Type de contrat</label>
              <select
                value={formData.typeContrat}
                onChange={(e) => setFormData({...formData, typeContrat: e.target.value})}
                className={`input w-full ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
              >
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
                <option value="Stage">Stage</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Salaire (DT)</label>
              <input
                type="number"
                value={formData.salaire}
                onChange={(e) => setFormData({...formData, salaire: e.target.value})}
                className={`input w-full ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Date limite</label>
              <input
                type="date"
                value={formData.dateLimite}
                onChange={(e) => setFormData({...formData, dateLimite: e.target.value})}
                className={`input w-full ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows="4"
                className={`input w-full ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-4 mt-6">
            <button type="button" onClick={() => onClose(false)} className="btn">
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Création..." : "Créer l'offre"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecruitmentPage;

