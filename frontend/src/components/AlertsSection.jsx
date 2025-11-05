import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaExclamationTriangle,
  FaFileInvoice,
  FaTools,
  FaBox,
  FaClock,
  FaChevronRight,
} from "react-icons/fa";

const AlertsSection = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      // Simulation des données d'alertes - À remplacer par un vrai appel API
      // const { data } = await api.get("/admin/alerts");
      
      // Données simulées
      const simulatedAlerts = [
        {
          id: 1,
          type: "Stock",
          message: "Rupture : filtre hydraulique CAT-9002",
          date: new Date("2025-11-03"),
          level: "urgent",
        },
        {
          id: 2,
          type: "Maintenance",
          message: "Vérification pelle mécanique #EQU-22",
          date: new Date("2025-11-03"),
          level: "preventif",
        },
        {
          id: 3,
          type: "Finance",
          message: "Facture #FAC-2025-001 impayée",
          date: new Date("2025-11-01"),
          level: "alerte",
        },
        {
          id: 4,
          type: "Stock",
          message: "Stock faible : béton prêt à l'emploi",
          date: new Date("2025-10-30"),
          level: "alerte",
        },
        {
          id: 5,
          type: "Maintenance",
          message: "Révision camion #VEH-15 due",
          date: new Date("2025-10-28"),
          level: "preventif",
        },
      ];

      // Trier par date décroissante
      simulatedAlerts.sort((a, b) => new Date(b.date) - new Date(a.date));
      setAlerts(simulatedAlerts);
    } catch (error) {
      console.error("Erreur lors de la récupération des alertes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    
    // Rafraîchir les alertes toutes les 5 minutes
    const interval = setInterval(fetchAlerts, 300000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case "Stock":
        return <FaBox className="text-xl" />;
      case "Finance":
        return <FaFileInvoice className="text-xl" />;
      case "Maintenance":
        return <FaTools className="text-xl" />;
      default:
        return <FaExclamationTriangle className="text-xl" />;
    }
  };

  const getAlertColor = (level) => {
    switch (level) {
      case "urgent":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          icon: "text-red-600",
          badge: "bg-red-600",
          text: "text-red-800",
        };
      case "preventif":
        return {
          bg: "bg-orange-50",
          border: "border-orange-200",
          icon: "text-orange-600",
          badge: "bg-orange-600",
          text: "text-orange-800",
        };
      case "alerte":
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          icon: "text-yellow-600",
          badge: "bg-yellow-600",
          text: "text-yellow-800",
        };
      default:
        return {
          bg: "bg-gray-50",
          border: "border-gray-200",
          icon: "text-gray-600",
          badge: "bg-gray-600",
          text: "text-gray-800",
        };
    }
  };

  const getLevelLabel = (level) => {
    switch (level) {
      case "urgent":
        return "🔴 Urgent";
      case "preventif":
        return "🟠 Préventif";
      case "alerte":
        return "🟡 Alerte";
      default:
        return "Alerte";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Alertes et Notifications
        </h2>
        <button
          onClick={() => navigate("/admin/alerts")}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          Voir toutes les alertes
          <FaChevronRight className="text-xs" />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Chargement...</div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Aucune alerte pour le moment
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.slice(0, 5).map((alert, index) => {
            const colors = getAlertColor(alert.level);
            return (
              <div
                key={alert.id}
                className={`${colors.bg} ${colors.border} border rounded-lg p-4 transition-all duration-300 hover:shadow-md cursor-pointer`}
                style={{
                  animation: `fadeInUp 0.4s ease-out ${index * 0.1}s both`,
                }}
                onClick={() => navigate("/admin/alerts")}
              >
                <div className="flex items-start gap-3">
                  <div className={`${colors.icon} mt-1`}>
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-semibold ${colors.text} uppercase tracking-wide`}>
                        {alert.type}
                      </span>
                      <span className={`${colors.badge} text-white text-xs px-2 py-1 rounded-full`}>
                        {getLevelLabel(alert.level)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 font-medium mb-2">
                      {alert.message}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <FaClock className="text-xs" />
                      <span>{formatDate(alert.date)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AlertsSection;

