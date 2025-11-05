import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";
import api from "../../services/api";
import { FaChartLine, FaFileAlt } from "react-icons/fa";
import CardStat from "../../components/CardStat";

const ReportsPage = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month"); // month, quarter, year
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalPurchases: 0,
    totalSalaries: 0,
    profit: 0,
    salesCount: 0,
    purchasesCount: 0
  });

  useEffect(() => {
    fetchReports();
  }, [period, selectedYear, selectedMonth]);

  const fetchReports = async () => {
    try {
      const [salesRes, purchasesRes, payslipsRes] = await Promise.all([
        api.get("/vente"),
        api.get("/achat/purchases"),
        api.get("/rh/payslips")
      ]);

      const sales = salesRes.data;
      const purchases = purchasesRes.data;
      const payslips = payslipsRes.data;

      // Filtrer par période
      const filterDate = (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = d.getMonth() + 1;
        
        if (period === "month") {
          return year === selectedYear && month === selectedMonth;
        } else if (period === "quarter") {
          const quarter = Math.floor((month - 1) / 3) + 1;
          const selectedQuarter = Math.floor((selectedMonth - 1) / 3) + 1;
          return year === selectedYear && quarter === selectedQuarter;
        } else {
          return year === selectedYear;
        }
      };

      const filteredSales = sales.filter(s => filterDate(s.createdAt));
      const filteredPurchases = purchases.filter(p => filterDate(p.date || p.createdAt));
      const filteredPayslips = payslips.filter(p => {
        return p.annee === selectedYear && 
               (period === "year" || period === "quarter" || p.mois === selectedMonth);
      });

      const totalSales = filteredSales
        .filter(s => s.status === "facture" || s.status === "payé")
        .reduce((sum, s) => sum + (s.totalAmount || 0), 0);
      
      const totalPurchases = filteredPurchases
        .filter(p => p.received || p.status === "received")
        .reduce((sum, p) => sum + (p.total || p.amount || 0), 0);
      
      const totalSalaries = filteredPayslips.reduce((sum, p) => sum + (p.salaireBrut || 0), 0);

      setStats({
        totalSales,
        totalPurchases,
        totalSalaries,
        profit: totalSales - totalPurchases - totalSalaries,
        salesCount: filteredSales.length,
        purchasesCount: filteredPurchases.length
      });
    } catch (error) {
      console.error("Erreur récupération rapports:", error);
    } finally {
      setLoading(false);
    }
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
            <h1 className="text-3xl font-bold text-gray-800">Rapports Financiers</h1>
          </div>

          <div className="mb-6 flex gap-4">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="month">Mensuel</option>
              <option value="quarter">Trimestriel</option>
              <option value="year">Annuel</option>
            </select>
            {period !== "year" && (
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{getMonthName(i + 1)}</option>
                ))}
              </select>
            )}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              {[...Array(5)].map((_, i) => {
                const year = new Date().getFullYear() - i;
                return <option key={year} value={year}>{year}</option>;
              })}
            </select>
          </div>

          <div className="stats-section mb-6">
            <CardStat 
              title="Chiffre d'affaires" 
              value={`${stats.totalSales.toFixed(2)} $`} 
              color="#4CAF50" 
            />
            <CardStat 
              title="Achats" 
              value={`${stats.totalPurchases.toFixed(2)} $`} 
              color="#F44336" 
            />
            <CardStat 
              title="Salaires" 
              value={`${stats.totalSalaries.toFixed(2)} $`} 
              color="#FF9800" 
            />
            <CardStat 
              title="Bénéfice net" 
              value={`${stats.profit.toFixed(2)} $`} 
              color={stats.profit >= 0 ? "#2196F3" : "#F44336"} 
            />
            <CardStat 
              title="Nombre ventes" 
              value={stats.salesCount} 
              color="#9C27B0" 
            />
            <CardStat 
              title="Nombre achats" 
              value={stats.purchasesCount} 
              color="#607D8B" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FaChartLine className="text-blue-500" />
                Résumé financier
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Revenus:</span>
                  <span className="font-semibold text-green-600">+{stats.totalSales.toFixed(2)} $</span>
                </div>
                <div className="flex justify-between">
                  <span>Coûts d'achats:</span>
                  <span className="font-semibold text-red-600">-{stats.totalPurchases.toFixed(2)} $</span>
                </div>
                <div className="flex justify-between">
                  <span>Salaires:</span>
                  <span className="font-semibold text-red-600">-{stats.totalSalaries.toFixed(2)} $</span>
                </div>
                <div className="flex justify-between border-t pt-3 font-bold text-lg">
                  <span>Bénéfice net:</span>
                  <span className={stats.profit >= 0 ? "text-green-600" : "text-red-600"}>
                    {stats.profit >= 0 ? "+" : ""}{stats.profit.toFixed(2)} $
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FaFileAlt className="text-purple-500" />
                Analyse
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600">Marge brute:</span>
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.totalSales > 0 
                      ? ((stats.totalSales - stats.totalPurchases) / stats.totalSales * 100).toFixed(1)
                      : 0}%
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Taux de marge nette:</span>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.totalSales > 0 
                      ? (stats.profit / stats.totalSales * 100).toFixed(1)
                      : 0}%
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Coût salarial / CA:</span>
                  <div className="text-2xl font-bold text-orange-600">
                    {stats.totalSales > 0 
                      ? (stats.totalSalaries / stats.totalSales * 100).toFixed(1)
                      : 0}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;

