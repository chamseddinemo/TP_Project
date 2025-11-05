import React, { useState, useEffect, useContext } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { useTheme } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import { FiPlus, FiEdit, FiTrash2, FiSave, FiCheck, FiX, FiSearch, FiCalendar } from "react-icons/fi";

const TimesheetsPage = () => {
  const { darkMode } = useTheme();
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("timesheets");
  const [loading, setLoading] = useState(false);
  
  // États pour les feuilles de temps
  const [employees, setEmployees] = useState([]);
  const [timesheets, setTimesheets] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [timesheetDays, setTimesheetDays] = useState([]);
  const [showTimesheetModal, setShowTimesheetModal] = useState(false);
  
  // États pour les congés
  const [leaves, setLeaves] = useState([]);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveFormData, setLeaveFormData] = useState({
    employeId: "",
    type: "Congé annuel",
    dateDebut: "",
    dateFin: "",
    motif: "",
    statut: "En attente"
  });
  const [leaveSearchTerm, setLeaveSearchTerm] = useState("");
  const [leaveFilterStatus, setLeaveFilterStatus] = useState("");
  const [leaveFilterEmployee, setLeaveFilterEmployee] = useState("");

  // Générer les jours du mois
  const generateMonthDays = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const date = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        date,
        heuresNormales: 0,
        heuresSupplementaires: 0,
        type: "Travail",
        note: ""
      });
    }
    setTimesheetDays(days);
  };

  // Charger les employés
  const fetchEmployees = async () => {
    try {
      const response = await axios.get("/api/rh/employees");
      setEmployees(response.data);
    } catch (error) {
      console.error("Erreur récupération employés:", error);
      toast.error("Erreur lors de la récupération des employés");
    }
  };

  // Charger les feuilles de temps
  const fetchTimesheets = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedEmployee) params.employeeId = selectedEmployee;
      if (selectedMonth) params.month = selectedMonth;
      if (selectedYear) params.year = selectedYear;
      
      const response = await axios.get("/api/rh/timesheets", { params });
      setTimesheets(response.data);
      
      // Si une feuille existe pour l'employé sélectionné, charger ses jours
      if (selectedEmployee) {
        const timesheet = response.data.find(
          t => (t.employeId?._id === selectedEmployee || t.employeId === selectedEmployee) &&
               t.mois === selectedMonth &&
               t.annee === selectedYear
        );
        if (timesheet && timesheet.jours && timesheet.jours.length > 0) {
          setTimesheetDays(timesheet.jours);
        } else {
          // Créer les jours du mois
          generateMonthDays();
        }
      }
    } catch (error) {
      console.error("Erreur récupération feuilles de temps:", error);
      toast.error("Erreur lors de la récupération des feuilles de temps");
      if (selectedEmployee) {
        generateMonthDays();
      }
    } finally {
      setLoading(false);
    }
  };

  // Charger les congés
  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/rh/leaves");
      setLeaves(response.data);
    } catch (error) {
      console.error("Erreur récupération congés:", error);
      toast.error("Erreur lors de la récupération des congés");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (activeTab === "timesheets") {
      if (selectedEmployee) {
        fetchTimesheets();
      } else {
        setTimesheetDays([]);
      }
    } else {
      fetchLeaves();
    }
  }, [activeTab, selectedEmployee, selectedMonth, selectedYear]);

  // Sauvegarder la feuille de temps
  const handleSaveTimesheet = async () => {
    if (!selectedEmployee) {
      toast.error("Veuillez sélectionner un employé");
      return;
    }

    try {
      const timesheetData = {
        employeId: selectedEmployee,
        mois: selectedMonth,
        annee: selectedYear,
        jours: timesheetDays
      };

      await axios.post("/api/rh/timesheets", timesheetData);
      toast.success("Feuille de temps sauvegardée avec succès");
      fetchTimesheets();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la sauvegarde");
    }
  };

  // Gérer les congés
  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/rh/leaves", leaveFormData);
      toast.success("Demande de congé créée avec succès");
      fetchLeaves();
      resetLeaveForm();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la création");
    }
  };

  const handleUpdateLeaveStatus = async (leaveId, newStatus) => {
    try {
      await axios.put(`/api/rh/leaves/${leaveId}`, { statut: newStatus });
      toast.success(`Congé ${newStatus === "Approuvé" ? "approuvé" : "refusé"}`);
      fetchLeaves();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const resetLeaveForm = () => {
    setLeaveFormData({
      employeId: "",
      type: "Congé annuel",
      dateDebut: "",
      dateFin: "",
      motif: "",
      statut: "En attente"
    });
    setShowLeaveModal(false);
  };

  // Calculer les totaux
  const calculateTotals = () => {
    const totals = timesheetDays.reduce((acc, day) => {
      acc.normales += day.heuresNormales || 0;
      acc.supplementaires += day.heuresSupplementaires || 0;
      return acc;
    }, { normales: 0, supplementaires: 0 });
    
    totals.total = totals.normales + totals.supplementaires;
    return totals;
  };

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-CA");
  };

  // Obtenir la couleur du statut
  const getStatusColor = (status) => {
    const colors = {
      "En attente": "bg-yellow-100 text-yellow-800",
      "Approuvé": "bg-green-100 text-green-800",
      "Refusé": "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusColorDark = (status) => {
    const colors = {
      "En attente": "bg-yellow-900 text-yellow-200",
      "Approuvé": "bg-green-900 text-green-200",
      "Refusé": "bg-red-900 text-red-200"
    };
    return colors[status] || "bg-gray-700 text-gray-200";
  };

  // Filtrer les congés
  const filteredLeaves = leaves.filter(leave => {
    const matchesSearch = leave.employeId?.nom?.toLowerCase().includes(leaveSearchTerm.toLowerCase()) ||
                         leave.employeId?.prenom?.toLowerCase().includes(leaveSearchTerm.toLowerCase());
    const matchesStatus = !leaveFilterStatus || leave.statut === leaveFilterStatus;
    const matchesEmployee = !leaveFilterEmployee || leave.employeId?._id === leaveFilterEmployee;
    return matchesSearch && matchesStatus && matchesEmployee;
  });

  const totals = calculateTotals();

  return (
    <DashboardLayout role={user?.role}>
      <div className={`p-6 min-h-screen ${darkMode ? "text-white bg-gray-900" : "text-gray-800 bg-gray-50"}`}>
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Feuilles de temps</h1>
          <p className={`text-lg ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Gestion des heures de travail et des congés
          </p>
        </div>

        {/* Onglets */}
        <div className={`mb-6 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab("timesheets")}
              className={`px-4 py-2 font-medium ${
                activeTab === "timesheets"
                  ? `border-b-2 ${darkMode ? "border-blue-500 text-blue-400" : "border-blue-600 text-blue-600"}`
                  : `${darkMode ? "text-gray-400" : "text-gray-500"}`
              }`}
            >
              Feuilles de temps
            </button>
            <button
              onClick={() => setActiveTab("leaves")}
              className={`px-4 py-2 font-medium ${
                activeTab === "leaves"
                  ? `border-b-2 ${darkMode ? "border-blue-500 text-blue-400" : "border-blue-600 text-blue-600"}`
                  : `${darkMode ? "text-gray-400" : "text-gray-500"}`
              }`}
            >
              Congés
            </button>
          </div>
        </div>

        {/* Contenu des onglets */}
        {activeTab === "timesheets" && (
          <div>
            {/* Sélecteurs */}
            <div className={`mb-6 ${darkMode ? "bg-gray-800" : "bg-white"} p-4 rounded-lg shadow`}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block mb-2 font-medium">Employé</label>
                  <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
                    }`}
                  >
                    <option value="">Sélectionner un employé</option>
                    {employees.map(emp => (
                      <option key={emp._id} value={emp._id}>
                        {emp.prenom} {emp.nom}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-2 font-medium">Mois</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => {
                      setSelectedMonth(parseInt(e.target.value));
                      generateMonthDays();
                    }}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
                    }`}
                  >
                    {[...Array(12)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(2000, i, 1).toLocaleDateString("fr-CA", { month: "long" })}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-2 font-medium">Année</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(parseInt(e.target.value));
                      generateMonthDays();
                    }}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
                    }`}
                  >
                    {[...Array(5)].map((_, i) => {
                      const year = new Date().getFullYear() - 2 + i;
                      return <option key={year} value={year}>{year}</option>;
                    })}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleSaveTimesheet}
                    disabled={!selectedEmployee || loading}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <FiSave /> Sauvegarder
                  </button>
                </div>
              </div>
            </div>

            {/* Totaux */}
            {selectedEmployee && (
              <div className={`mb-6 grid grid-cols-1 md:grid-cols-3 gap-4`}>
                <div className={`${darkMode ? "bg-gray-800" : "bg-white"} p-4 rounded-lg shadow`}>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Heures normales</p>
                  <p className="text-2xl font-bold">{totals.normales}h</p>
                </div>
                <div className={`${darkMode ? "bg-gray-800" : "bg-white"} p-4 rounded-lg shadow`}>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Heures supplémentaires</p>
                  <p className="text-2xl font-bold">{totals.supplementaires}h</p>
                </div>
                <div className={`${darkMode ? "bg-gray-800" : "bg-white"} p-4 rounded-lg shadow`}>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Total</p>
                  <p className="text-2xl font-bold">{totals.total}h</p>
                </div>
              </div>
            )}

            {/* Tableau des jours */}
            {selectedEmployee ? (
              loading ? (
                <div className="text-center py-8">Chargement...</div>
              ) : (
                <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow overflow-hidden`}>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase">Type</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase">Heures normales</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase">Heures sup.</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase">Note</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {timesheetDays.map((day, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 whitespace-nowrap">{formatDate(day.date)}</td>
                            <td className="px-4 py-3">
                              <select
                                value={day.type}
                                onChange={(e) => {
                                  const newDays = [...timesheetDays];
                                  newDays[index].type = e.target.value;
                                  setTimesheetDays(newDays);
                                }}
                                className={`px-2 py-1 rounded border ${
                                  darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
                                }`}
                              >
                                <option value="Travail">Travail</option>
                                <option value="Congé">Congé</option>
                                <option value="RTT">RTT</option>
                                <option value="Absence">Absence</option>
                                <option value="Maladie">Maladie</option>
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                min="0"
                                max="24"
                                step="0.5"
                                value={day.heuresNormales}
                                onChange={(e) => {
                                  const newDays = [...timesheetDays];
                                  newDays[index].heuresNormales = parseFloat(e.target.value) || 0;
                                  setTimesheetDays(newDays);
                                }}
                                className={`w-20 px-2 py-1 rounded border ${
                                  darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
                                }`}
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                min="0"
                                max="24"
                                step="0.5"
                                value={day.heuresSupplementaires}
                                onChange={(e) => {
                                  const newDays = [...timesheetDays];
                                  newDays[index].heuresSupplementaires = parseFloat(e.target.value) || 0;
                                  setTimesheetDays(newDays);
                                }}
                                className={`w-20 px-2 py-1 rounded border ${
                                  darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
                                }`}
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={day.note || ""}
                                onChange={(e) => {
                                  const newDays = [...timesheetDays];
                                  newDays[index].note = e.target.value;
                                  setTimesheetDays(newDays);
                                }}
                                placeholder="Note..."
                                className={`w-full px-2 py-1 rounded border ${
                                  darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
                                }`}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            ) : (
              <div className={`text-center py-8 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Veuillez sélectionner un employé pour commencer
              </div>
            )}
          </div>
        )}

        {activeTab === "leaves" && (
          <div>
            {/* En-tête avec recherche et bouton */}
            <div className={`mb-6 flex flex-col md:flex-row gap-4 ${darkMode ? "bg-gray-800" : "bg-white"} p-4 rounded-lg shadow`}>
              <div className="flex-1 relative">
                <FiSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
                <input
                  type="text"
                  placeholder="Rechercher une demande de congé..."
                  value={leaveSearchTerm}
                  onChange={(e) => setLeaveSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
                  }`}
                />
              </div>
              <select
                value={leaveFilterStatus}
                onChange={(e) => setLeaveFilterStatus(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
                }`}
              >
                <option value="">Tous les statuts</option>
                <option value="En attente">En attente</option>
                <option value="Approuvé">Approuvé</option>
                <option value="Refusé">Refusé</option>
              </select>
              <select
                value={leaveFilterEmployee}
                onChange={(e) => setLeaveFilterEmployee(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
                }`}
              >
                <option value="">Tous les employés</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>
                    {emp.prenom} {emp.nom}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowLeaveModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <FiPlus /> Nouvelle demande
              </button>
            </div>

            {/* Liste des congés */}
            {loading ? (
              <div className="text-center py-8">Chargement...</div>
            ) : filteredLeaves.length === 0 ? (
              <div className={`text-center py-8 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Aucune demande de congé trouvée
              </div>
            ) : (
              <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Employé</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Date début</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Date fin</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Statut</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredLeaves.map((leave) => (
                        <tr key={leave._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {leave.employeId?.prenom} {leave.employeId?.nom}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{leave.type}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{formatDate(leave.dateDebut)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{formatDate(leave.dateFin)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs ${darkMode ? getStatusColorDark(leave.statut) : getStatusColor(leave.statut)}`}>
                              {leave.statut}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {leave.statut === "En attente" && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleUpdateLeaveStatus(leave._id, "Approuvé")}
                                  className={`p-2 rounded ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                                  title="Approuver"
                                >
                                  <FiCheck className={darkMode ? "text-green-400" : "text-green-600"} />
                                </button>
                                <button
                                  onClick={() => handleUpdateLeaveStatus(leave._id, "Refusé")}
                                  className={`p-2 rounded ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                                  title="Refuser"
                                >
                                  <FiX className={darkMode ? "text-red-400" : "text-red-600"} />
                                </button>
                              </div>
                            )}
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

        {/* Modal Congé */}
        {showLeaveModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg p-6 w-full max-w-md`}>
              <h2 className="text-2xl font-bold mb-4">Nouvelle demande de congé</h2>
              <form onSubmit={handleLeaveSubmit} className="space-y-4">
                <div>
                  <label className="block mb-2 font-medium">Employé *</label>
                  <select
                    required
                    value={leaveFormData.employeId}
                    onChange={(e) => setLeaveFormData({ ...leaveFormData, employeId: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
                    }`}
                  >
                    <option value="">Sélectionner un employé</option>
                    {employees.map(emp => (
                      <option key={emp._id} value={emp._id}>
                        {emp.prenom} {emp.nom}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-2 font-medium">Type *</label>
                  <select
                    required
                    value={leaveFormData.type}
                    onChange={(e) => setLeaveFormData({ ...leaveFormData, type: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
                    }`}
                  >
                    <option value="Congé annuel">Congé annuel</option>
                    <option value="Congé maladie">Congé maladie</option>
                    <option value="RTT">RTT</option>
                    <option value="Congé sans solde">Congé sans solde</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-medium">Date début *</label>
                    <input
                      type="date"
                      required
                      value={leaveFormData.dateDebut}
                      onChange={(e) => setLeaveFormData({ ...leaveFormData, dateDebut: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium">Date fin *</label>
                    <input
                      type="date"
                      required
                      value={leaveFormData.dateFin}
                      onChange={(e) => setLeaveFormData({ ...leaveFormData, dateFin: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
                      }`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block mb-2 font-medium">Motif</label>
                  <textarea
                    value={leaveFormData.motif}
                    onChange={(e) => setLeaveFormData({ ...leaveFormData, motif: e.target.value })}
                    rows={3}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
                    }`}
                  />
                </div>
                <div className="flex gap-4 justify-end">
                  <button
                    type="button"
                    onClick={resetLeaveForm}
                    className={`px-4 py-2 rounded-lg ${darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"}`}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Créer
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

export default TimesheetsPage;
