import React, { useState, useEffect } from "react";
import { FaSearch, FaPlus, FaEdit, FaTrash, FaFileAlt, FaHistory, FaFilter, FaDownload, FaUser } from "react-icons/fa";
import { toast } from "react-toastify";
import AppLayout from "../../components/AppLayout";
import { getEmployees, deleteEmployee } from "../../services/hrService";
import EmployeeModal from "../../components/rh/EmployeeModal";

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filtres
  const [filters, setFilters] = useState({
    poste: "",
    service: "",
    anciennete: ""
  });

  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const handleTheme = (e) => setDarkMode(e.detail.dark);
    document.addEventListener('erp-theme', handleTheme);
    const saved = localStorage.getItem("erp_sidebar_dark");
    if (saved !== null) setDarkMode(saved === "true");
    return () => document.removeEventListener('erp-theme', handleTheme);
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [employees, searchQuery, filters]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await getEmployees();
      setEmployees(data);
    } catch (error) {
      toast.error("Erreur lors du chargement des employés");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...employees];

    // Recherche
    if (searchQuery) {
      filtered = filtered.filter(emp => 
        emp.nom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.prenom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.poste?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtre par poste
    if (filters.poste) {
      filtered = filtered.filter(emp => emp.poste === filters.poste);
    }

    // Filtre par service
    if (filters.service) {
      filtered = filtered.filter(emp => emp.service === filters.service);
    }

    // Filtre par ancienneté
    if (filters.anciennete) {
      const now = new Date();
      filtered = filtered.filter(emp => {
        const hireDate = new Date(emp.dateEmbauche);
        const yearsWorked = (now - hireDate) / (1000 * 60 * 60 * 24 * 365);
        
        switch(filters.anciennete) {
          case "moins-1":
            return yearsWorked < 1;
          case "1-3":
            return yearsWorked >= 1 && yearsWorked < 3;
          case "3-5":
            return yearsWorked >= 3 && yearsWorked < 5;
          case "plus-5":
            return yearsWorked >= 5;
          default:
            return true;
        }
      });
    }

    setFilteredEmployees(filtered);
  };

  const handleAdd = () => {
    setSelectedEmployee(null);
    setShowModal(true);
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet employé ?")) return;
    
    try {
      await deleteEmployee(id);
      toast.success("Employé supprimé avec succès");
      fetchEmployees();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
      console.error(error);
    }
  };

  const handleModalClose = (refresh) => {
    setShowModal(false);
    setSelectedEmployee(null);
    if (refresh) fetchEmployees();
  };

  const resetFilters = () => {
    setFilters({ poste: "", service: "", anciennete: "" });
    setSearchQuery("");
  };

  const exportToCSV = () => {
    const headers = ["Nom", "Prénom", "Poste", "Service", "Salaire", "Date d'embauche", "Email", "Téléphone"];
    const rows = filteredEmployees.map(emp => [
      emp.nom,
      emp.prenom,
      emp.poste,
      emp.service,
      emp.salaire,
      new Date(emp.dateEmbauche).toLocaleDateString(),
      emp.email,
      emp.telephone
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(";")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `employes_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const postes = [...new Set(employees.map(e => e.poste).filter(Boolean))];
  const services = [...new Set(employees.map(e => e.service).filter(Boolean))];

  return (
    <AppLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Gestion des Employés
            </h1>
            <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              {filteredEmployees.length} employé(s) sur {employees.length}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={exportToCSV}
              className="btn flex items-center gap-2 px-4 py-2"
            >
              <FaDownload /> Exporter CSV
            </button>
            <button
              onClick={handleAdd}
              className="btn btn-primary flex items-center gap-2 px-4 py-2"
            >
              <FaPlus /> Nouvel Employé
            </button>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className={`card p-4 mb-6 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1 relative">
              <FaSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
              <input
                type="text"
                placeholder="Rechercher par nom, prénom, poste..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`input w-full pl-10 ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
              />
            </div>

            {/* Bouton filtres */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn flex items-center gap-2 px-4 ${showFilters ? "btn-primary" : ""}`}
            >
              <FaFilter /> Filtres
            </button>
          </div>

          {/* Panneau de filtres */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-600">
              <div>
                <label className="block text-sm font-medium mb-2">Poste</label>
                <select
                  value={filters.poste}
                  onChange={(e) => setFilters({ ...filters, poste: e.target.value })}
                  className={`input w-full ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
                >
                  <option value="">Tous les postes</option>
                  {postes.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Service</label>
                <select
                  value={filters.service}
                  onChange={(e) => setFilters({ ...filters, service: e.target.value })}
                  className={`input w-full ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
                >
                  <option value="">Tous les services</option>
                  {services.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ancienneté</label>
                <select
                  value={filters.anciennete}
                  onChange={(e) => setFilters({ ...filters, anciennete: e.target.value })}
                  className={`input w-full ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
                >
                  <option value="">Toutes</option>
                  <option value="moins-1">Moins d'1 an</option>
                  <option value="1-3">1 à 3 ans</option>
                  <option value="3-5">3 à 5 ans</option>
                  <option value="plus-5">Plus de 5 ans</option>
                </select>
              </div>

              <div className="col-span-1 md:col-span-3 flex justify-end">
                <button onClick={resetFilters} className="btn">
                  Réinitialiser les filtres
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tableau des employés */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4">Chargement des employés...</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className={`card p-12 text-center ${darkMode ? "bg-gray-800" : "bg-white"}`}>
            <FaUser className="mx-auto text-6xl opacity-30 mb-4" />
            <p className="text-xl opacity-70">Aucun employé trouvé</p>
            <button onClick={handleAdd} className="btn btn-primary mt-4 inline-flex items-center gap-2">
              <FaPlus /> Ajouter le premier employé
            </button>
          </div>
        ) : (
          <div className={`card overflow-hidden ${darkMode ? "bg-gray-800" : "bg-white"}`}>
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Photo</th>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>Poste</th>
                    <th>Service</th>
                    <th>Salaire</th>
                    <th>Date d'embauche</th>
                    <th>Contact</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee) => (
                    <tr key={employee._id} className="hover-row">
                      <td>
                        <div className="flex items-center justify-center">
                          {employee.photo ? (
                            <img
                              src={employee.photo}
                              alt={`${employee.prenom} ${employee.nom}`}
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/30"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center ring-2 ring-blue-500/30">
                              <span className="text-sm font-bold">
                                {employee.prenom?.[0]}{employee.nom?.[0]}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="font-medium">{employee.nom}</td>
                      <td>{employee.prenom}</td>
                      <td>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${darkMode ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-800"}`}>
                          {employee.poste}
                        </span>
                      </td>
                      <td>{employee.service || "-"}</td>
                      <td className="font-semibold">{employee.salaire?.toLocaleString()} DT</td>
                      <td>{new Date(employee.dateEmbauche).toLocaleDateString()}</td>
                      <td>
                        <div className="text-sm">
                          <div>{employee.email}</div>
                          <div className="opacity-70">{employee.telephone}</div>
                        </div>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(employee)}
                            className="p-2 rounded hover:bg-blue-500/20 text-blue-400 transition-all"
                            title="Modifier"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(employee._id)}
                            className="p-2 rounded hover:bg-red-500/20 text-red-400 transition-all"
                            title="Supprimer"
                          >
                            <FaTrash />
                          </button>
                          <button
                            className="p-2 rounded hover:bg-purple-500/20 text-purple-400 transition-all"
                            title="Documents"
                          >
                            <FaFileAlt />
                          </button>
                          <button
                            className="p-2 rounded hover:bg-green-500/20 text-green-400 transition-all"
                            title="Historique"
                          >
                            <FaHistory />
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

        {/* Modal */}
        {showModal && (
          <EmployeeModal
            employee={selectedEmployee}
            onClose={handleModalClose}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default EmployeesPage;

