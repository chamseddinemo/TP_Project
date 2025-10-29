import React, { useState, useEffect } from "react";
import { FaTimes, FaSave, FaUser, FaBriefcase, FaEnvelope, FaPhone, FaCalendar, FaMoneyBillWave } from "react-icons/fa";
import { toast } from "react-toastify";
import { addEmployee, updateEmployee } from "../../services/hrService";

const EmployeeModal = ({ employee, onClose }) => {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    poste: "",
    service: "",
    salaire: "",
    dateEmbauche: "",
    photo: "",
    adresse: "",
    cin: "",
    numeroSecuriteSociale: "",
    situationFamiliale: "Célibataire",
    nombreEnfants: 0,
  });

  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const handleTheme = (e) => setDarkMode(e.detail.dark);
    document.addEventListener('erp-theme', handleTheme);
    const saved = localStorage.getItem("erp_sidebar_dark");
    if (saved !== null) setDarkMode(saved === "true");
    return () => document.removeEventListener('erp-theme', handleTheme);
  }, []);

  useEffect(() => {
    if (employee) {
      setFormData({
        nom: employee.nom || "",
        prenom: employee.prenom || "",
        email: employee.email || "",
        telephone: employee.telephone || "",
        poste: employee.poste || "",
        service: employee.service || "",
        salaire: employee.salaire || "",
        dateEmbauche: employee.dateEmbauche ? new Date(employee.dateEmbauche).toISOString().split('T')[0] : "",
        photo: employee.photo || "",
        adresse: employee.adresse || "",
        cin: employee.cin || "",
        numeroSecuriteSociale: employee.numeroSecuriteSociale || "",
        situationFamiliale: employee.situationFamiliale || "Célibataire",
        nombreEnfants: employee.nombreEnfants || 0,
      });
    }
  }, [employee]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.nom || !formData.prenom || !formData.email || !formData.poste) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      setLoading(true);
      if (employee) {
        await updateEmployee(employee._id, formData);
        toast.success("Employé mis à jour avec succès");
      } else {
        await addEmployee(formData);
        toast.success("Employé ajouté avec succès");
      }
      onClose(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de l'enregistrement");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`card w-full max-w-4xl max-h-[90vh] overflow-y-auto ${darkMode ? "bg-gray-800" : "bg-white"}`}>
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            {employee ? "Modifier l'employé" : "Nouvel employé"}
          </h2>
          <button
            onClick={() => onClose(false)}
            className={`p-2 rounded-full hover:bg-gray-700 transition-all ${darkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informations personnelles */}
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaUser className="text-blue-400" />
                Informations personnelles
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
                className={`input w-full ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
                placeholder="Nom de famille"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Prénom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                required
                className={`input w-full ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
                placeholder="Prénom"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <FaEnvelope className="text-blue-400" />
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={`input w-full ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
                placeholder="email@exemple.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <FaPhone className="text-blue-400" />
                Téléphone
              </label>
              <input
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                className={`input w-full ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
                placeholder="+216 XX XXX XXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">CIN</label>
              <input
                type="text"
                name="cin"
                value={formData.cin}
                onChange={handleChange}
                className={`input w-full ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
                placeholder="Numéro CIN"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Sécurité Sociale</label>
              <input
                type="text"
                name="numeroSecuriteSociale"
                value={formData.numeroSecuriteSociale}
                onChange={handleChange}
                className={`input w-full ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
                placeholder="Numéro de sécurité sociale"
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium mb-2">Adresse</label>
              <textarea
                name="adresse"
                value={formData.adresse}
                onChange={handleChange}
                rows="2"
                className={`input w-full ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
                placeholder="Adresse complète"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Situation Familiale</label>
              <select
                name="situationFamiliale"
                value={formData.situationFamiliale}
                onChange={handleChange}
                className={`input w-full ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
              >
                <option value="Célibataire">Célibataire</option>
                <option value="Marié(e)">Marié(e)</option>
                <option value="Divorcé(e)">Divorcé(e)</option>
                <option value="Veuf(ve)">Veuf(ve)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Nombre d'enfants</label>
              <input
                type="number"
                name="nombreEnfants"
                value={formData.nombreEnfants}
                onChange={handleChange}
                min="0"
                className={`input w-full ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
              />
            </div>

            {/* Informations professionnelles */}
            <div className="col-span-1 md:col-span-2 mt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaBriefcase className="text-purple-400" />
                Informations professionnelles
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Poste <span className="text-red-500">*</span>
              </label>
              <select
                name="poste"
                value={formData.poste}
                onChange={handleChange}
                required
                className={`input w-full ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
              >
                <option value="">Sélectionner un poste</option>
                <option value="Ingénieur">Ingénieur</option>
                <option value="Chef de chantier">Chef de chantier</option>
                <option value="Conducteur de travaux">Conducteur de travaux</option>
                <option value="Technicien">Technicien</option>
                <option value="Ouvrier qualifié">Ouvrier qualifié</option>
                <option value="Ouvrier">Ouvrier</option>
                <option value="Comptable">Comptable</option>
                <option value="RH">RH</option>
                <option value="Commercial">Commercial</option>
                <option value="Magasinier">Magasinier</option>
                <option value="Chauffeur">Chauffeur</option>
                <option value="Secrétaire">Secrétaire</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Service</label>
              <select
                name="service"
                value={formData.service}
                onChange={handleChange}
                className={`input w-full ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
              >
                <option value="">Sélectionner un service</option>
                <option value="Direction">Direction</option>
                <option value="Technique">Technique</option>
                <option value="Commercial">Commercial</option>
                <option value="Finance">Finance</option>
                <option value="RH">RH</option>
                <option value="Logistique">Logistique</option>
                <option value="Production">Production</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <FaMoneyBillWave className="text-green-400" />
                Salaire (DT)
              </label>
              <input
                type="number"
                name="salaire"
                value={formData.salaire}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`input w-full ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <FaCalendar className="text-orange-400" />
                Date d'embauche
              </label>
              <input
                type="date"
                name="dateEmbauche"
                value={formData.dateEmbauche}
                onChange={handleChange}
                className={`input w-full ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium mb-2">URL Photo</label>
              <input
                type="url"
                name="photo"
                value={formData.photo}
                onChange={handleChange}
                className={`input w-full ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
                placeholder="https://exemple.com/photo.jpg"
              />
              {formData.photo && (
                <img src={formData.photo} alt="Preview" className="mt-2 w-20 h-20 rounded-full object-cover" />
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="btn px-6 py-2"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary px-6 py-2 flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Enregistrement...
                </>
              ) : (
                <>
                  <FaSave />
                  {employee ? "Mettre à jour" : "Créer"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeModal;

