import React, { useState, useEffect } from "react";
import KPICard from "./KPICard";
import {
  FaBox,
  FaDollarSign,
  FaFileInvoice,
  FaUsers,
  FaCog,
  FaExclamationTriangle,
} from "react-icons/fa";
import api from "../services/api";

const KPISection = () => {
  const [kpiData, setKpiData] = useState({
    stockTotal: 0,
    ventesMois: 0,
    facturesImpayees: { count: 0, montant: 0 },
    employesActifs: 0,
    tauxUtilisation: 0,
    produitsAlerte: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchKPIs = async () => {
    try {
      setLoading(true);
      // Simulation des données KPI - À remplacer par un vrai appel API
      // const { data } = await api.get("/admin/kpis");
      
      // Données simulées pour l'instant
      const simulatedData = {
        stockTotal: 1243,
        ventesMois: 14500,
        facturesImpayees: { count: 6, montant: 2900 },
        employesActifs: 24,
        tauxUtilisation: 68,
        produitsAlerte: 7,
      };

      setKpiData(simulatedData);
    } catch (error) {
      console.error("Erreur lors de la récupération des KPI:", error);
      // Garder les valeurs par défaut en cas d'erreur
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKPIs();
    
    // Rafraîchir les KPI toutes les 5 minutes
    const interval = setInterval(fetchKPIs, 300000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("fr-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const kpis = [
    {
      title: "Stock total disponible",
      value: loading ? "..." : `${kpiData.stockTotal.toLocaleString("fr-CA")} pièces`,
      icon: FaBox,
      color: "#1E3A8A", // Bleu acier
      delay: 0.1,
      path: "/stock/inventaire",
    },
    {
      title: "Ventes du mois",
      value: loading ? "..." : formatCurrency(kpiData.ventesMois),
      icon: FaDollarSign,
      color: "#10B981", // Vert (succès)
      delay: 0.2,
      path: "/vente/commandes",
    },
    {
      title: "Factures impayées",
      value: loading
        ? "..."
        : `${kpiData.facturesImpayees.count} factures`,
      subtitle: loading ? "" : formatCurrency(kpiData.facturesImpayees.montant),
      icon: FaFileInvoice,
      color: "#FACC15", // Jaune chantier
      delay: 0.3,
      path: "/vente/factures",
    },
    {
      title: "Employés actifs",
      value: loading ? "..." : `${kpiData.employesActifs}`,
      icon: FaUsers,
      color: "#1E3A8A", // Bleu acier
      delay: 0.4,
      path: "/rh/employes",
    },
    {
      title: "Taux d'utilisation du matériel",
      value: loading ? "..." : `${kpiData.tauxUtilisation}%`,
      icon: FaCog,
      color: "#8B5CF6", // Violet
      delay: 0.5,
      path: "/equipements/liste",
    },
    {
      title: "Produits en alerte de stock",
      value: loading ? "..." : `${kpiData.produitsAlerte} articles`,
      icon: FaExclamationTriangle,
      color: "#EF4444", // Rouge
      delay: 0.6,
      path: "/stock/produits",
    },
  ];

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Indicateurs Clés de Performance (KPI)
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, index) => (
          <KPICard
            key={index}
            title={kpi.title}
            value={kpi.value}
            subtitle={kpi.subtitle}
            icon={kpi.icon}
            color={kpi.color}
            delay={kpi.delay}
            path={kpi.path}
          />
        ))}
      </div>
    </div>
  );
};

export default KPISection;

