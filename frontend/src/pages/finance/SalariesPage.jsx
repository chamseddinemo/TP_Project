import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";
import api from "../../services/api";
import { FaSearch, FaPlus, FaFilePdf, FaEye } from "react-icons/fa";
import CardStat from "../../components/CardStat";

const SalariesPage = () => {
  const { user } = useContext(AuthContext);
  const [payslips, setPayslips] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [formData, setFormData] = useState({
    employeeId: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  useEffect(() => {
    fetchData();
  }, [filterYear]);

  const fetchData = async () => {
    try {
      const [payslipsRes, employeesRes] = await Promise.all([
        api.get(`/rh/payslips?year=${filterYear}`),
        api.get("/rh/employees")
      ]);
      setPayslips(payslipsRes.data);
      setEmployees(employeesRes.data);
    } catch (error) {
      console.error("Erreur récupération données:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      await api.post("/rh/payslips/generate", formData);
      setShowModal(false);
      setFormData({
        employeeId: "",
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
      });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Erreur lors de la génération");
    }
  };

  const filteredPayslips = payslips.filter(payslip =>
    `${payslip.employeId?.name || ""} ${payslip.employeId?.email || ""}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: payslips.length,
    totalBrut: payslips.reduce((sum, p) => sum + (p.salaireBrut || 0), 0),
    totalNet: payslips.reduce((sum, p) => sum + (p.salaireNet || 0), 0),
    totalCotisations: payslips.reduce((sum, p) => {
      const cot = p.cotisations || {};
      return sum + (cot.cnss || 0) + (cot.retraite || 0) + (cot.cnam || 0);
    }, 0)
  };

  const getMonthName = (month) => {
    const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", 
                   "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    return months[month - 1] || month;
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar role={user?.role} />
      <div className="main-content">
        <Navbar />
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Gestion des Salaires</h1>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <FaPlus /> Générer une fiche de paie
            </button>
          </div>

          <div className="stats-section mb-6">
            <CardStat title="Total fiches" value={stats.total} color="#2196F3" />
            <CardStat title="Salaire brut total" value={`${stats.totalBrut.toFixed(2)} $`} color="#FF9800" />
            <CardStat title="Salaire net total" value={`${stats.totalNet.toFixed(2)} $`} color="#4CAF50" />
            <CardStat title="Cotisations totales" value={`${stats.totalCotisations.toFixed(2)} $`} color="#9C27B0" />
          </div>

          <div className="mb-4 flex gap-2">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une fiche de paie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              {[...Array(5)].map((_, i) => {
                const year = new Date().getFullYear() - i;
                return <option key={year} value={year}>{year}</option>;
              })}
            </select>
          </div>

          {loading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : (
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
                  {filteredPayslips.map((payslip) => (
                    <tr key={payslip._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-semibold">
                        {payslip.employeId?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        {getMonthName(payslip.mois)} {payslip.annee}
                      </td>
                      <td className="px-6 py-4 font-semibold">
                        {payslip.salaireBrut?.toFixed(2) || "0.00"} $
                      </td>
                      <td className="px-6 py-4">
                        {((payslip.cotisations?.qpp || 0) + 
                          (payslip.cotisations?.rqap || 0) + 
                          (payslip.cotisations?.ae || 0) +
                          (payslip.cotisations?.rqdc || 0) +
                          (payslip.cotisations?.impots || 0)).toFixed(2)} $
                      </td>
                      <td className="px-6 py-4 font-semibold text-green-600">
                        {payslip.salaireNet?.toFixed(2) || "0.00"} $
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => { setSelectedPayslip(payslip); setShowDetailsModal(true); }}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <FaEye />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          title="Export PDF (à venir)"
                        >
                          <FaFilePdf />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredPayslips.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Aucune fiche de paie trouvée
                </div>
              )}
            </div>
          )}

          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Générer une fiche de paie</h2>
                <form onSubmit={handleGenerate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Employé *</label>
                    <select
                      required
                      value={formData.employeeId}
                      onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="">Sélectionner un employé</option>
                      {employees.map(emp => (
                        <option key={emp._id} value={emp._id}>{emp.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Mois *</label>
                    <select
                      required
                      value={formData.month}
                      onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      {[...Array(12)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>{getMonthName(i + 1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Année *</label>
                    <input
                      type="number"
                      required
                      min="2020"
                      max={new Date().getFullYear() + 1}
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Générer
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {showDetailsModal && selectedPayslip && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                <h2 className="text-2xl font-bold mb-4">Détails de la fiche de paie</h2>
                <div className="space-y-4">
                  <div>
                    <strong>Employé:</strong> {selectedPayslip.employeId?.name || "N/A"}
                  </div>
                  <div>
                    <strong>Période:</strong> {getMonthName(selectedPayslip.mois)} {selectedPayslip.annee}
                  </div>
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2">Salaire brut</h3>
                    <p className="text-lg">{selectedPayslip.salaireBrut?.toFixed(2) || "0.00"} $</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Cotisations</h3>
                    <ul className="space-y-1">
                      <li>QPP (Régime de rentes du Québec): {selectedPayslip.cotisations?.qpp?.toFixed(2) || "0.00"} $</li>
                      <li>RQAP (Assurance parentale): {selectedPayslip.cotisations?.rqap?.toFixed(2) || "0.00"} $</li>
                      <li>AE (Assurance-emploi): {selectedPayslip.cotisations?.ae?.toFixed(2) || "0.00"} $</li>
                      <li>RQDC (Régime québécois d'assurance parentale): {selectedPayslip.cotisations?.rqdc?.toFixed(2) || "0.00"} $</li>
                      <li>Impôts: {selectedPayslip.cotisations?.impots?.toFixed(2) || "0.00"} $</li>
                      <li className="font-semibold pt-2 border-t">
                        Total cotisations: {((selectedPayslip.cotisations?.qpp || 0) + 
                          (selectedPayslip.cotisations?.rqap || 0) + 
                          (selectedPayslip.cotisations?.ae || 0) +
                          (selectedPayslip.cotisations?.rqdc || 0) +
                          (selectedPayslip.cotisations?.impots || 0)).toFixed(2)} $
                      </li>
                    </ul>
                  </div>
                  {selectedPayslip.heuresNormales && (
                    <div>
                      <strong>Heures normales:</strong> {selectedPayslip.heuresNormales}h
                    </div>
                  )}
                  {selectedPayslip.heuresSupplementaires && (
                    <div>
                      <strong>Heures supplémentaires:</strong> {selectedPayslip.heuresSupplementaires}h
                    </div>
                  )}
                  {selectedPayslip.primes && (
                    <div>
                      <strong>Primes:</strong> {selectedPayslip.primes.toFixed(2)} $
                    </div>
                  )}
                  {selectedPayslip.deductions && (
                    <div>
                      <strong>Déductions:</strong> {selectedPayslip.deductions.toFixed(2)} $
                    </div>
                  )}
                  <div className="border-t pt-4 text-right">
                    <strong className="text-xl">Salaire net: {selectedPayslip.salaireNet?.toFixed(2) || "0.00"} $</strong>
                  </div>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalariesPage;

