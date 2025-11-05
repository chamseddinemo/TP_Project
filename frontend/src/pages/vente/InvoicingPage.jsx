import React, { useState, useEffect, useContext } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { AuthContext } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import api from "../../services/api";
import { toast } from "react-toastify";
import {
  FaFileInvoice,
  FaSearch,
  FaEye,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaFilePdf,
  FaFileExcel,
  FaUser,
  FaCalendar,
  FaDollarSign,
  FaTimes,
  FaPlus,
  FaReceipt,
  FaMoneyBillWave,
  FaPercent,
} from "react-icons/fa";

const InvoicingPage = () => {
  const { user } = useContext(AuthContext);
  const { darkMode } = useTheme();
  const [invoices, setInvoices] = useState([]);
  const [orders, setOrders] = useState([]); // Commandes qui peuvent être transformées en factures
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClient, setFilterClient] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [formData, setFormData] = useState({
    clientId: "",
    dateFacture: new Date().toISOString().split("T")[0],
    products: [],
    taxRate: 14.975, // TPS 5% + TVQ 9.975% au Québec
    discount: 0,
    notes: "",
  });

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

      // Récupérer toutes les ventes et filtrer pour les factures
      const [salesRes, ordersRes, clientsRes] = await Promise.all([
        api.get(`/vente`),
        api.get(`/vente?status=en cours`), // Commandes pouvant être transformées
        api.get("/vente/clients"),
      ]);

      // Filtrer seulement les factures (statut 'facture' ou 'payé')
      const invoicesData = salesRes.data.filter(
        (s) => s.status === "facture" || s.status === "payé"
      );
      setInvoices(invoicesData);
      setOrders(ordersRes.data.filter((o) => o.status === "en cours" || o.status === "validée"));
      setClients(clientsRes.data);
    } catch (error) {
      console.error("Erreur récupération données:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const generateInvoiceNumber = (invoice) => {
    if (invoice.numeroCommande) {
      return `FACT-${invoice.numeroCommande}`;
    }
    const date = new Date(invoice.createdAt || invoice.dateCommande);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const id = invoice._id.slice(-6).toUpperCase();
    return `FACT-${year}${month}-${id}`;
  };

  const calculateSubtotal = (products) => {
    return products.reduce((sum, p) => sum + (p.quantity * p.price), 0);
  };

  const calculateTaxes = (subtotal, discount, taxRate) => {
    const afterDiscount = subtotal - discount;
    return (afterDiscount * taxRate) / 100;
  };

  const calculateTotal = (products, discount = 0, taxRate = 14.975) => {
    const subtotal = calculateSubtotal(products);
    const afterDiscount = subtotal - discount;
    const taxes = calculateTaxes(subtotal, discount, taxRate);
    return afterDiscount + taxes;
  };

  const handleCreateFromOrder = (order) => {
    setSelectedOrder(order);
    setFormData({
      clientId: order.clientId?._id || order.clientId || "",
      dateFacture: new Date().toISOString().split("T")[0],
      products: order.products || [],
      taxRate: 14.975,
      discount: 0,
      notes: order.notes || "",
    });
    setShowCreateModal(true);
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
      const subtotal = calculateSubtotal(formData.products);
      const taxes = calculateTaxes(subtotal, formData.discount, formData.taxRate);
      const totalAmount = subtotal - formData.discount + taxes;

      const invoiceData = {
        clientId: formData.clientId,
        products: formData.products,
        totalAmount,
        status: "facture",
        dateCommande: formData.dateFacture,
        notes: formData.notes,
        taxRate: formData.taxRate,
        discount: formData.discount,
        subtotal,
        taxes,
      };

      if (editingInvoice) {
        await api.put(`/vente/${editingInvoice._id}`, invoiceData);
        toast.success("Facture modifiée avec succès !");
      } else {
        await api.post("/vente", invoiceData);
        toast.success("Facture créée avec succès !");
      }

      // Si on a créé depuis une commande, mettre à jour son statut
      if (selectedOrder && !editingInvoice) {
        await api.put(`/vente/${selectedOrder._id}`, { status: "facture" });
      }

      setShowModal(false);
      setShowCreateModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la sauvegarde");
    }
  };

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      clientId: invoice.clientId?._id || invoice.clientId || "",
      dateFacture: invoice.dateCommande
        ? new Date(invoice.dateCommande).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      products: invoice.products || [],
      taxRate: invoice.taxRate || 14.975,
      discount: invoice.discount || 0,
      notes: invoice.notes || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette facture ?")) return;
    try {
      await api.delete(`/vente/${id}`);
      toast.success("Facture supprimée avec succès !");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  const handleMarkAsPaid = async (invoice) => {
    try {
      await api.put(`/vente/${invoice._id}`, { status: "payé" });
      toast.success("Facture marquée comme payée avec succès !");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la mise à jour");
    }
  };

  const handleCancelInvoice = async (invoice) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir annuler la facture ${generateInvoiceNumber(invoice)} ?`))
      return;
    try {
      await api.put(`/vente/${invoice._id}`, { status: "annulée" });
      toast.success("Facture annulée avec succès !");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de l'annulation");
    }
  };

  const resetForm = () => {
    setFormData({
      clientId: "",
      dateFacture: new Date().toISOString().split("T")[0],
      products: [],
      taxRate: 14.975,
      discount: 0,
      notes: "",
    });
    setEditingInvoice(null);
    setSelectedOrder(null);
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

  const getStatusColor = (status) => {
    switch (status) {
      case "payé":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "facture":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const invoiceNumber = generateInvoiceNumber(invoice);
    const matchesSearch =
      `${invoiceNumber} ${invoice.clientId?.name || ""}`.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const exportToPDF = () => {
    toast.info("Fonctionnalité d'export PDF à implémenter");
  };

  const exportToExcel = () => {
    toast.info("Fonctionnalité d'export Excel à implémenter");
  };

  const stats = {
    total: invoices.length,
    facture: invoices.filter((s) => s.status === "facture").length,
    paye: invoices.filter((s) => s.status === "payé").length,
    totalAmount: invoices.reduce((sum, s) => sum + (s.totalAmount || 0), 0),
    paidAmount: invoices.filter((s) => s.status === "payé").reduce((sum, s) => sum + (s.totalAmount || 0), 0),
    unpaidAmount: invoices.filter((s) => s.status === "facture").reduce((sum, s) => sum + (s.totalAmount || 0), 0),
  };

  return (
    <DashboardLayout role={user?.role}>
      <div className={`p-6 min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
        <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-6 mb-6`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-800"} mb-2`}>
                Gestion des Factures
              </h1>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Gérez les factures et suivez les paiements des clients
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={exportToExcel}
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
                onClick={exportToPDF}
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
                  setShowCreateModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 font-semibold transition-colors shadow-md hover:shadow-lg"
              >
                <FaPlus /> Nouvelle facture
              </button>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-4`}>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${darkMode ? "bg-blue-900" : "bg-blue-100"}`}>
                <FaFileInvoice className={`text-xl ${darkMode ? "text-blue-400" : "text-blue-600"}`} />
              </div>
              <div>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Total factures</p>
                <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>{stats.total}</p>
              </div>
            </div>
          </div>
          <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-4`}>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${darkMode ? "bg-orange-900" : "bg-orange-100"}`}>
                <FaReceipt className={`text-xl ${darkMode ? "text-orange-400" : "text-orange-600"}`} />
              </div>
              <div>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Factures émises</p>
                <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
                  {stats.facture}
                </p>
              </div>
            </div>
          </div>
          <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-4`}>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${darkMode ? "bg-green-900" : "bg-green-100"}`}>
                <FaCheckCircle className={`text-xl ${darkMode ? "text-green-400" : "text-green-600"}`} />
              </div>
              <div>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Factures payées</p>
                <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>{stats.paye}</p>
              </div>
            </div>
          </div>
          <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-4`}>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${darkMode ? "bg-purple-900" : "bg-purple-100"}`}>
                <FaDollarSign className={`text-xl ${darkMode ? "text-purple-400" : "text-purple-600"}`} />
              </div>
              <div>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Montant total</p>
                <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
                  {formatCurrency(stats.totalAmount)}
                </p>
              </div>
            </div>
          </div>
          <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-4`}>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${darkMode ? "bg-red-900" : "bg-red-100"}`}>
                <FaMoneyBillWave className={`text-xl ${darkMode ? "text-red-400" : "text-red-600"}`} />
              </div>
              <div>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Montant impayé</p>
                <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
                  {formatCurrency(stats.unpaidAmount)}
                </p>
              </div>
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
                <option value="facture">Facturées</option>
                <option value="payé">Payées</option>
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
                      <span className={darkMode ? "text-gray-300" : "text-gray-500"}>Numéro facture</span>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      <span className={darkMode ? "text-gray-300" : "text-gray-500"}>Client</span>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      <span className={darkMode ? "text-gray-300" : "text-gray-500"}>Date</span>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      <span className={darkMode ? "text-gray-300" : "text-gray-500"}>Montant</span>
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
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className={`px-6 py-12 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                      >
                        Aucune facture trouvée
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((invoice) => {
                      const invoiceNumber = generateInvoiceNumber(invoice);
                      const totalAmount = invoice.totalAmount || calculateTotal(invoice.products || []);
                      return (
                        <tr
                          key={invoice._id}
                          className={`hover:${darkMode ? "bg-gray-700" : "bg-gray-50"} transition-colors`}
                        >
                          <td className={`px-6 py-4 whitespace-nowrap font-mono text-sm ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                            {invoiceNumber}
                          </td>
                          <td className={`px-6 py-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
                            <div className="flex items-center gap-2">
                              <FaUser className={darkMode ? "text-gray-400" : "text-gray-400"} />
                              <span className="font-medium">{invoice.clientId?.name || "N/A"}</span>
                            </div>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                            <div className="flex items-center gap-1">
                              <FaCalendar className="text-xs" />
                              {formatDate(invoice.dateCommande || invoice.createdAt)}
                            </div>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap font-semibold ${darkMode ? "text-green-400" : "text-green-600"}`}>
                            {formatCurrency(totalAmount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(invoice.status)}`}>
                              {invoice.status === "payé" ? "Payée" : "Impayée"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedInvoice(invoice);
                                  setShowDetailsModal(true);
                                }}
                                className={`p-2 rounded-lg transition-colors ${
                                  darkMode ? "text-blue-400 hover:bg-gray-700" : "text-blue-600 hover:bg-blue-50"
                                }`}
                                title="Consulter / PDF"
                              >
                                <FaFileInvoice />
                              </button>
                              <button
                                onClick={() => handleEdit(invoice)}
                                className={`p-2 rounded-lg transition-colors ${
                                  darkMode ? "text-yellow-400 hover:bg-gray-700" : "text-yellow-600 hover:bg-yellow-50"
                                }`}
                                title="Modifier"
                              >
                                <FaEdit />
                              </button>
                              {invoice.status === "facture" && (
                                <button
                                  onClick={() => handleMarkAsPaid(invoice)}
                                  className={`p-2 rounded-lg transition-colors ${
                                    darkMode ? "text-green-400 hover:bg-gray-700" : "text-green-600 hover:bg-green-50"
                                  }`}
                                  title="Marquer comme payée"
                                >
                                  <FaMoneyBillWave />
                                </button>
                              )}
                              <button
                                onClick={() => handleCancelInvoice(invoice)}
                                className={`p-2 rounded-lg transition-colors ${
                                  darkMode ? "text-red-400 hover:bg-gray-700" : "text-red-600 hover:bg-red-50"
                                }`}
                                title="Annuler"
                              >
                                <FaTimes />
                              </button>
                              <button
                                onClick={() => handleDelete(invoice._id)}
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

        {/* Modal Créer facture depuis commande */}
        {showCreateModal && orders.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl`}>
              <div
                className={`sticky top-0 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border-b px-6 py-4 flex items-center justify-between`}
              >
                <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
                  Créer une facture depuis une commande
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100 text-gray-500"
                  }`}
                >
                  <FaTimes />
                </button>
              </div>
              <div className="p-6">
                <div className={`${darkMode ? "bg-gray-700" : "bg-gray-50"} rounded-lg p-4 mb-4 max-h-64 overflow-y-auto`}>
                  {orders.map((order) => (
                    <div
                      key={order._id}
                      className={`p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
                        selectedOrder?._id === order._id
                          ? darkMode
                            ? "bg-blue-900 border-2 border-blue-500"
                            : "bg-blue-50 border-2 border-blue-500"
                          : darkMode
                          ? "bg-gray-800 hover:bg-gray-600"
                          : "bg-white hover:bg-gray-100"
                      }`}
                      onClick={() => handleCreateFromOrder(order)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className={`font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>
                            {order.numeroCommande || order._id.slice(-8)}
                          </p>
                          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                            {order.clientId?.name || "N/A"} - {formatCurrency(order.totalAmount || calculateTotal(order.products || []))}
                          </p>
                        </div>
                        {selectedOrder?._id === order._id && (
                          <FaCheckCircle className={`text-xl ${darkMode ? "text-blue-400" : "text-blue-600"}`} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {selectedOrder && (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                          Date de facture *
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.dateFacture}
                          onChange={(e) => setFormData({ ...formData, dateFacture: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                          Taux de taxes (%) *
                        </label>
                        <input
                          type="number"
                          step="0.001"
                          required
                          value={formData.taxRate}
                          onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                          Remise ($)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.discount}
                          onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                          }`}
                        />
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
                    <div className={`${darkMode ? "bg-gray-700" : "bg-gray-50"} rounded-lg p-4`}>
                      <h3 className={`font-semibold mb-2 ${darkMode ? "text-white" : "text-gray-800"}`}>Récapitulatif</h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className={darkMode ? "text-gray-300" : "text-gray-600"}>Sous-total:</span>
                          <span className={darkMode ? "text-white" : "text-gray-800"}>
                            {formatCurrency(calculateSubtotal(formData.products))}
                          </span>
                        </div>
                        {formData.discount > 0 && (
                          <div className="flex justify-between">
                            <span className={darkMode ? "text-gray-300" : "text-gray-600"}>Remise:</span>
                            <span className={darkMode ? "text-red-400" : "text-red-600"}>
                              -{formatCurrency(formData.discount)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className={darkMode ? "text-gray-300" : "text-gray-600"}>
                            Taxes ({formData.taxRate}%):
                          </span>
                          <span className={darkMode ? "text-white" : "text-gray-800"}>
                            {formatCurrency(calculateTaxes(calculateSubtotal(formData.products), formData.discount, formData.taxRate))}
                          </span>
                        </div>
                        <div className={`flex justify-between pt-2 border-t ${darkMode ? "border-gray-600" : "border-gray-300"} font-bold text-lg`}>
                          <span className={darkMode ? "text-white" : "text-gray-800"}>Total:</span>
                          <span className={darkMode ? "text-green-400" : "text-green-600"}>
                            {formatCurrency(calculateTotal(formData.products, formData.discount, formData.taxRate))}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={`flex justify-end gap-3 pt-4 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateModal(false);
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
                        Créer la facture
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal Détails facture */}
        {showDetailsModal && selectedInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl`}>
              <div
                className={`sticky top-0 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border-b px-6 py-4 flex items-center justify-between`}
              >
                <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
                  Facture {generateInvoiceNumber(selectedInvoice)}
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
                    <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Client:</span>
                    <p className={`font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>
                      {selectedInvoice.clientId?.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Date:</span>
                    <p className={`font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>
                      {formatDate(selectedInvoice.dateCommande || selectedInvoice.createdAt)}
                    </p>
                  </div>
                  <div>
                    <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Statut:</span>
                    <p>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedInvoice.status)}`}>
                        {selectedInvoice.status === "payé" ? "Payée" : "Impayée"}
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
                        {selectedInvoice.products?.map((item, index) => {
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

                <div className={`${darkMode ? "bg-gray-700" : "bg-gray-50"} rounded-lg p-4`}>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className={darkMode ? "text-gray-300" : "text-gray-600"}>Sous-total:</span>
                      <span className={darkMode ? "text-white" : "text-gray-800"}>
                        {formatCurrency(calculateSubtotal(selectedInvoice.products || []))}
                      </span>
                    </div>
                    {selectedInvoice.discount > 0 && (
                      <div className="flex justify-between">
                        <span className={darkMode ? "text-gray-300" : "text-gray-600"}>Remise:</span>
                        <span className={darkMode ? "text-red-400" : "text-red-600"}>
                          -{formatCurrency(selectedInvoice.discount || 0)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className={darkMode ? "text-gray-300" : "text-gray-600"}>
                        Taxes ({selectedInvoice.taxRate || 14.975}%):
                      </span>
                      <span className={darkMode ? "text-white" : "text-gray-800"}>
                        {formatCurrency(
                          calculateTaxes(
                            calculateSubtotal(selectedInvoice.products || []),
                            selectedInvoice.discount || 0,
                            selectedInvoice.taxRate || 14.975
                          )
                        )}
                      </span>
                    </div>
                    <div className={`flex justify-between pt-2 border-t ${darkMode ? "border-gray-600" : "border-gray-300"} font-bold text-lg`}>
                      <span className={darkMode ? "text-white" : "text-gray-800"}>Total:</span>
                      <span className={darkMode ? "text-green-400" : "text-green-600"}>
                        {formatCurrency(
                          selectedInvoice.totalAmount ||
                            calculateTotal(selectedInvoice.products || [], selectedInvoice.discount || 0, selectedInvoice.taxRate || 14.975)
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedInvoice.notes && (
                  <div>
                    <h3 className={`font-semibold mb-2 ${darkMode ? "text-white" : "text-gray-800"}`}>Notes</h3>
                    <p className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>{selectedInvoice.notes}</p>
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

export default InvoicingPage;

