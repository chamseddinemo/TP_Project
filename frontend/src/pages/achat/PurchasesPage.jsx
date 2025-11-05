import React, { useState, useEffect, useContext } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { AuthContext } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import api from "../../services/api";
import { toast } from "react-toastify";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaTruck,
  FaEye,
  FaCheckCircle,
  FaTimes,
  FaFilePdf,
  FaFileExcel,
  FaShoppingCart,
  FaCalendar,
  FaDollarSign,
  FaBox,
  FaBuilding,
  FaClipboardCheck,
} from "react-icons/fa";

const PurchasesPage = () => {
  const { user } = useContext(AuthContext);
  const { darkMode } = useTheme();
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSupplier, setFilterSupplier] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [formData, setFormData] = useState({
    supplierId: "",
    date: new Date().toISOString().split("T")[0],
    products: [],
    status: "en attente",
    notes: "",
  });
  const [currentProduct, setCurrentProduct] = useState({ productId: "", quantity: 1, price: 0 });

  useEffect(() => {
    fetchData();
  }, [filterSupplier, filterStatus, filterDateFrom, filterDateTo]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterSupplier) params.append("supplierId", filterSupplier);
      if (filterStatus) params.append("status", filterStatus);
      if (filterDateFrom) params.append("dateFrom", filterDateFrom);
      if (filterDateTo) params.append("dateTo", filterDateTo);

      const [purchasesRes, suppliersRes, productsRes] = await Promise.all([
        api.get(`/achat/purchases${params.toString() ? `?${params.toString()}` : ""}`),
        api.get("/achat/suppliers"),
        api.get("/stock/products"),
      ]);
      setPurchases(purchasesRes.data);
      setSuppliers(suppliersRes.data);
      setProducts(productsRes.data);
    } catch (error) {
      console.error("Erreur récupération données:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProductChange = (e) => {
    setCurrentProduct({ ...currentProduct, [e.target.name]: e.target.value });
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

    const price = currentProduct.price || product.pricePurchase || 0;
    if (price <= 0) {
      toast.error("Le prix doit être supérieur à 0");
      return;
    }

    // Vérifier si le produit est déjà dans la liste
    const existingIndex = formData.products.findIndex(
      (p) => p.productId === currentProduct.productId
    );
    if (existingIndex >= 0) {
      toast.info("Ce produit est déjà dans la liste. Modification de la quantité.");
      const updatedProducts = [...formData.products];
      updatedProducts[existingIndex] = {
        ...updatedProducts[existingIndex],
        quantity: updatedProducts[existingIndex].quantity + parseInt(currentProduct.quantity),
        price: price,
      };
      setFormData({ ...formData, products: updatedProducts });
    } else {
      setFormData({
        ...formData,
        products: [...formData.products, { ...currentProduct, price }],
      });
    }
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
    if (!formData.supplierId) {
      toast.error("Veuillez sélectionner un fournisseur");
      return;
    }
    if (formData.products.length === 0) {
      toast.error("Veuillez ajouter au moins un produit");
      return;
    }

    try {
      const purchaseData = {
        supplierId: formData.supplierId,
        date: formData.date,
        products: formData.products,
        totalAmount: calculateTotal(formData.products),
        status: formData.status,
        notes: formData.notes,
      };

      if (editingPurchase) {
        await api.put(`/achat/purchases/${editingPurchase._id}`, purchaseData);
        toast.success("Commande modifiée avec succès !");
      } else {
        await api.post("/achat/purchases", purchaseData);
        toast.success("Commande créée avec succès !");
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la sauvegarde");
    }
  };

  const handleEdit = (purchase) => {
    setEditingPurchase(purchase);
    setFormData({
      supplierId: purchase.supplier?._id || purchase.supplierId || "",
      date: purchase.date
        ? new Date(purchase.date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      products: purchase.items || purchase.products || [],
      status: purchase.status || "en attente",
      notes: purchase.notes || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette commande ?")) return;
    try {
      await api.delete(`/achat/purchases/${id}`);
      toast.success("Commande supprimée avec succès !");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  const handleReceive = async (purchase) => {
    if (!window.confirm(
      `Marquer la commande ${purchase.reference || purchase.number} comme reçue ?\n\nCela mettra automatiquement à jour le stock des produits.`
    )) return;
    try {
      await api.put(`/achat/purchases/${purchase._id}`, { received: true, status: "reçue" });
      toast.success("Commande marquée comme reçue. Le stock a été mis à jour !");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la mise à jour");
    }
  };

  const handleCancelPurchase = async (purchase) => {
    if (!window.confirm(
      `Êtes-vous sûr de vouloir annuler la commande ${purchase.reference || purchase.number} ?`
    )) return;
    try {
      await api.put(`/achat/purchases/${purchase._id}`, { status: "annulée" });
      toast.success("Commande annulée avec succès !");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de l'annulation");
    }
  };

  const handleValidatePurchase = async (purchase) => {
    try {
      await api.put(`/achat/purchases/${purchase._id}`, { status: "validée" });
      toast.success("Commande validée avec succès !");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la validation");
    }
  };

  const resetForm = () => {
    setFormData({
      supplierId: "",
      date: new Date().toISOString().split("T")[0],
      products: [],
      status: "en attente",
      notes: "",
    });
    setCurrentProduct({ productId: "", quantity: 1, price: 0 });
    setEditingPurchase(null);
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

  const getTotalQuantity = (products) => {
    return products.reduce((sum, p) => sum + (p.quantity || 0), 0);
  };

  const getStatusColor = (status, received) => {
    if (received) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    switch (status) {
      case "reçue":
      case "received":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "validée":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "en cours":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "en attente":
      case "pending":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
      case "annulée":
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const getStatusLabel = (status, received) => {
    if (received) return "Reçue";
    switch (status) {
      case "received":
      case "reçue":
        return "Reçue";
      case "validée":
        return "Validée";
      case "en cours":
        return "En cours";
      case "pending":
      case "en attente":
        return "En attente";
      case "annulée":
      case "cancelled":
        return "Annulée";
      default:
        return status;
    }
  };

  const filteredPurchases = purchases.filter((purchase) => {
    const matchesSearch =
      `${purchase.reference || purchase.number || ""} ${purchase.supplier?.name || ""}`.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const exportToPDF = () => {
    toast.info("Fonctionnalité d'export PDF à implémenter");
  };

  const exportToExcel = () => {
    toast.info("Fonctionnalité d'export Excel à implémenter");
  };

  const stats = {
    total: purchases.length,
    enAttente: purchases.filter((p) => p.status === "en attente" || p.status === "pending").length,
    validee: purchases.filter((p) => p.status === "validée").length,
    recue: purchases.filter((p) => p.received || p.status === "reçue" || p.status === "received").length,
    annulee: purchases.filter((p) => p.status === "annulée" || p.status === "cancelled").length,
    totalAmount: purchases.reduce((sum, p) => sum + (p.total || p.amount || 0), 0),
  };

  return (
    <DashboardLayout role={user?.role}>
      <div className={`p-6 min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
        <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-6 mb-6`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-800"} mb-2`}>
                Gestion des Achats
              </h1>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Commandes d'achat auprès des fournisseurs
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
                  setShowModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 font-semibold transition-colors shadow-md hover:shadow-lg"
              >
                <FaPlus /> Nouvelle commande
              </button>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-4`}>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${darkMode ? "bg-blue-900" : "bg-blue-100"}`}>
                <FaShoppingCart className={`text-xl ${darkMode ? "text-blue-400" : "text-blue-600"}`} />
              </div>
              <div>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Total commandes</p>
                <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>{stats.total}</p>
              </div>
            </div>
          </div>
          <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-4`}>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                <FaClipboardCheck className={`text-xl ${darkMode ? "text-gray-400" : "text-gray-600"}`} />
              </div>
              <div>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>En attente</p>
                <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
                  {stats.enAttente}
                </p>
              </div>
            </div>
          </div>
          <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-4`}>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${darkMode ? "bg-yellow-900" : "bg-yellow-100"}`}>
                <FaCheckCircle className={`text-xl ${darkMode ? "text-yellow-400" : "text-yellow-600"}`} />
              </div>
              <div>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Validées</p>
                <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>{stats.validee}</p>
              </div>
            </div>
          </div>
          <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-4`}>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${darkMode ? "bg-green-900" : "bg-green-100"}`}>
                <FaTruck className={`text-xl ${darkMode ? "text-green-400" : "text-green-600"}`} />
              </div>
              <div>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Reçues</p>
                <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>{stats.recue}</p>
              </div>
            </div>
          </div>
          <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-4`}>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${darkMode ? "bg-red-900" : "bg-red-100"}`}>
                <FaTimes className={`text-xl ${darkMode ? "text-red-400" : "text-red-600"}`} />
              </div>
              <div>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Annulées</p>
                <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>{stats.annulee}</p>
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
                  placeholder="Rechercher par numéro ou fournisseur..."
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
                value={filterSupplier}
                onChange={(e) => setFilterSupplier(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                }`}
              >
                <option value="">Tous les fournisseurs</option>
                {suppliers.map((supplier) => (
                  <option key={supplier._id} value={supplier._id}>
                    {supplier.name}
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
                <option value="en attente">En attente</option>
                <option value="validée">Validée</option>
                <option value="en cours">En cours</option>
                <option value="reçue">Reçue</option>
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
                      <span className={darkMode ? "text-gray-300" : "text-gray-500"}>Fournisseur</span>
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
                  {filteredPurchases.length === 0 ? (
                    <tr>
                      <td
                        colSpan="8"
                        className={`px-6 py-12 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                      >
                        Aucune commande trouvée
                      </td>
                    </tr>
                  ) : (
                    filteredPurchases.map((purchase) => {
                      const purchaseProducts = purchase.items || purchase.products || [];
                      const totalQuantity = getTotalQuantity(purchaseProducts);
                      const totalAmount = purchase.total || purchase.amount || calculateTotal(purchaseProducts);
                      return (
                        <tr
                          key={purchase._id}
                          className={`hover:${darkMode ? "bg-gray-700" : "bg-gray-50"} transition-colors`}
                        >
                          <td className={`px-6 py-4 whitespace-nowrap font-mono text-sm ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                            {purchase.reference || purchase.number || purchase._id.slice(-8)}
                          </td>
                          <td className={`px-6 py-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
                            <div className="flex items-center gap-2">
                              <FaBuilding className={darkMode ? "text-gray-400" : "text-gray-400"} />
                              <span className="font-medium">{purchase.supplier?.name || "N/A"}</span>
                            </div>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                            <div className="flex items-center gap-1">
                              <FaCalendar className="text-xs" />
                              {formatDate(purchase.date || purchase.createdAt)}
                            </div>
                          </td>
                          <td className={`px-6 py-4 ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                            <div className="flex items-center gap-1">
                              <FaBox className="text-xs" />
                              {purchaseProducts.length} produit(s)
                            </div>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                            {totalQuantity}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap font-semibold ${darkMode ? "text-green-400" : "text-green-600"}`}>
                            {formatCurrency(totalAmount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(purchase.status, purchase.received)}`}>
                              {getStatusLabel(purchase.status, purchase.received)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedPurchase(purchase);
                                  setShowDetailsModal(true);
                                }}
                                className={`p-2 rounded-lg transition-colors ${
                                  darkMode ? "text-blue-400 hover:bg-gray-700" : "text-blue-600 hover:bg-blue-50"
                                }`}
                                title="Consulter"
                              >
                                <FaEye />
                              </button>
                              {!purchase.received && purchase.status !== "annulée" && (
                                <>
                                  <button
                                    onClick={() => handleEdit(purchase)}
                                    className={`p-2 rounded-lg transition-colors ${
                                      darkMode ? "text-yellow-400 hover:bg-gray-700" : "text-yellow-600 hover:bg-yellow-50"
                                    }`}
                                    title="Modifier"
                                  >
                                    <FaEdit />
                                  </button>
                                  {purchase.status === "en attente" && (
                                    <button
                                      onClick={() => handleValidatePurchase(purchase)}
                                      className={`p-2 rounded-lg transition-colors ${
                                        darkMode ? "text-green-400 hover:bg-gray-700" : "text-green-600 hover:bg-green-50"
                                      }`}
                                      title="Valider"
                                    >
                                      <FaCheckCircle />
                                    </button>
                                  )}
                                  {purchase.status === "validée" && (
                                    <button
                                      onClick={() => handleReceive(purchase)}
                                      className={`p-2 rounded-lg transition-colors ${
                                        darkMode ? "text-green-400 hover:bg-gray-700" : "text-green-600 hover:bg-green-50"
                                      }`}
                                      title="Valider réception (met à jour le stock)"
                                    >
                                      <FaTruck />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleCancelPurchase(purchase)}
                                    className={`p-2 rounded-lg transition-colors ${
                                      darkMode ? "text-red-400 hover:bg-gray-700" : "text-red-600 hover:bg-red-50"
                                    }`}
                                    title="Annuler"
                                    >
                                    <FaTimes />
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => handleDelete(purchase._id)}
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
                  {editingPurchase ? "Modifier la commande" : "Nouvelle commande d'achat"}
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
                      Fournisseur *
                    </label>
                    <select
                      required
                      name="supplierId"
                      value={formData.supplierId}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                      }`}
                    >
                      <option value="">Sélectionner un fournisseur</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier._id} value={supplier._id}>
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Date *
                    </label>
                    <input
                      type="date"
                      required
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
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
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                      }`}
                    >
                      <option value="en attente">En attente</option>
                      <option value="validée">Validée</option>
                      <option value="en cours">En cours</option>
                    </select>
                  </div>
                </div>

                <div className={`border-t ${darkMode ? "border-gray-700" : "border-gray-200"} pt-4`}>
                  <h3 className={`font-semibold mb-3 ${darkMode ? "text-white" : "text-gray-800"}`}>Produits</h3>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    <select
                      value={currentProduct.productId}
                      name="productId"
                      onChange={(e) => {
                        const product = products.find((p) => p._id === e.target.value);
                        setCurrentProduct({
                          ...currentProduct,
                          productId: e.target.value,
                          price: product?.pricePurchase || 0,
                        });
                      }}
                      className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                      }`}
                    >
                      <option value="">Sélectionner un produit</option>
                      {products.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name} - Stock: {p.quantity || 0}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      name="quantity"
                      placeholder="Quantité"
                      value={currentProduct.quantity}
                      onChange={handleProductChange}
                      className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                      }`}
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      name="price"
                      placeholder="Prix unitaire"
                      value={currentProduct.price}
                      onChange={handleProductChange}
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

                  <div className={`mt-4 space-y-2 max-h-48 overflow-y-auto ${darkMode ? "bg-gray-700" : "bg-gray-50"} rounded-lg p-3`}>
                    {formData.products.length === 0 ? (
                      <p className={`text-center py-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Aucun produit ajouté
                      </p>
                    ) : (
                      formData.products.map((product, index) => {
                        const prod = products.find((p) => p._id === product.productId);
                        return (
                          <div
                            key={index}
                            className={`flex justify-between items-center p-2 rounded ${
                              darkMode ? "bg-gray-800" : "bg-white"
                            }`}
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
                  <div className={`mt-4 text-right font-semibold text-lg border-t ${darkMode ? "border-gray-700" : "border-gray-200"} pt-2`}>
                    <span className={darkMode ? "text-white" : "text-gray-800"}>Total: </span>
                    <span className={darkMode ? "text-green-400" : "text-green-600"}>
                      {formatCurrency(calculateTotal(formData.products))}
                    </span>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                    }`}
                    rows="3"
                  />
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
                    {editingPurchase ? "Modifier" : "Créer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Détails commande */}
        {showDetailsModal && selectedPurchase && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl`}>
              <div
                className={`sticky top-0 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border-b px-6 py-4 flex items-center justify-between`}
              >
                <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
                  Commande {selectedPurchase.reference || selectedPurchase.number || selectedPurchase._id.slice(-8)}
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
                    <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Fournisseur:</span>
                    <p className={`font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>
                      {selectedPurchase.supplier?.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Date:</span>
                    <p className={`font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>
                      {formatDate(selectedPurchase.date || selectedPurchase.createdAt)}
                    </p>
                  </div>
                  <div>
                    <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Statut:</span>
                    <p>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedPurchase.status, selectedPurchase.received)}`}>
                        {getStatusLabel(selectedPurchase.status, selectedPurchase.received)}
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
                        {(selectedPurchase.items || selectedPurchase.products || []).map((item, index) => {
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
                  <div className={`flex justify-between pt-2 border-t ${darkMode ? "border-gray-600" : "border-gray-300"} font-bold text-lg`}>
                    <span className={darkMode ? "text-white" : "text-gray-800"}>Total:</span>
                    <span className={darkMode ? "text-green-400" : "text-green-600"}>
                      {formatCurrency(
                        selectedPurchase.total ||
                          selectedPurchase.amount ||
                          calculateTotal(selectedPurchase.items || selectedPurchase.products || [])
                      )}
                    </span>
                  </div>
                </div>

                {selectedPurchase.notes && (
                  <div>
                    <h3 className={`font-semibold mb-2 ${darkMode ? "text-white" : "text-gray-800"}`}>Notes</h3>
                    <p className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>{selectedPurchase.notes}</p>
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

export default PurchasesPage;

