import React, { useState, useEffect } from "react";
import { FaCalendar, FaClock, FaDownload, FaSave, FaFileExcel, FaFilePdf } from "react-icons/fa";
import { toast } from "react-toastify";
import AppLayout from "../../components/AppLayout";
import { getEmployees } from "../../services/hrService";
import { getTimesheets, saveTimesheet, exportTimesheetPDF, exportTimesheetExcel } from "../../services/hrService";

const TimesheetsPage = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [timesheet, setTimesheet] = useState({});
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
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      fetchTimesheet();
    }
  }, [selectedEmployee, selectedMonth, selectedYear]);

  const fetchEmployees = async () => {
    try {
      const data = await getEmployees();
      setEmployees(data);
      if (data.length > 0) setSelectedEmployee(data[0]._id);
    } catch (error) {
      toast.error("Erreur lors du chargement des employés");
    }
  };

  const fetchTimesheet = async () => {
    try {
      setLoading(true);
      const data = await getTimesheets(selectedEmployee, selectedMonth + 1, selectedYear);
      if (data && data.length > 0) {
        const parsed = {};
        data[0].jours?.forEach(jour => {
          parsed[jour.date] = jour;
        });
        setTimesheet(parsed);
      } else {
        // Initialiser le mois
        initializeMonth();
      }
    } catch (error) {
      console.error(error);
      initializeMonth();
    } finally {
      setLoading(false);
    }
  };

  const initializeMonth = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const newTimesheet = {};
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      newTimesheet[date] = {
        date,
        heuresNormales: 0,
        heuresSupplementaires: 0,
        type: "Travail",
        note: ""
      };
    }
    setTimesheet(newTimesheet);
  };

  const updateDay = (date, field, value) => {
    setTimesheet(prev => ({
      ...prev,
      [date]: {
        ...prev[date],
        [field]: field === "note" ? value : parseFloat(value) || 0
      }
    }));
  };

  const handleSave = async () => {
    if (!selectedEmployee) {
      toast.error("Veuillez sélectionner un employé");
      return;
    }

    try {
      setLoading(true);
      const data = {
        employeId: selectedEmployee,
        mois: selectedMonth + 1,
        annee: selectedYear,
        jours: Object.values(timesheet)
      };
      
      await saveTimesheet(data);
      toast.success("Feuille de temps enregistrée");
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      const blob = await exportTimesheetPDF(selectedEmployee, selectedMonth + 1, selectedYear);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `feuille_temps_${selectedMonth + 1}_${selectedYear}.pdf`;
      a.click();
      toast.success("Export PDF réussi");
    } catch (error) {
      toast.error("Erreur lors de l'export PDF");
    }
  };

  const handleExportExcel = async () => {
    try {
      const blob = await exportTimesheetExcel(selectedEmployee, selectedMonth + 1, selectedYear);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `feuille_temps_${selectedMonth + 1}_${selectedYear}.xlsx`;
      a.click();
      toast.success("Export Excel réussi");
    } catch (error) {
      toast.error("Erreur lors de l'export Excel");
    }
  };

  const calculateTotals = () => {
    let totalNormales = 0;
    let totalSupp = 0;
    let joursConge = 0;
    let joursAbsence = 0;

    Object.values(timesheet).forEach(day => {
      totalNormales += day.heuresNormales || 0;
      totalSupp += day.heuresSupplementaires || 0;
      if (day.type === "Congé") joursConge++;
      if (day.type === "Absence") joursAbsence++;
    });

    return { totalNormales, totalSupp, joursConge, joursAbsence };
  };

  const totals = calculateTotals();
  const months = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const date = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return { day, date };
  });

  return (
    <AppLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Feuilles de temps
            </h1>
            <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              Gestion des heures et absences
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={handleExportPDF} className="btn flex items-center gap-2 px-4 py-2">
              <FaFilePdf className="text-red-400" /> Export PDF
            </button>
            <button onClick={handleExportExcel} className="btn flex items-center gap-2 px-4 py-2">
              <FaFileExcel className="text-green-400" /> Export Excel
            </button>
            <button
              onClick={handleSave}
              className="btn btn-primary flex items-center gap-2 px-4 py-2"
              disabled={loading}
            >
              <FaSave /> Enregistrer
            </button>
          </div>
        </div>

        {/* Sélection */}
        <div className={`card p-6 mb-6 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Employé</label>
              <select
                value={selectedEmployee || ""}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className={`input w-full ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
              >
                <option value="">Sélectionner un employé</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>
                    {emp.prenom} {emp.nom} - {emp.poste}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Mois</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className={`input w-full ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
              >
                {months.map((month, idx) => (
                  <option key={idx} value={idx}>{month}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Année</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className={`input w-full ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
              >
                {[2023, 2024, 2025, 2026].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className={`card p-4 ${darkMode ? "bg-gradient-to-br from-blue-900/30" : "bg-gradient-to-br from-blue-100"}`}>
            <div className="flex items-center gap-3">
              <FaClock className="text-3xl text-blue-400" />
              <div>
                <p className="text-sm opacity-70">Heures normales</p>
                <p className="text-2xl font-bold">{totals.totalNormales}h</p>
              </div>
            </div>
          </div>

          <div className={`card p-4 ${darkMode ? "bg-gradient-to-br from-purple-900/30" : "bg-gradient-to-br from-purple-100"}`}>
            <div className="flex items-center gap-3">
              <FaClock className="text-3xl text-purple-400" />
              <div>
                <p className="text-sm opacity-70">Heures supp.</p>
                <p className="text-2xl font-bold">{totals.totalSupp}h</p>
              </div>
            </div>
          </div>

          <div className={`card p-4 ${darkMode ? "bg-gradient-to-br from-green-900/30" : "bg-gradient-to-br from-green-100"}`}>
            <div className="flex items-center gap-3">
              <FaCalendar className="text-3xl text-green-400" />
              <div>
                <p className="text-sm opacity-70">Jours de congé</p>
                <p className="text-2xl font-bold">{totals.joursConge}</p>
              </div>
            </div>
          </div>

          <div className={`card p-4 ${darkMode ? "bg-gradient-to-br from-red-900/30" : "bg-gradient-to-br from-red-100"}`}>
            <div className="flex items-center gap-3">
              <FaCalendar className="text-3xl text-red-400" />
              <div>
                <p className="text-sm opacity-70">Absences</p>
                <p className="text-2xl font-bold">{totals.joursAbsence}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tableau des jours */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className={`card overflow-hidden ${darkMode ? "bg-gray-800" : "bg-white"}`}>
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Jour</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Heures normales</th>
                    <th>Heures supp.</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {days.map(({ day, date }) => {
                    const dayData = timesheet[date] || {};
                    const dayOfWeek = new Date(date).getDay();
                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                    return (
                      <tr
                        key={date}
                        className={`hover-row ${isWeekend ? (darkMode ? "bg-gray-900/50" : "bg-gray-100/50") : ""}`}
                      >
                        <td className="font-medium">{day}</td>
                        <td>{new Date(date).toLocaleDateString('fr-FR', { weekday: 'short' })}</td>
                        <td>
                          <select
                            value={dayData.type || "Travail"}
                            onChange={(e) => updateDay(date, "type", e.target.value)}
                            className={`input text-xs px-2 py-1 ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
                          >
                            <option value="Travail">Travail</option>
                            <option value="Congé">Congé</option>
                            <option value="RTT">RTT</option>
                            <option value="Absence">Absence</option>
                            <option value="Maladie">Maladie</option>
                          </select>
                        </td>
                        <td>
                          <input
                            type="number"
                            value={dayData.heuresNormales || 0}
                            onChange={(e) => updateDay(date, "heuresNormales", e.target.value)}
                            min="0"
                            max="24"
                            step="0.5"
                            className={`input w-20 text-center ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
                            disabled={dayData.type !== "Travail"}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={dayData.heuresSupplementaires || 0}
                            onChange={(e) => updateDay(date, "heuresSupplementaires", e.target.value)}
                            min="0"
                            max="12"
                            step="0.5"
                            className={`input w-20 text-center ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
                            disabled={dayData.type !== "Travail"}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={dayData.note || ""}
                            onChange={(e) => updateDay(date, "note", e.target.value)}
                            placeholder="Note..."
                            className={`input w-full ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default TimesheetsPage;

