import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";
import api from "../../services/api";
import { FaFileInvoice, FaFileContract, FaPlus, FaEdit, FaTrash, FaDownload } from "react-icons/fa";

const PaieContratsPage = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("payslips");
  const [employees, setEmployees] = useState([]);
  const [payslips, setPayslips] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [showContractModal, setShowContractModal] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [contractForm, setContractForm] = useState({
    employeId: "",
    typeContrat: "CDI",
    dateDebut: "",
    dateFin: "",
    salaire: "",
    poste: "",
    statut: "Actif"
  });
  const [generateForm, setGenerateForm] = useState({
    employeeId: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [empsRes, paysRes, contRes] = await Promise.all([
        api.get("/rh/employees"),
        api.get("/rh/payslips"),
        api.get("/rh/contracts")
      ]);
      setEmployees(empsRes.data);
      setPayslips(paysRes.data);
      setContracts(contRes.data);
    } catch (error) {
      console.error("Erreur récupération données:", error);
    }
  };

  const handleGeneratePayslip = async () => {
    try {
      await api.post("/rh/payslips/generate", generateForm);
      alert("Fiche de paie générée avec succès");
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Erreur lors de la génération");
    }
  };

  const handleContractSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingContract) {
        await api.put(`/rh/contracts/${editingContract._id}`, contractForm);
      } else {
        await api.post("/rh/contracts", contractForm);
      }
      setShowContractModal(false);
      resetContractForm();
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Erreur lors de la sauvegarde");
    }
  };

  const handleDeleteContract = async (id) => {
    if (!window.confirm("Supprimer ce contrat ?")) return;
    try {
      await api.delete(`/rh/contracts/${id}`);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  const resetContractForm = () => {
    setContractForm({
      employeId: "",
      typeContrat: "CDI",
      dateDebut: "",
      dateFin: "",
      salaire: "",
      poste: "",
      statut: "Actif"
    });
    setEditingContract(null);
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar role={user?.role} />
      <div className="main-content">
        <Navbar />
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Paie & Contrats</h1>
            <button
              onClick={() => { resetContractForm(); setShowContractModal(true); }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <FaPlus /> Nouveau contrat
            </button>
          </div>

          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab("payslips")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "payslips"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <FaFileInvoice className="inline mr-2" /> Fiches de Paie
              </button>
              <button
                onClick={() => setActiveTab("contracts")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "contracts"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <FaFileContract className="inline mr-2" /> Contrats
              </button>
            </nav>
          </div>

          {activeTab === "payslips" && (
            <div>
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Générer une fiche de paie</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Employé</label>
                    <select
                      value={generateForm.employeeId}
                      onChange={(e) => setGenerateForm({ ...generateForm, employeeId: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="">Sélectionner</option>
                      {employees.map(emp => (
                        <option key={emp._id} value={emp._id}>
                          {emp.prenom} {emp.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Mois</label>
                    <select
                      value={generateForm.month}
                      onChange={(e) => setGenerateForm({ ...generateForm, month: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      {[...Array(12)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {new Date(2024, i, 1).toLocaleDateString("fr-FR", { month: "long" })}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Année</label>
                    <select
                      value={generateForm.year}
                      onChange={(e) => setGenerateForm({ ...generateForm, year: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      {[...Array(5)].map((_, i) => {
                        const year = new Date().getFullYear() - 2 + i;
                        return <option key={year} value={year}>{year}</option>;
                      })}
                    </select>
                  </div>
                </div>
                <button
                  onClick={handleGeneratePayslip}
                  className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <FaPlus /> Générer
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employé</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Période</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salaire brut</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cotisations</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salaire net</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payslips.map((payslip) => (
                      <tr key={payslip._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          {payslip.employeId?.prenom} {payslip.employeId?.nom}
                        </td>
                        <td className="px-6 py-4">
                          {new Date(2024, payslip.mois - 1, 1).toLocaleDateString("fr-FR", { month: "long" })} {payslip.annee}
                        </td>
                        <td className="px-6 py-4">{payslip.salaireBrut} $</td>
                        <td className="px-6 py-4">
                          {payslip.cotisations ? (
                            Object.values(payslip.cotisations).reduce((a, b) => a + b, 0).toFixed(2)
                          ) : 0} $
                        </td>
                        <td className="px-6 py-4 font-semibold">{payslip.salaireNet} $</td>
                        <td className="px-6 py-4">
                          <button className="text-blue-600 hover:text-blue-900">
                            <FaDownload />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "contracts" && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employé</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date début</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date fin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salaire</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contracts.map((contract) => (
                    <tr key={contract._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        {contract.employeId?.prenom} {contract.employeId?.nom}
                      </td>
                      <td className="px-6 py-4">{contract.typeContrat}</td>
                      <td className="px-6 py-4">
                        {contract.dateDebut ? new Date(contract.dateDebut).toLocaleDateString("fr-FR") : "-"}
                      </td>
                      <td className="px-6 py-4">
                        {contract.dateFin ? new Date(contract.dateFin).toLocaleDateString("fr-FR") : "Indéterminé"}
                      </td>
                      <td className="px-6 py-4">{contract.salaire ? `${contract.salaire} $` : "-"}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          contract.statut === "Actif" ? "bg-green-100 text-green-800" :
                          contract.statut === "Terminé" ? "bg-red-100 text-red-800" :
                          "bg-yellow-100 text-yellow-800"
                        }`}>
                          {contract.statut}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => { setEditingContract(contract); setContractForm(contract); setShowContractModal(true); }}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteContract(contract._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {showContractModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                <h2 className="text-2xl font-bold mb-4">
                  {editingContract ? "Modifier le contrat" : "Nouveau contrat"}
                </h2>
                <form onSubmit={handleContractSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Employé *</label>
                      <select
                        required
                        value={contractForm.employeId}
                        onChange={(e) => setContractForm({ ...contractForm, employeId: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="">Sélectionner</option>
                        {employees.map(emp => (
                          <option key={emp._id} value={emp._id}>
                            {emp.prenom} {emp.nom}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Type de contrat *</label>
                      <select
                        required
                        value={contractForm.typeContrat}
                        onChange={(e) => setContractForm({ ...contractForm, typeContrat: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option>CDI</option>
                        <option>CDD</option>
                        <option>Stage</option>
                        <option>Freelance</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Date début *</label>
                      <input
                        type="date"
                        required
                        value={contractForm.dateDebut}
                        onChange={(e) => setContractForm({ ...contractForm, dateDebut: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Date fin</label>
                      <input
                        type="date"
                        value={contractForm.dateFin}
                        onChange={(e) => setContractForm({ ...contractForm, dateFin: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Salaire ($)</label>
                      <input
                        type="number"
                        value={contractForm.salaire}
                        onChange={(e) => setContractForm({ ...contractForm, salaire: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Poste</label>
                      <input
                        type="text"
                        value={contractForm.poste}
                        onChange={(e) => setContractForm({ ...contractForm, poste: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Statut</label>
                      <select
                        value={contractForm.statut}
                        onChange={(e) => setContractForm({ ...contractForm, statut: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option>Actif</option>
                        <option>Terminé</option>
                        <option>Suspendu</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => { setShowContractModal(false); resetContractForm(); }}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      {editingContract ? "Modifier" : "Créer"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaieContratsPage;

