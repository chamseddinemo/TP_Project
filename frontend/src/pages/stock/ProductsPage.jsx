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
  FaEye,
  FaBox,
  FaTag,
  FaWarehouse,
  FaDollarSign,
  FaTruck,
  FaFilePdf,
  FaFileExcel,
  FaTimes,
  FaImage,
  FaFilter,
  FaExclamationTriangle,
} from "react-icons/fa";

const ProductsPage = () => {
  const { user } = useContext(AuthContext);
  const { darkMode } = useTheme();
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSupplier, setFilterSupplier] = useState("");
  const [filterStock, setFilterStock] = useState(""); // "all", "low", "out", "ok"
  const [formData, setFormData] = useState({
    reference: "",
    name: "",
    description: "",
    category: "",
    quantity: 0,
    minQuantity: 10,
    pricePurchase: 0,
    priceSale: 0,
    supplier: "",
    barcode: "",
    unit: "unité",
    photo: null,
  });

  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/stock/products");
      setProducts(data);
    } catch (error) {
      console.error("Erreur récupération produits:", error);
      toast.error("Erreur lors de la récupération des produits");
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const { data } = await api.get("/achat/suppliers");
      setSuppliers(data);
    } catch (error) {
      console.error("Erreur récupération fournisseurs:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData({ ...formData, [name]: files[0] });
    } else if (type === "number") {
      setFormData({ ...formData, [name]: value === "" ? "" : parseFloat(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.reference || !formData.name) {
      toast.error("La référence et le nom sont requis");
      return;
    }

    try {
      const submitData = { ...formData };
      
      // Si c'est une modification, on garde le supplier comme ObjectId si c'est déjà un ID
      if (editingProduct && submitData.supplier === editingProduct.supplier?._id) {
        // Ne rien faire, c'est déjà correct
      } else if (submitData.supplier && !submitData.supplier.match(/^[0-9a-fA-F]{24}$/)) {
        // Si ce n'est pas un ObjectId valide, trouver le fournisseur par nom
        const supplier = suppliers.find(s => s.name === submitData.supplier);
        if (supplier) {
          submitData.supplier = supplier._id;
        }
      }

      if (editingProduct) {
        await api.put(`/stock/products/${editingProduct._id}`, submitData);
        toast.success("Produit modifié avec succès !");
      } else {
        await api.post("/stock/products", submitData);
        toast.success("Produit ajouté avec succès !");
      }
      
      fetchProducts();
      resetForm();
    } catch (error) {
      console.error("Erreur sauvegarde produit:", error);
      toast.error(error.response?.data?.message || "Erreur lors de la sauvegarde");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      reference: product.reference || "",
      name: product.name || "",
      description: product.description || "",
      category: product.category || "",
      quantity: product.quantity || 0,
      minQuantity: product.minQuantity || 10,
      pricePurchase: product.pricePurchase || 0,
      priceSale: product.priceSale || 0,
      supplier: product.supplier?._id || product.supplier || "",
      barcode: product.barcode || "",
      unit: product.unit || "unité",
      photo: null,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) return;
    
    try {
      await api.delete(`/stock/products/${id}`);
      toast.success("Produit supprimé avec succès !");
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
  };

  const resetForm = () => {
    setFormData({
      reference: "",
      name: "",
      description: "",
      category: "",
      quantity: 0,
      minQuantity: 10,
      pricePurchase: 0,
      priceSale: 0,
      supplier: "",
      barcode: "",
      unit: "unité",
      photo: null,
    });
    setEditingProduct(null);
    setShowModal(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fr-CA", {
      style: "currency",
      currency: "CAD",
    }).format(amount || 0);
  };

  const getStockStatus = (quantity, minQuantity) => {
    if (quantity === 0) return { status: "out", color: "text-red-600", bg: "bg-red-100", label: "Rupture" };
    if (quantity < minQuantity) return { status: "low", color: "text-yellow-600", bg: "bg-yellow-100", label: "Faible" };
    return { status: "ok", color: "text-green-600", bg: "bg-green-100", label: "Normal" };
  };

  const getStockStatusDark = (quantity, minQuantity) => {
    if (quantity === 0) return { status: "out", color: "text-red-400", bg: "bg-red-900", label: "Rupture" };
    if (quantity < minQuantity) return { status: "low", color: "text-yellow-400", bg: "bg-yellow-900", label: "Faible" };
    return { status: "ok", color: "text-green-400", bg: "bg-green-900", label: "Normal" };
  };

  const handleExportPDF = () => {
    try {
      if (filteredProducts.length === 0) {
        toast.warning("Aucune donnée à exporter");
        return;
      }

      const columns = [
        { key: 'reference', label: 'Référence' },
        { key: 'name', label: 'Nom' },
        { key: 'category', label: 'Catégorie' },
        { key: 'quantity', label: 'Quantité' },
        { key: 'pricePurchase', label: 'Prix d\'achat', accessor: (item) => formatCurrency(item.pricePurchase) },
        { key: 'priceSale', label: 'Prix de vente', accessor: (item) => formatCurrency(item.priceSale) },
        { key: 'supplier', label: 'Fournisseur', accessor: (item) => item.supplier?.name || 'N/A' },
      ];

      exportToPDF(filteredProducts, columns, `produits-${new Date().toISOString().split('T')[0]}`, 'Catalogue Produits');
      toast.success("Export PDF réussi !");
    } catch (error) {
      console.error("Erreur export PDF:", error);
      toast.error("Erreur lors de l'export PDF");
    }
  };

  const handleExportExcel = () => {
    try {
      if (filteredProducts.length === 0) {
        toast.warning("Aucune donnée à exporter");
        return;
      }

      const columns = [
        { key: 'reference', label: 'Référence' },
        { key: 'name', label: 'Nom' },
        { key: 'category', label: 'Catégorie' },
        { key: 'quantity', label: 'Quantité' },
        { key: 'pricePurchase', label: 'Prix d\'achat', accessor: (item) => formatCurrency(item.pricePurchase) },
        { key: 'priceSale', label: 'Prix de vente', accessor: (item) => formatCurrency(item.priceSale) },
        { key: 'supplier', label: 'Fournisseur', accessor: (item) => item.supplier?.name || 'N/A' },
      ];

      exportToExcel(filteredProducts, columns, `produits-${new Date().toISOString().split('T')[0]}`, 'Produits');
      toast.success("Export Excel réussi !");
    } catch (error) {
      console.error("Erreur export Excel:", error);
      toast.error("Erreur lors de l'export Excel");
    }
  };

  // Extraire les catégories uniques
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      `${product.reference || ""} ${product.name || ""} ${product.description || ""}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || product.category === filterCategory;
    const matchesSupplier = !filterSupplier || product.supplier?._id === filterSupplier || product.supplier === filterSupplier;
    
    let matchesStock = true;
    if (filterStock === "low") {
      matchesStock = product.quantity > 0 && product.quantity < product.minQuantity;
    } else if (filterStock === "out") {
      matchesStock = product.quantity === 0;
    } else if (filterStock === "ok") {
      matchesStock = product.quantity >= product.minQuantity;
    }
    
    return matchesSearch && matchesCategory && matchesSupplier && matchesStock;
  });

  if (loading) {
    return (
      <DashboardLayout role={user?.role}>
        <div className={`p-6 min-h-screen ${darkMode ? "text-white bg-gray-900" : "text-gray-800 bg-gray-50"}`}>
          <div className="flex items-center justify-center h-64">
            <p className="text-lg">Chargement...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={user?.role}>
      <div className={`p-6 min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
        <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-6 mb-6`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-800"} mb-2`}>
                Gestion des Produits
              </h1>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Gérez le catalogue de produits et suivez les stocks
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
                <FaPlus /> Nouveau produit
              </button>
            </div>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-6 mb-6`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <FaSearch
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    darkMode ? "text-gray-400" : "text-gray-400"
                  }`}
                />
                <input
                  type="text"
                  placeholder="Rechercher par référence, nom ou description..."
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
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                }`}
              >
                <option value="">Toutes les catégories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={filterStock}
                onChange={(e) => setFilterStock(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                }`}
              >
                <option value="">Tous les stocks</option>
                <option value="ok">Stock normal</option>
                <option value="low">Stock faible</option>
                <option value="out">Rupture de stock</option>
              </select>
            </div>
          </div>
          {suppliers.length > 0 && (
            <div className="mt-4">
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
          )}
        </div>

        {/* Tableau des produits */}
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
                      <span className={darkMode ? "text-gray-300" : "text-gray-500"}>Référence</span>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      <span className={darkMode ? "text-gray-300" : "text-gray-500"}>Nom</span>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      <span className={darkMode ? "text-gray-300" : "text-gray-500"}>Catégorie</span>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      <span className={darkMode ? "text-gray-300" : "text-gray-500"}>Quantité</span>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      <span className={darkMode ? "text-gray-300" : "text-gray-500"}>Prix d'achat</span>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      <span className={darkMode ? "text-gray-300" : "text-gray-500"}>Prix de vente</span>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      <span className={darkMode ? "text-gray-300" : "text-gray-500"}>Fournisseur</span>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      <span className={darkMode ? "text-gray-300" : "text-gray-500"}>Statut</span>
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                      <span className={darkMode ? "text-gray-300" : "text-gray-500"}>Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? "divide-gray-700 bg-gray-800" : "divide-gray-200 bg-white"}`}>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td
                        colSpan="9"
                        className={`px-6 py-12 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                      >
                        Aucun produit trouvé
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => {
                      const stockStatus = darkMode 
                        ? getStockStatusDark(product.quantity, product.minQuantity)
                        : getStockStatus(product.quantity, product.minQuantity);
                      
                      return (
                        <tr
                          key={product._id}
                          className={`hover:${darkMode ? "bg-gray-700" : "bg-gray-50"} transition-colors`}
                        >
                          <td className={`px-6 py-4 whitespace-nowrap font-mono text-sm ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                            {product.reference}
                          </td>
                          <td className={`px-6 py-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
                            <div className="flex items-center gap-2">
                              <FaBox className={darkMode ? "text-gray-400" : "text-gray-400"} />
                              <span className="font-medium">{product.name}</span>
                            </div>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                            <div className="flex items-center gap-1">
                              <FaTag className="text-xs" />
                              {product.category || "Sans catégorie"}
                            </div>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                            <div className="flex items-center gap-1">
                              <FaWarehouse className="text-xs" />
                              {product.quantity} {product.unit || "unité"}
                            </div>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                            {formatCurrency(product.pricePurchase)}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap font-semibold ${darkMode ? "text-green-400" : "text-green-600"}`}>
                            {formatCurrency(product.priceSale)}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                            <div className="flex items-center gap-1">
                              <FaTruck className="text-xs" />
                              {product.supplier?.name || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${darkMode ? stockStatus.bg : stockStatus.bg} ${stockStatus.color}`}>
                              {stockStatus.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleViewDetails(product)}
                                className={`text-blue-600 hover:text-blue-900 ${darkMode ? "dark:text-blue-400 dark:hover:text-blue-200" : ""}`}
                                title="Voir détails"
                              >
                                <FaEye className="inline text-lg" />
                              </button>
                              <button
                                onClick={() => handleEdit(product)}
                                className={`text-yellow-600 hover:text-yellow-900 ${darkMode ? "dark:text-yellow-400 dark:hover:text-yellow-200" : ""}`}
                                title="Modifier"
                              >
                                <FaEdit className="inline text-lg" />
                              </button>
                              <button
                                onClick={() => handleDelete(product._id)}
                                className={`text-red-600 hover:text-red-900 ${darkMode ? "dark:text-red-400 dark:hover:text-red-200" : ""}`}
                                title="Supprimer"
                              >
                                <FaTrash className="inline text-lg" />
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

        {/* Modal Ajouter/Modifier */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
            <div className={`relative p-8 rounded-lg shadow-xl w-full max-w-2xl ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"}`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">
                  {editingProduct ? "Modifier le produit" : "Nouveau produit"}
                </h3>
                <button
                  onClick={resetForm}
                  className={`text-gray-500 hover:text-gray-700 ${darkMode ? "hover:text-gray-300" : ""}`}
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Référence *
                    </label>
                    <input
                      type="text"
                      name="reference"
                      value={formData.reference}
                      onChange={handleChange}
                      className={`w-full p-2 rounded-md border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-100 border-gray-300 text-gray-900"}`}
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Nom *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full p-2 rounded-md border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-100 border-gray-300 text-gray-900"}`}
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="2"
                      className={`w-full p-2 rounded-md border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-100 border-gray-300 text-gray-900"}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Catégorie
                    </label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      list="categories"
                      className={`w-full p-2 rounded-md border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-100 border-gray-300 text-gray-900"}`}
                    />
                    <datalist id="categories">
                      {categories.map((cat) => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Unité
                    </label>
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      className={`w-full p-2 rounded-md border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-100 border-gray-300 text-gray-900"}`}
                    >
                      <option value="unité">Unité</option>
                      <option value="kg">Kilogramme</option>
                      <option value="g">Gramme</option>
                      <option value="L">Litre</option>
                      <option value="mL">Millilitre</option>
                      <option value="m">Mètre</option>
                      <option value="m²">Mètre carré</option>
                      <option value="m³">Mètre cube</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Quantité
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      min="0"
                      className={`w-full p-2 rounded-md border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-100 border-gray-300 text-gray-900"}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Quantité minimale
                    </label>
                    <input
                      type="number"
                      name="minQuantity"
                      value={formData.minQuantity}
                      onChange={handleChange}
                      min="0"
                      className={`w-full p-2 rounded-md border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-100 border-gray-300 text-gray-900"}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Prix d'achat (CAD)
                    </label>
                    <input
                      type="number"
                      name="pricePurchase"
                      value={formData.pricePurchase}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className={`w-full p-2 rounded-md border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-100 border-gray-300 text-gray-900"}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Prix de vente (CAD)
                    </label>
                    <input
                      type="number"
                      name="priceSale"
                      value={formData.priceSale}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className={`w-full p-2 rounded-md border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-100 border-gray-300 text-gray-900"}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Fournisseur
                    </label>
                    <select
                      name="supplier"
                      value={formData.supplier}
                      onChange={handleChange}
                      className={`w-full p-2 rounded-md border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-100 border-gray-300 text-gray-900"}`}
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
                      Code-barres
                    </label>
                    <input
                      type="text"
                      name="barcode"
                      value={formData.barcode}
                      onChange={handleChange}
                      className={`w-full p-2 rounded-md border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-100 border-gray-300 text-gray-900"}`}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={resetForm}
                    className={`px-4 py-2 rounded-md ${darkMode ? "bg-gray-600 hover:bg-gray-500 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {editingProduct ? "Modifier" : "Créer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Détails */}
        {showDetailModal && selectedProduct && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
            <div className={`relative p-8 rounded-lg shadow-xl w-full max-w-2xl ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"}`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Détails du produit</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className={`text-gray-500 hover:text-gray-700 ${darkMode ? "hover:text-gray-300" : ""}`}
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Référence:</p>
                  <p className="text-lg font-semibold">{selectedProduct.reference}</p>
                </div>
                <div>
                  <p className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Nom:</p>
                  <p className="text-lg font-semibold">{selectedProduct.name}</p>
                </div>
                <div className="md:col-span-2">
                  <p className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Description:</p>
                  <p className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>{selectedProduct.description || "Aucune description"}</p>
                </div>
                <div>
                  <p className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Catégorie:</p>
                  <p>{selectedProduct.category || "Sans catégorie"}</p>
                </div>
                <div>
                  <p className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Unité:</p>
                  <p>{selectedProduct.unit || "unité"}</p>
                </div>
                <div>
                  <p className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Quantité:</p>
                  <p className="text-lg font-semibold">{selectedProduct.quantity} {selectedProduct.unit || "unité"}</p>
                </div>
                <div>
                  <p className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Quantité minimale:</p>
                  <p>{selectedProduct.minQuantity} {selectedProduct.unit || "unité"}</p>
                </div>
                <div>
                  <p className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Prix d'achat:</p>
                  <p className="text-lg font-semibold">{formatCurrency(selectedProduct.pricePurchase)}</p>
                </div>
                <div>
                  <p className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Prix de vente:</p>
                  <p className="text-lg font-semibold text-green-600">{formatCurrency(selectedProduct.priceSale)}</p>
                </div>
                <div>
                  <p className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Fournisseur:</p>
                  <p>{selectedProduct.supplier?.name || "N/A"}</p>
                </div>
                <div>
                  <p className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Code-barres:</p>
                  <p className="font-mono">{selectedProduct.barcode || "N/A"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Statut du stock:</p>
                  {(() => {
                    const stockStatus = darkMode 
                      ? getStockStatusDark(selectedProduct.quantity, selectedProduct.minQuantity)
                      : getStockStatus(selectedProduct.quantity, selectedProduct.minQuantity);
                    return (
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${darkMode ? stockStatus.bg : stockStatus.bg} ${stockStatus.color}`}>
                        {stockStatus.label}
                      </span>
                    );
                  })()}
                  {selectedProduct.quantity < selectedProduct.minQuantity && (
                    <div className={`mt-2 p-3 rounded-lg flex items-center gap-2 ${darkMode ? "bg-yellow-900 text-yellow-200" : "bg-yellow-100 text-yellow-800"}`}>
                      <FaExclamationTriangle />
                      <span className="text-sm">Stock en dessous du minimum requis</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleEdit(selectedProduct);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Modifier
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className={`px-4 py-2 rounded-md ${darkMode ? "bg-gray-600 hover:bg-gray-500 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProductsPage;
