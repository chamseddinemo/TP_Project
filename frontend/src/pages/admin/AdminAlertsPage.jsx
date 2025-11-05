import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";
import {
  FaExclamationTriangle,
  FaFileInvoice,
  FaTools,
  FaBox,
  FaClock,
  FaSearch,
  FaFilter,
  FaCheck,
  FaTimes,
} from "react-icons/fa";

const AdminAlertsPage = () => {
  const { user } = useContext(AuthContext);
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");
  const [resolvedAlerts, setResolvedAlerts] = useState(new Set());

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      // Simulation des données d'alertes - À remplacer par un vrai appel API
      // const { data } = await api.get("/admin/alerts");
      
      // Données simulées avec plus d'alertes
      const simulatedAlerts = [
        {
          id: 1,
          type: "Stock",
          message: "Rupture : filtre hydraulique CAT-9002",
          date: new Date("2025-11-03"),
          level: "urgent",
          description: "Le stock de filtre hydraulique CAT-9002 est épuisé. Réapprovisionnement urgent requis.",
        },
        {
          id: 2,
          type: "Maintenance",
          message: "Vérification pelle mécanique #EQU-22",
          date: new Date("2025-11-03"),
          level: "preventif",
          description: "La pelle mécanique #EQU-22 nécessite une vérification préventive selon le planning.",
        },
        {
          id: 3,
          type: "Finance",
          message: "Facture #FAC-2025-001 impayée",
          date: new Date("2025-11-01"),
          level: "alerte",
          description: "La facture #FAC-2025-001 d'un montant de 2 900 $ CAD est en retard de paiement depuis 5 jours.",
        },
        {
          id: 4,
          type: "Stock",
          message: "Stock faible : béton prêt à l'emploi",
          date: new Date("2025-10-30"),
          level: "alerte",
          description: "Le stock de béton prêt à l'emploi est en dessous du seuil minimum. Seuil actuel : 15%.",
        },
        {
          id: 5,
          type: "Maintenance",
          message: "Révision camion #VEH-15 due",
          date: new Date("2025-10-28"),
          level: "preventif",
          description: "Le camion #VEH-15 doit être révisé avant le 15 novembre 2025.",
        },
        {
          id: 6,
          type: "Stock",
          message: "Rupture : ciment Portland Type I",
          date: new Date("2025-10-25"),
          level: "urgent",
          description: "Rupture de stock pour le ciment Portland Type I. Impact sur les chantiers en cours.",
        },
        {
          id: 7,
          type: "Finance",
          message: "Facture #FAC-2025-042 impayée",
          date: new Date("2025-10-20"),
          level: "alerte",
          description: "Facture #FAC-2025-042 d'un montant de 1 500 $ CAD en retard depuis 12 jours.",
        },
        {
          id: 8,
          type: "Maintenance",
          message: "Panne : compresseur d'air #EQU-08",
          date: new Date("2025-10-15"),
          level: "urgent",
          description: "Le compresseur d'air #EQU-08 est en panne. Intervention technique requise immédiatement.",
        },
      ];

      // Trier par date décroissante
      simulatedAlerts.sort((a, b) => new Date(b.date) - new Date(a.date));
      setAlerts(simulatedAlerts);
      setFilteredAlerts(simulatedAlerts);
    } catch (error) {
      console.error("Erreur lors de la récupération des alertes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  // Filtrer les alertes selon les critères
  useEffect(() => {
    let filtered = alerts.filter(alert => {
      // Filtrer par résolu
      if (resolvedAlerts.has(alert.id)) return false;

      // Filtrer par type
      if (filterType !== "all" && alert.type !== filterType) return false;

      // Filtrer par niveau
      if (filterLevel !== "all" && alert.level !== filterLevel) return false;

      // Filtrer par recherche
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          alert.message.toLowerCase().includes(searchLower) ||
          alert.type.toLowerCase().includes(searchLower) ||
          alert.description?.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });

    setFilteredAlerts(filtered);
  }, [alerts, filterType, filterLevel, searchTerm, resolvedAlerts]);

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

  const handleResolve = (alertId) => {
    setResolvedAlerts(prev => new Set([...prev, alertId]));
  };

  const handleUnresolve = (alertId) => {
    setResolvedAlerts(prev => {
      const newSet = new Set(prev);
      newSet.delete(alertId);
      return newSet;
    });
  };

  const isResolved = (alertId) => resolvedAlerts.has(alertId);

  return (
    <DashboardLayout role={user?.role}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Alertes et Notifications
          </h1>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Recherche */}
            <div className="md:col-span-2">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher une alerte..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtre par type */}
            <div>
              <div className="relative">
                <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">Tous les types</option>
                  <option value="Stock">Stock</option>
                  <option value="Finance">Finance</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
            </div>

            {/* Filtre par niveau */}
            <div>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous les niveaux</option>
                <option value="urgent">🔴 Urgent</option>
                <option value="preventif">🟠 Préventif</option>
                <option value="alerte">🟡 Alerte</option>
              </select>
            </div>
          </div>
        </div>

        {/* Liste des alertes */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-lg">Chargement des alertes...</div>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaExclamationTriangle className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Aucune alerte trouvée
            </h3>
            <p className="text-gray-500">
              {searchTerm || filterType !== "all" || filterLevel !== "all"
                ? "Aucune alerte ne correspond à vos critères de recherche."
                : "Aucune alerte pour le moment."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAlerts.map((alert, index) => {
              const colors = getAlertColor(alert.level);
              const resolved = isResolved(alert.id);
              
              return (
                <div
                  key={alert.id}
                  className={`${colors.bg} ${colors.border} border rounded-lg p-6 transition-all duration-300 hover:shadow-lg ${
                    resolved ? "opacity-60" : ""
                  }`}
                  style={{
                    animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`,
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className={`${colors.icon} mt-1`}>
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`text-sm font-semibold ${colors.text} uppercase tracking-wide`}>
                              {alert.type}
                            </span>
                            <span className={`${colors.badge} text-white text-xs px-3 py-1 rounded-full`}>
                              {getLevelLabel(alert.level)}
                            </span>
                            {resolved && (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                Résolu
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-bold text-gray-800 mb-2">
                            {alert.message}
                          </h3>
                          {alert.description && (
                            <p className="text-sm text-gray-600 mb-3">
                              {alert.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <FaClock className="text-xs" />
                          <span>{formatDate(alert.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {resolved ? (
                            <button
                              onClick={() => handleUnresolve(alert.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                            >
                              <FaTimes /> Marquer non résolu
                            </button>
                          ) : (
                            <button
                              onClick={() => handleResolve(alert.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                            >
                              <FaCheck /> Marquer comme résolu
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Statistiques */}
        {!loading && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Statistiques
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{alerts.length}</div>
                <div className="text-sm text-gray-500">Total alertes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {alerts.filter(a => a.level === "urgent" && !isResolved(a.id)).length}
                </div>
                <div className="text-sm text-gray-500">Urgentes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {alerts.filter(a => a.level === "preventif" && !isResolved(a.id)).length}
                </div>
                <div className="text-sm text-gray-500">Préventives</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {alerts.filter(a => a.level === "alerte" && !isResolved(a.id)).length}
                </div>
                <div className="text-sm text-gray-500">Alertes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{resolvedAlerts.size}</div>
                <div className="text-sm text-gray-500">Résolues</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminAlertsPage;

