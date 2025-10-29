import React, { useState, useEffect } from "react";
import { FaMoneyBillWave, FaFileContract, FaPlus, FaDownload, FaEye, FaCalculator } from "react-icons/fa";
import { toast } from "react-toastify";
import AppLayout from "../../components/AppLayout";
import { getEmployees, getPayslips, generatePayslip, getContracts, createContract } from "../../services/hrService";

const PayrollPage = () => {
  const [activeTab, setActiveTab] = useState("payslips");
  const [employees, setEmployees] = useState([]);
  const [payslips, setPayslips] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showContractModal, setShowContractModal] = useState(false);

  useEffect(() => {
    const handleTheme = (e) => setDarkMode(e.detail.dark);
    document.addEventListener('erp-theme', handleTheme);
    const saved = localStorage.getItem("erp_sidebar_dark");
    if (saved !== null) setDarkMode(saved === "true");
    return () => document.removeEventListener('erp-theme', handleTheme);
  }, []);

  useEffect(() => {
    fetchEmployees();
    fetchData();
  }, []);

  const fetchEmployees = async () => {
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (error) {
      toast.error("Erreur lors du chargement des employés");
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [payslipsData, contractsData] = await Promise.all([
        getPayslips(selectedEmployee, selectedYear),
        getContracts(selectedEmployee)
      ]);
      setPayslips(payslipsData);
      setContracts(contractsData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePayslip = async (employeeId, month) => {
    try {
      await generatePayslip(employeeId, month, selectedYear);
      toast.success("Fiche de paie générée");
      fetchData();
    } catch (error) {
      toast.error("Erreur lors de la génération");
    }
  };

  const calculateNetSalary = (brutSalary) => {
    // Cotisations sociales approximatives (à adapter selon la législation)
    const cotisations = {
      cnss: brutSalary * 0.094, // 9.4%
      retraite: brutSalary * 0.02, // 2%
      cnam: brutSalary * 0.01, // 1%
    };

    const totalCotisations = Object.values(cotisations).reduce((a, b) => a + b, 0);
    const netSalary = brutSalary - totalCotisations;

    return {
      brut: brutSalary,
      cotisations,
      totalCotisations,
      net: netSalary
    };
  };

  return (
    <AppLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Paie & Contrats
            </h1>
            <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              Gestion de la paie et des contrats de travail
            </p>
          </div>
          <button
            onClick={() => setShowContractModal(true)}
            className="btn btn-primary flex items-center gap-2 px-4 py-2"
          >
            <FaPlus /> Nouveau contrat
          </button>
        </div>

        {/* Tabs */}
        <div className={`flex gap-2 mb-6 border-b ${darkMode ? "border-gray-700" : "border-gray-300"}`}>
          <button
            onClick={() => setActiveTab("payslips")}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === "payslips"
                ? "border-b-2 border-blue-500 text-blue-400"
                : darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <FaMoneyBillWave className="inline mr-2" />
            Fiches de paie
          </button>
          <button
            onClick={() => setActiveTab("contracts")}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === "contracts"
                ? "border-b-2 border-blue-500 text-blue-400"
                : darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <FaFileContract className="inline mr-2" />
            Contrats
          </button>
        </div>

        {/* Filtres */}
        <div className={`card p-4 mb-6 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Employé</label>
              <select
                value={selectedEmployee}
                onChange={(e) => {
                  setSelectedEmployee(e.target.value);
                  fetchData();
                }}
                className={`input w-full ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
              >
                <option value="">Tous les employés</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>
                    {emp.prenom} {emp.nom}
                  </option>
                ))}
              </select>
            </div>

            {activeTab === "payslips" && (
              <div>
                <label className="block text-sm font-medium mb-2">Année</label>
                <select
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(parseInt(e.target.value));
                    fetchData();
                  }}
                  className={`input w-full ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
                >
                  {[2023, 2024, 2025, 2026].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : activeTab === "payslips" ? (
          <div className="space-y-4">
            {/* Générer les fiches de paie pour tous les employés */}
            <div className={`card p-6 ${darkMode ? "bg-gradient-to-br from-blue-900/30" : "bg-gradient-to-br from-blue-100"}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold mb-2">Génération automatique</h3>
                  <p className="text-sm opacity-70">Générer les fiches de paie du mois en cours pour tous les employés</p>
                </div>
                <button
                  onClick={() => {
                    const month = new Date().getMonth() + 1;
                    employees.forEach(emp => handleGeneratePayslip(emp._id, month));
                  }}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <FaCalculator /> Générer tout
                </button>
              </div>
            </div>

            {/* Liste des employés avec calculs */}
            {employees.map(employee => {
              const salary = calculateNetSalary(employee.salaire || 0);
              
              return (
                <div key={employee._id} className={`card p-6 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center ring-2 ring-blue-500/30">
                        <span className="font-bold">{employee.prenom?.[0]}{employee.nom?.[0]}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{employee.prenom} {employee.nom}</h3>
                        <p className="text-sm opacity-70">{employee.poste}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center flex-1">
                      <div>
                        <p className="text-xs opacity-70 mb-1">Salaire brut</p>
                        <p className="font-bold text-lg">{salary.brut.toFixed(2)} DT</p>
                      </div>
                      <div>
                        <p className="text-xs opacity-70 mb-1">Cotisations</p>
                        <p className="font-bold text-lg text-red-400">-{salary.totalCotisations.toFixed(2)} DT</p>
                      </div>
                      <div>
                        <p className="text-xs opacity-70 mb-1">Salaire net</p>
                        <p className="font-bold text-lg text-green-400">{salary.net.toFixed(2)} DT</p>
                      </div>
                      <div className="flex gap-2 justify-center items-center">
                        <button
                          onClick={() => handleGeneratePayslip(employee._id, new Date().getMonth() + 1)}
                          className="btn btn-primary text-xs px-3 py-1 flex items-center gap-1"
                        >
                          <FaCalculator /> Générer
                        </button>
                        <button className="btn text-xs px-3 py-1">
                          <FaDownload />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Détail des cotisations */}
                  <details className="mt-4 pt-4 border-t border-gray-700">
                    <summary className="cursor-pointer text-sm font-medium opacity-70 hover:opacity-100">
                      Détail des cotisations
                    </summary>
                    <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                      <div>
                        <p className="opacity-70">CNSS (9.4%)</p>
                        <p className="font-bold">{salary.cotisations.cnss.toFixed(2)} DT</p>
                      </div>
                      <div>
                        <p className="opacity-70">Retraite (2%)</p>
                        <p className="font-bold">{salary.cotisations.retraite.toFixed(2)} DT</p>
                      </div>
                      <div>
                        <p className="opacity-70">CNAM (1%)</p>
                        <p className="font-bold">{salary.cotisations.cnam.toFixed(2)} DT</p>
                      </div>
                    </div>
                  </details>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={`card overflow-hidden ${darkMode ? "bg-gray-800" : "bg-white"}`}>
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Employé</th>
                    <th>Type de contrat</th>
                    <th>Date de début</th>
                    <th>Date de fin</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-12">
                        <FaFileContract className="mx-auto text-6xl opacity-30 mb-4" />
                        <p className="text-xl opacity-70">Aucun contrat</p>
                      </td>
                    </tr>
                  ) : (
                    contracts.map((contract) => (
                      <tr key={contract._id} className="hover-row">
                        <td className="font-medium">
                          {contract.employeId?.prenom} {contract.employeId?.nom}
                        </td>
                        <td>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            contract.typeContrat === "CDI" 
                              ? "bg-green-500/20 text-green-400" 
                              : "bg-blue-500/20 text-blue-400"
                          }`}>
                            {contract.typeContrat}
                          </span>
                        </td>
                        <td>{new Date(contract.dateDebut).toLocaleDateString()}</td>
                        <td>{contract.dateFin ? new Date(contract.dateFin).toLocaleDateString() : "Indéterminée"}</td>
                        <td>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            contract.statut === "Actif" 
                              ? "bg-green-500/20 text-green-400" 
                              : "bg-gray-500/20 text-gray-400"
                          }`}>
                            {contract.statut}
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-2">
                            <button className="p-2 rounded hover:bg-blue-500/20 text-blue-400">
                              <FaEye />
                            </button>
                            <button className="p-2 rounded hover:bg-green-500/20 text-green-400">
                              <FaDownload />
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

        {/* Modal pour nouveau contrat */}
        {showContractModal && (
          <ContractModal
            employees={employees}
            onClose={(refresh) => {
              setShowContractModal(false);
              if (refresh) fetchData();
            }}
          />
        )}
      </div>
    </AppLayout>
  );
};

// Modal pour créer un contrat
const ContractModal = ({ employees, onClose }) => {
  const [formData, setFormData] = useState({
    employeId: "",
    typeContrat: "CDI",
    dateDebut: "",
    dateFin: "",
    salaire: "",
    poste: "",
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
      await createContract(formData);
      toast.success("Contrat créé avec succès");
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
          <h2 className="text-2xl font-bold">Nouveau contrat</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Employé *</label>
              <select
                value={formData.employeId}
                onChange={(e) => setFormData({...formData, employeId: e.target.value})}
                required
                className={`input w-full ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
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
              <label className="block text-sm font-medium mb-2">Type de contrat *</label>
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
              <label className="block text-sm font-medium mb-2">Poste</label>
              <input
                type="text"
                value={formData.poste}
                onChange={(e) => setFormData({...formData, poste: e.target.value})}
                className={`input w-full ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Date de début *</label>
              <input
                type="date"
                value={formData.dateDebut}
                onChange={(e) => setFormData({...formData, dateDebut: e.target.value})}
                required
                className={`input w-full ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Date de fin</label>
              <input
                type="date"
                value={formData.dateFin}
                onChange={(e) => setFormData({...formData, dateFin: e.target.value})}
                className={`input w-full ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Salaire (DT)</label>
              <input
                type="number"
                value={formData.salaire}
                onChange={(e) => setFormData({...formData, salaire: e.target.value})}
                className={`input w-full ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-4 mt-6">
            <button type="button" onClick={() => onClose(false)} className="btn">
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Création..." : "Créer le contrat"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PayrollPage;

