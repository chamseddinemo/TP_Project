import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";
import api from "../../services/api";
import { FaHistory, FaSearch, FaFilter, FaCalendar } from "react-icons/fa";
import CardStat from "../../components/CardStat";

const ActivityLogPage = () => {
  const { user } = useContext(AuthContext);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    fetchActivities();
  }, []);

  // Simuler un journal d'activité basé sur les données existantes
  const fetchActivities = async () => {
    try {
      const [salesRes, purchasesRes, usersRes, productsRes] = await Promise.all([
        api.get("/vente").catch(() => ({ data: [] })),
        api.get("/achat/purchases").catch(() => ({ data: [] })),
        api.get("/auth/users").catch(() => ({ data: [] })),
        api.get("/stock/products").catch(() => ({ data: [] }))
      ]);

      const activities = [];

      // Activités de ventes
      salesRes.data.slice(0, 10).forEach(sale => {
        activities.push({
          _id: `sale_${sale._id}`,
          type: "vente",
          user: sale.clientId?.name || "Client",
          action: "Vente créée",
          details: `Vente de ${sale.totalAmount}$`,
          date: sale.createdAt,
          status: sale.status
        });
      });

      // Activités d'achats
      purchasesRes.data.slice(0, 10).forEach(purchase => {
        activities.push({
          _id: `purchase_${purchase._id}`,
          type: "achat",
          user: purchase.supplier?.name || "Fournisseur",
          action: "Commande créée",
          details: `Commande ${purchase.reference || purchase.number} - ${purchase.total || purchase.amount}$`,
          date: purchase.date || purchase.createdAt,
          status: purchase.status
        });
      });

      // Activités utilisateurs
      usersRes.data.slice(0, 5).forEach(userData => {
        activities.push({
          _id: `user_${userData._id}`,
          type: "utilisateur",
          user: userData.name,
          action: "Utilisateur créé",
          details: `Rôle: ${userData.role}`,
          date: userData.createdAt,
          status: "actif"
        });
      });

      // Activités produits
      productsRes.data.slice(0, 10).forEach(product => {
        if (product.quantity < product.minQuantity) {
          activities.push({
            _id: `product_${product._id}`,
            type: "stock",
            user: "Système",
            action: "Alerte stock faible",
            details: `${product.name} - Stock: ${product.quantity}`,
            date: product.updatedAt || product.createdAt,
            status: "warning"
          });
        }
      });

      setActivities(activities.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (error) {
      console.error("Erreur récupération activités:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = `${activity.user} ${activity.action} ${activity.details}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || activity.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: activities.length,
    ventes: activities.filter(a => a.type === "vente").length,
    achats: activities.filter(a => a.type === "achat").length,
    utilisateurs: activities.filter(a => a.type === "utilisateur").length,
    stock: activities.filter(a => a.type === "stock").length
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "vente": return "bg-blue-100 text-blue-800";
      case "achat": return "bg-orange-100 text-orange-800";
      case "utilisateur": return "bg-purple-100 text-purple-800";
      case "stock": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "vente": return "💰";
      case "achat": return "🛒";
      case "utilisateur": return "👤";
      case "stock": return "📦";
      default: return "📝";
    }
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar role={user?.role} />
      <div className="main-content">
        <Navbar />
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Journal d'Activité</h1>
          </div>

          <div className="stats-section mb-6">
            <CardStat title="Total activités" value={stats.total} color="#2196F3" />
            <CardStat title="Ventes" value={stats.ventes} color="#2196F3" />
            <CardStat title="Achats" value={stats.achats} color="#FF9800" />
            <CardStat title="Utilisateurs" value={stats.utilisateurs} color="#9C27B0" />
            <CardStat title="Alertes stock" value={stats.stock} color="#FFC107" />
          </div>

          <div className="mb-4 flex gap-2">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher dans le journal..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">Tous les types</option>
              <option value="vente">Ventes</option>
              <option value="achat">Achats</option>
              <option value="utilisateur">Utilisateurs</option>
              <option value="stock">Stock</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Heure</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Détails</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredActivities.map((activity) => (
                    <tr key={activity._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <FaCalendar className="text-gray-400" />
                          {new Date(activity.date).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 w-fit ${getTypeColor(activity.type)}`}>
                          <span>{getTypeIcon(activity.type)}</span>
                          <span className="capitalize">{activity.type}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold">{activity.user}</td>
                      <td className="px-6 py-4">{activity.action}</td>
                      <td className="px-6 py-4 text-gray-600">{activity.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredActivities.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Aucune activité trouvée
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLogPage;

