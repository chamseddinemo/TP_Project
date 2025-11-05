import React, { useState, useEffect, useContext } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { AuthContext } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import api from "../../services/api";
import { toast } from "react-toastify";
import { exportToPDF, exportToExcel } from "../../utils/exportUtils";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaShoppingCart,
  FaEye,
  FaCheck,
  FaTimes,
  FaFilePdf,
  FaFileExcel,
  FaUser,
  FaCalendar,
  FaBox,
  FaDollarSign,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

const OrdersPage = () => {
  const { user } = useContext(AuthContext);
  const { darkMode } = useTheme();
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClient, setFilterClient] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [formData, setFormData] = useState({
    clientId: "",
    dateCommande: new Date().toISOString().split("T")[0],
    products: [],
    status: "en cours",
    notes: "",
  });
  const [currentProduct, setCurrentProduct] = useState({ productId: "", quantity: 1, price: 0 });

  useEffect(() => {
    fetchData();
  }, [filterClient, filterStatus, filterDateFrom, filterDateTo]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterClient) params.append("clientId", filterClient);
      if (filterStatus) params.append("status", filterStatus);
      if (filterDateFrom) params.append("dateFrom", filterDateFrom);
      if (filterDateTo) params.append("dateTo", filterDateTo);

      const [ordersRes, clientsRes, productsRes] = await Promise.all([
        api.get(`/vente?${params.toString()}`),
        api.get("/vente/clients"),
        api.get("/stock/products"),
      ]);
      setOrders(ordersRes.data);
      setClients(clientsRes.data);
      setProducts(productsRes.data);
    } catch (error) {
      console.error("Erreur récupération données:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    if (!currentProduct.productId || !currentProduct.quantity || currentProduct.quantity <= 0) {
      toast.error("Veuillez sélectionner un produit et une quantité valide");
      return;
    }

    const product = products.find((p) => p._id === currentProduct.productId);
    if (!product) {
      toast.error("Produit non trouvé");
      return;
    }

    const price = currentProduct.price || product.priceSale || 0;
    if (price <= 0) {
      toast.error("Le prix doit être supérieur à 0");
      return;
    }

    setFormData({
      ...formData,
      products: [...formData.products, { ...currentProduct, price }],
    });
    setCurrentProduct({ productId: "", quantity: 1, price: 0 });
  };

  const handleRemoveProduct = (index) => {
    setFormData({
      ...formData,
      products: formData.products.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.clientId) {
      toast.error("Veuillez sélectionner un client");
      return;
    }
    if (formData.products.length === 0) {
      toast.error("Veuillez ajouter au moins un produit");
      return;
    }

    try {
      if (editingOrder) {
        await api.put(`/vente/${editingOrder._id}`, formData);
        toast.success("Commande modifiée avec succès !");
      } else {
        await api.post("/vente", formData);
        toast.success("Commande créée avec succès !");
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la sauvegarde");
    }
  };

  const handleEdit = (order) => {
    setEditingOrder(order);
    setFormData({
      clientId: order.clientId?._id || order.clientId || "",
      dateCommande: order.dateCommande
        ? new Date(order.dateCommande).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      products: order.products || [],
      status: order.status || "en cours",
      notes: order.notes || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette commande ?")) return;
    try {
      await api.delete(`/vente/${id}`);
      toast.success("Commande supprimée avec succès !");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  const handleValidateOrder = async (order) => {
    try {
      await api.put(`/vente/${order._id}`, { status: "validée" });
      toast.success("Commande validée avec succès !");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la validation");
    }
  };

  const handleCancelOrder = async (order) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir annuler la commande ${order.numeroCommande || order._id} ?`)) return;
    try {
      await api.put(`/vente/${order._id}`, { status: "annulée" });
      toast.success("Commande annulée avec succès !");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de l'annulation");
    }
  };

  const resetForm = () => {
    setFormData({
      clientId: "",
      dateCommande: new Date().toISOString().split("T")[0],
      products: [],
      status: "en cours",
      notes: "",
    });
    setCurrentProduct({ productId: "", quantity: 1, price: 0 });
    setEditingOrder(null);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("fr-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fr-CA", {
      style: "currency",
      currency: "CAD",
    }).format(amount || 0);
  };

  const calculateTotal = (products) => {
    return products.reduce((sum, p) => sum + (p.quantity * p.price), 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "en cours":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "validée":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "livrée":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "annulée":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      `${order.numeroCommande || ""} ${order.clientId?.name || ""}`.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleExportPDF = () => {
    try {
      if (filteredOrders.length === 0) {
        toast.warning("Aucune donnée à exporter");
        return;
      }

      const columns = [
        { key: 'numeroCommande', label: 'Numéro commande', accessor: (item) => item.numeroCommande || item._id.slice(-8) },
        { key: 'clientId', label: 'Client', accessor: (item) => item.clientId?.name || 'N/A' },
        { key: 'dateCommande', label: 'Date', accessor: (item) => formatDate(item.dateCommande || item.createdAt) },
        { key: 'nbProducts', label: 'Nombre produits', accessor: (item) => item.products?.length || 0 },
        { key: 'totalQuantity', label: 'Quantité totale', accessor: (item) => item.products?.reduce((sum, p) => sum + (p.quantity || 0), 0) || 0 },
        { key: 'totalAmount', label: 'Total', accessor: (item) => formatCurrency(item.totalAmount || calculateTotal(item.products || [])) },
        { key: 'status', label: 'Statut' },
      ];

      exportToPDF(filteredOrders, columns, `commandes-clients-${new Date().toISOString().split('T')[0]}`, 'Commandes Clients');
      toast.success("Export PDF réussi !");
    } catch (error) {
      console.error("Erreur export PDF:", error);
      toast.error("Erreur lors de l'export PDF");
    }
  };

  const handleExportExcel = () => {
    try {
      if (filteredOrders.length === 0) {
        toast.warning("Aucune donnée à exporter");
        return;
      }

      const columns = [
        { key: 'numeroCommande', label: 'Numéro commande', accessor: (item) => item.numeroCommande || item._id.slice(-8) },
        { key: 'clientId', label: 'Client', accessor: (item) => item.clientId?.name || 'N/A' },
        { key: 'dateCommande', label: 'Date', accessor: (item) => formatDate(item.dateCommande || item.createdAt) },
        { key: 'nbProducts', label: 'Nombre produits', accessor: (item) => item.products?.length || 0 },
        { key: 'totalQuantity', label: 'Quantité totale', accessor: (item) => item.products?.reduce((sum, p) => sum + (p.quantity || 0), 0) || 0 },
        { key: 'totalAmount', label: 'Total', accessor: (item) => formatCurrency(item.totalAmount || calculateTotal(item.products || [])) },
        { key: 'status', label: 'Statut' },
      ];

      exportToExcel(filteredOrders, columns, `commandes-clients-${new Date().toISOString().split('T')[0]}`, 'Commandes');
      toast.success("Export Excel réussi !");
    } catch (error) {
      console.error("Erreur export Excel:", error);
      toast.error("Erreur lors de l'export Excel");
    }
  };

  return (
    <DashboardLayout role={user?.role}>
      <div className={`p-6 min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
        <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-6 mb-6`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-800"} mb-2`}>
                Gestion des Commandes Clients
              </h1>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Gérez les commandes clients et suivez leur statut
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportExcel}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
                title="Exporter en Excel"
              >
                <FaFileExcel /> Excel
              </button>
              <button
                onClick={handleExportPDF}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
                title="Exporter en PDF"
              >
                <FaFilePdf /> PDF
              </button>
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 font-semibold transition-colors shadow-md hover:shadow-lg"
              >
                <FaPlus /> Nouvelle commande
              </button>
            </div>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-6 mb-6`}>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <FaSearch
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    darkMode ? "text-gray-400" : "text-gray-400"
                  }`}
                />
                <input
                  type="text"
                  placeholder="Rechercher par numéro ou client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-800"
                  }`}
                />
              </div>
            </div>
            <div>
              <select
                value={filterClient}
                onChange={(e) => setFilterClient(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                }`}
              >
                <option value="">Tous les clients</option>
                {clients.map((client) => (
                  <option key={client._id} value={client._id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                }`}
              >
                <option value="">Tous les statuts</option>
                <option value="en cours">En cours</option>
                <option value="validée">Validée</option>
                <option value="livrée">Livrée</option>
                <option value="annulée">Annulée</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                }`}
                placeholder="Du"
              />
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                }`}
                placeholder="Au"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className={`text-center py-12 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4">Chargement...</p>
          </div>
        ) : (
          <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      <span className={darkMode ? "text-gray-300" : "text-gray-500"}>Numéro commande</span>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      <span className={darkMode ? "text-gray-300" : "text-gray-500"}>Client</span>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      <span className={darkMode ? "text-gray-300" : "text-gray-500"}>Date</span>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      <span className={darkMode ? "text-gray-300" : "text-gray-500"}>Produits</span>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      <span className={darkMode ? "text-gray-300" : "text-gray-500"}>Quantité</span>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      <span className={darkMode ? "text-gray-300" : "text-gray-500"}>Total</span>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      <span className={darkMode ? "text-gray-300" : "text-gray-500"}>Statut</span>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      <span className={darkMode ? "text-gray-300" : "text-gray-500"}>Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? "divide-gray-700 bg-gray-800" : "divide-gray-200 bg-white"}`}>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td
                        colSpan="8"
                        className={`px-6 py-12 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                      >
                        Aucune commande trouvée
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => {
                      const totalQuantity = order.products?.reduce((sum, p) => sum + (p.quantity || 0), 0) || 0;
                      const totalAmount = order.totalAmount || calculateTotal(order.products || []);
                      return (
                        <tr
                          key={order._id}
                          className={`hover:${darkMode ? "bg-gray-700" : "bg-gray-50"} transition-colors`}
                        >
                          <td className={`px-6 py-4 whitespace-nowrap font-mono text-sm ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                            {order.numeroCommande || order._id.slice(-8)}
                          </td>
                          <td className={`px-6 py-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
                            <div className="flex items-center gap-2">
                              <FaUser className={darkMode ? "text-gray-400" : "text-gray-400"} />
                              <span className="font-medium">{order.clientId?.name || "N/A"}</span>
                            </div>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                            <div className="flex items-center gap-1">
                              <FaCalendar className="text-xs" />
                              {formatDate(order.dateCommande || order.createdAt)}
                            </div>
                          </td>
                          <td className={`px-6 py-4 ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                            <div className="flex items-center gap-1">
                              <FaBox className="text-xs" />
                              {order.products?.length || 0} produit(s)
                            </div>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                            {totalQuantity}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap font-semibold ${darkMode ? "text-green-400" : "text-green-600"}`}>
                            {formatCurrency(totalAmount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              {order.status === "en cours" && (
                                <button
                                  onClick={() => handleValidateOrder(order)}
                                  className={`p-2 rounded-lg transition-colors ${
                                    darkMode ? "text-green-400 hover:bg-gray-700" : "text-green-600 hover:bg-green-50"
                                  }`}
                                  title="Valider"
                                >
                                  <FaCheckCircle />
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setShowDetailsModal(true);
                                }}
                                className={`p-2 rounded-lg transition-colors ${
                                  darkMode ? "text-blue-400 hover:bg-gray-700" : "text-blue-600 hover:bg-blue-50"
                                }`}
                                title="Voir détails"
                              >
                                <FaEye />
                              </button>
                              <button
                                onClick={() => handleEdit(order)}
                                className={`p-2 rounded-lg transition-colors ${
                                  darkMode ? "text-yellow-400 hover:bg-gray-700" : "text-yellow-600 hover:bg-yellow-50"
                                }`}
                                title="Modifier"
                              >
                                <FaEdit />
                              </button>
                              {order.status !== "annulée" && (
                                <button
                                  onClick={() => handleCancelOrder(order)}
                                  className={`p-2 rounded-lg transition-colors ${
                                    darkMode ? "text-red-400 hover:bg-gray-700" : "text-red-600 hover:bg-red-50"
                                  }`}
                                  title="Annuler"
                                >
                                  <FaTimesCircle />
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(order._id)}
                                className={`p-2 rounded-lg transition-colors ${
                                  darkMode ? "text-red-400 hover:bg-gray-700" : "text-red-600 hover:bg-red-50"
                                }`}
                                title="Supprimer"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Ajouter/Modifier commande */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl`}>
              <div
                className={`sticky top-0 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border-b px-6 py-4 flex items-center justify-between`}
              >
                <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
                  {editingOrder ? "Modifier la commande" : "Nouvelle commande"}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100 text-gray-500"
                  }`}
                >
                  <FaTimes />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Client *
                    </label>
                    <select
                      required
                      value={formData.clientId}
                      onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                      }`}
                    >
                      <option value="">Sélectionner un client</option>
                      {clients.map((client) => (
                        <option key={client._id} value={client._id}>
                          {client.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Date de commande *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.dateCommande}
                      onChange={(e) => setFormData({ ...formData, dateCommande: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Statut
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                      }`}
                    >
                      <option value="en cours">En cours</option>
                      <option value="validée">Validée</option>
                      <option value="livrée">Livrée</option>
                      <option value="annulée">Annulée</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                    }`}
                    rows="2"
                  />
                </div>

                <div className={`border-t pt-4 ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                  <h3 className={`font-semibold mb-3 ${darkMode ? "text-white" : "text-gray-800"}`}>Produits</h3>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    <select
                      value={currentProduct.productId}
                      onChange={(e) => {
                        const product = products.find((p) => p._id === e.target.value);
                        setCurrentProduct({
                          ...currentProduct,
                          productId: e.target.value,
                          price: product?.priceSale || 0,
                        });
                      }}
                      className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                      }`}
                    >
                      <option value="">Produit</option>
                      {products.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name} (Stock: {p.quantity})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      placeholder="Quantité"
                      value={currentProduct.quantity}
                      onChange={(e) =>
                        setCurrentProduct({ ...currentProduct, quantity: parseInt(e.target.value) || 1 })
                      }
                      className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                      }`}
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Prix unitaire"
                      value={currentProduct.price}
                      onChange={(e) =>
                        setCurrentProduct({ ...currentProduct, price: parseFloat(e.target.value) || 0 })
                      }
                      className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={handleAddProduct}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Ajouter
                    </button>
                  </div>

                  <div className={`mt-4 space-y-2 ${darkMode ? "bg-gray-700" : "bg-gray-50"} p-4 rounded-lg max-h-48 overflow-y-auto`}>
                    {formData.products.length === 0 ? (
                      <p className={`text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Aucun produit ajouté
                      </p>
                    ) : (
                      formData.products.map((product, index) => {
                        const prod = products.find((p) => p._id === product.productId);
                        return (
                          <div
                            key={index}
                            className={`flex justify-between items-center p-2 ${darkMode ? "bg-gray-800" : "bg-white"} rounded`}
                          >
                            <span className={darkMode ? "text-gray-300" : "text-gray-700"}>
                              {prod?.name || "Produit"} - {product.quantity} x {formatCurrency(product.price)} ={" "}
                              {formatCurrency(product.quantity * product.price)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveProduct(index)}
                              className={`p-1 rounded transition-colors ${
                                darkMode ? "text-red-400 hover:bg-gray-700" : "text-red-600 hover:bg-red-50"
                              }`}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <div className={`mt-4 text-right font-semibold text-lg ${darkMode ? "text-white" : "text-gray-800"}`}>
                    Total: {formatCurrency(calculateTotal(formData.products))}
                  </div>
                </div>

                <div className={`flex justify-end gap-3 pt-4 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className={`px-6 py-2 border rounded-lg transition-colors ${
                      darkMode
                        ? "border-gray-600 hover:bg-gray-700 text-gray-300"
                        : "border-gray-300 hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    {editingOrder ? "Modifier" : "Créer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Détails commande */}
        {showDetailsModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl`}>
              <div
                className={`sticky top-0 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border-b px-6 py-4 flex items-center justify-between`}
              >
                <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
                  Détails de la commande
                </h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100 text-gray-500"
                  }`}
                >
                  <FaTimes />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Numéro commande:</span>
                    <p className={`font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>
                      {selectedOrder.numeroCommande || selectedOrder._id.slice(-8)}
                    </p>
                  </div>
                  <div>
                    <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Date:</span>
                    <p className={`font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>
                      {formatDate(selectedOrder.dateCommande || selectedOrder.createdAt)}
                    </p>
                  </div>
                  <div>
                    <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Client:</span>
                    <p className={`font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>
                      {selectedOrder.clientId?.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Statut:</span>
                    <p>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </span>
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className={`font-semibold mb-3 ${darkMode ? "text-white" : "text-gray-800"}`}>Produits</h3>
                  <div className={`${darkMode ? "bg-gray-700" : "bg-gray-50"} rounded-lg p-4`}>
                    <table className="min-w-full">
                      <thead>
                        <tr className={darkMode ? "text-gray-300" : "text-gray-600"}>
                          <th className="text-left py-2">Produit</th>
                          <th className="text-right py-2">Quantité</th>
                          <th className="text-right py-2">Prix unitaire</th>
                          <th className="text-right py-2">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.products?.map((item, index) => {
                          const product = item.productId?.name || "Produit";
                          return (
                            <tr key={index} className={darkMode ? "text-gray-300" : "text-gray-700"}>
                              <td className="py-2">{product}</td>
                              <td className="text-right py-2">{item.quantity}</td>
                              <td className="text-right py-2">{formatCurrency(item.price)}</td>
                              <td className="text-right py-2 font-semibold">
                                {formatCurrency(item.quantity * item.price)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className={`flex justify-between items-center pt-4 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                  <span className={`text-lg font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Total:
                  </span>
                  <span className={`text-2xl font-bold ${darkMode ? "text-green-400" : "text-green-600"}`}>
                    {formatCurrency(selectedOrder.totalAmount || calculateTotal(selectedOrder.products || []))}
                  </span>
                </div>

                {selectedOrder.notes && (
                  <div>
                    <h3 className={`font-semibold mb-2 ${darkMode ? "text-white" : "text-gray-800"}`}>Notes</h3>
                    <p className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>{selectedOrder.notes}</p>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className={`px-6 py-2 border rounded-lg transition-colors ${
                      darkMode
                        ? "border-gray-600 hover:bg-gray-700 text-gray-300"
                        : "border-gray-300 hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default OrdersPage;

