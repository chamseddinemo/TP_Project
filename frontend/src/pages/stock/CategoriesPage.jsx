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
  FaTags,
  FaBox,
  FaDollarSign,
  FaFilePdf,
  FaFileExcel,
  FaTimes,
  FaFilter,
  FaSortAmountDown,
  FaSortAmountUp,
  FaList,
  FaTh,
} from "react-icons/fa";

const CategoriesPage = () => {
  const { user } = useContext(AuthContext);
  const { darkMode } = useTheme();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name"); // "name", "count", "value"
  const [sortOrder, setSortOrder] = useState("asc"); // "asc", "desc"
  const [viewMode, setViewMode] = useState("table"); // "table" or "cards"

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    extractCategories();
  }, [products]);

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

  const extractCategories = () => {
    const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
    const categoriesWithStats = uniqueCategories.map(cat => {
      const productsInCategory = products.filter(p => p.category === cat);
      return {
        name: cat,
        count: productsInCategory.length,
        totalValue: productsInCategory.reduce((sum, p) => sum + (p.quantity * p.pricePurchase || 0), 0),
        totalSaleValue: productsInCategory.reduce((sum, p) => sum + (p.quantity * p.priceSale || 0), 0),
        products: productsInCategory
      };
    });
    
    // Trier les catégories
    const sorted = categoriesWithStats.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === "count") {
        comparison = a.count - b.count;
      } else if (sortBy === "value") {
        comparison = a.totalValue - b.totalValue;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
    
    setCategories(sorted);
  };

  useEffect(() => {
    extractCategories();
  }, [sortBy, sortOrder, products]);

  const handleRenameCategory = async () => {
    if (!newCategoryName.trim() || !editingCategory) {
      toast.error("Le nouveau nom de catégorie est requis");
      return;
    }

    if (newCategoryName.trim() === editingCategory.name) {
      toast.info("Le nom est identique");
      setShowRenameModal(false);
      return;
    }

    try {
      // Mettre à jour tous les produits de cette catégorie
      const productsToUpdate = products.filter(p => p.category === editingCategory.name);
      
      if (productsToUpdate.length === 0) {
        toast.warning("Aucun produit trouvé dans cette catégorie");
        return;
      }

      // Mettre à jour chaque produit
      const updatePromises = productsToUpdate.map(product =>
        api.put(`/stock/products/${product._id}`, {
          ...product,
          category: newCategoryName.trim()
        })
      );

      await Promise.all(updatePromises);
      toast.success(`Catégorie renommée : ${productsToUpdate.length} produit(s) mis à jour`);
      fetchProducts();
      setShowRenameModal(false);
      setEditingCategory(null);
      setNewCategoryName("");
    } catch (error) {
      console.error("Erreur renommage catégorie:", error);
      toast.error("Erreur lors du renommage de la catégorie");
    }
  };

  const handleDeleteCategory = async (categoryName) => {
    const productsInCategory = products.filter(p => p.category === categoryName);
    
    if (productsInCategory.length > 0) {
      const confirmMessage = `Cette catégorie contient ${productsInCategory.length} produit(s). Voulez-vous supprimer la catégorie de tous ces produits ?`;
      if (!window.confirm(confirmMessage)) return;

      try {
        // Supprimer la catégorie de tous les produits (mettre à null)
        const updatePromises = productsInCategory.map(product =>
          api.put(`/stock/products/${product._id}`, {
            ...product,
            category: null
          })
        );

        await Promise.all(updatePromises);
        toast.success(`Catégorie supprimée : ${productsInCategory.length} produit(s) mis à jour`);
        fetchProducts();
      } catch (error) {
        console.error("Erreur suppression catégorie:", error);
        toast.error("Erreur lors de la suppression de la catégorie");
      }
    } else {
      toast.info("Catégorie vide, aucune action nécessaire");
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fr-CA", {
      style: "currency",
      currency: "CAD",
    }).format(amount || 0);
  };

  const handleExportPDF = () => {
    try {
      if (filteredCategories.length === 0) {
        toast.warning("Aucune donnée à exporter");
        return;
      }

      const columns = [
        { key: 'name', label: 'Catégorie' },
        { key: 'count', label: 'Nombre de produits' },
        { key: 'totalValue', label: 'Valeur totale', accessor: (item) => formatCurrency(item.totalValue) },
        { key: 'totalSaleValue', label: 'Valeur de vente', accessor: (item) => formatCurrency(item.totalSaleValue) },
      ];

      exportToPDF(filteredCategories, columns, `categories-${new Date().toISOString().split('T')[0]}`, 'Catégories de Produits');
      toast.success("Export PDF réussi !");
    } catch (error) {
      console.error("Erreur export PDF:", error);
      toast.error("Erreur lors de l'export PDF");
    }
  };

  const handleExportExcel = () => {
    try {
      if (filteredCategories.length === 0) {
        toast.warning("Aucune donnée à exporter");
        return;
      }

      const columns = [
        { key: 'name', label: 'Catégorie' },
        { key: 'count', label: 'Nombre de produits' },
        { key: 'totalValue', label: 'Valeur totale', accessor: (item) => formatCurrency(item.totalValue) },
        { key: 'totalSaleValue', label: 'Valeur de vente', accessor: (item) => formatCurrency(item.totalSaleValue) },
      ];

      exportToExcel(filteredCategories, columns, `categories-${new Date().toISOString().split('T')[0]}`, 'Catégories');
      toast.success("Export Excel réussi !");
    } catch (error) {
      console.error("Erreur export Excel:", error);
      toast.error("Erreur lors de l'export Excel");
    }
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                Gestion des Catégories
              </h1>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Organisez vos produits par catégories
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode(viewMode === "table" ? "cards" : "table")}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
                title={viewMode === "table" ? "Vue cartes" : "Vue tableau"}
              >
                {viewMode === "table" ? <FaTh /> : <FaList />}
              </button>
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
                  setCategoryName("");
                  setShowModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 font-semibold transition-colors shadow-md hover:shadow-lg"
              >
                <FaPlus /> Informations
              </button>
            </div>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-6 mb-6`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <FaSearch
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    darkMode ? "text-gray-400" : "text-gray-400"
                  }`}
                />
                <input
                  type="text"
                  placeholder="Rechercher une catégorie..."
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
            <div className="flex items-center gap-2">
              <FaFilter className={darkMode ? "text-gray-400" : "text-gray-500"} />
              <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Trier par:</span>
              <select
                value={sortBy}
                onChange={(e) => handleSort(e.target.value)}
                className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                }`}
              >
                <option value="name">Nom</option>
                <option value="count">Nombre de produits</option>
                <option value="value">Valeur totale</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className={`p-2 rounded-lg ${darkMode ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}
              >
                {sortOrder === "asc" ? <FaSortAmountUp /> : <FaSortAmountDown />}
              </button>
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        {categories.length > 0 && (
          <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-6 mb-6`}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-blue-50"}`}>
                <p className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-blue-600"}`}>Total catégories</p>
                <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-blue-900"}`}>{categories.length}</p>
              </div>
              <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-green-50"}`}>
                <p className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-green-600"}`}>Total produits</p>
                <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-green-900"}`}>
                  {categories.reduce((sum, cat) => sum + cat.count, 0)}
                </p>
              </div>
              <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-yellow-50"}`}>
                <p className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-yellow-600"}`}>Valeur totale</p>
                <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-yellow-900"}`}>
                  {formatCurrency(categories.reduce((sum, cat) => sum + cat.totalValue, 0))}
                </p>
              </div>
              <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-purple-50"}`}>
                <p className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-purple-600"}`}>Valeur de vente</p>
                <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-purple-900"}`}>
                  {formatCurrency(categories.reduce((sum, cat) => sum + cat.totalSaleValue, 0))}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Liste des catégories */}
        {filteredCategories.length === 0 ? (
          <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-12 text-center`}>
            <FaTags className={`text-6xl mx-auto mb-4 ${darkMode ? "text-gray-600" : "text-gray-400"}`} />
            <p className={`text-lg font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              {searchTerm ? "Aucune catégorie trouvée" : "Aucune catégorie trouvée"}
            </p>
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              {searchTerm 
                ? "Essayez avec un autre terme de recherche"
                : "Les catégories sont créées automatiquement lors de l'ajout de produits"}
            </p>
          </div>
        ) : viewMode === "table" ? (
          <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      <button
                        onClick={() => handleSort("name")}
                        className={`flex items-center gap-2 ${darkMode ? "text-gray-300" : "text-gray-500"} hover:underline`}
                      >
                        <span>Catégorie</span>
                        {sortBy === "name" && (sortOrder === "asc" ? <FaSortAmountUp /> : <FaSortAmountDown />)}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      <button
                        onClick={() => handleSort("count")}
                        className={`flex items-center gap-2 ${darkMode ? "text-gray-300" : "text-gray-500"} hover:underline`}
                      >
                        <span>Produits</span>
                        {sortBy === "count" && (sortOrder === "asc" ? <FaSortAmountUp /> : <FaSortAmountDown />)}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      <button
                        onClick={() => handleSort("value")}
                        className={`flex items-center gap-2 ${darkMode ? "text-gray-300" : "text-gray-500"} hover:underline`}
                      >
                        <span>Valeur totale</span>
                        {sortBy === "value" && (sortOrder === "asc" ? <FaSortAmountUp /> : <FaSortAmountDown />)}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      <span className={darkMode ? "text-gray-300" : "text-gray-500"}>Valeur de vente</span>
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                      <span className={darkMode ? "text-gray-300" : "text-gray-500"}>Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? "divide-gray-700 bg-gray-800" : "divide-gray-200 bg-white"}`}>
                  {filteredCategories.map((category, index) => (
                    <tr
                      key={index}
                      className={`hover:${darkMode ? "bg-gray-700" : "bg-gray-50"} transition-colors cursor-pointer`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? "text-white" : "text-gray-900"}`}>
                        <div className="flex items-center gap-2">
                          <FaTags className={darkMode ? "text-blue-400" : "text-blue-600"} />
                          <span className="font-semibold">{category.name}</span>
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                        <div className="flex items-center gap-2">
                          <FaBox className="text-xs" />
                          {category.count} {category.count > 1 ? "produits" : "produit"}
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                        {formatCurrency(category.totalValue)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap font-semibold ${darkMode ? "text-green-400" : "text-green-600"}`}>
                        {formatCurrency(category.totalSaleValue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setEditingCategory(category);
                              setNewCategoryName(category.name);
                              setShowRenameModal(true);
                            }}
                            className={`text-yellow-600 hover:text-yellow-900 ${darkMode ? "dark:text-yellow-400 dark:hover:text-yellow-200" : ""}`}
                            title="Renommer"
                          >
                            <FaEdit className="inline text-lg" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.name)}
                            className={`text-red-600 hover:text-red-900 ${darkMode ? "dark:text-red-400 dark:hover:text-red-200" : ""}`}
                            title="Supprimer"
                          >
                            <FaTrash className="inline text-lg" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category, index) => (
              <div
                key={index}
                className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-lg shadow-md p-6 border cursor-pointer hover:shadow-lg transition-shadow`}
                onClick={() => setSelectedCategory(category)}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className={`text-xl font-semibold flex items-center gap-2 ${darkMode ? "text-white" : "text-gray-800"}`}>
                    <FaTags className="text-blue-500" />
                    {category.name}
                  </h3>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        setEditingCategory(category);
                        setNewCategoryName(category.name);
                        setShowRenameModal(true);
                      }}
                      className={`text-yellow-600 hover:text-yellow-900 ${darkMode ? "dark:text-yellow-400 dark:hover:text-yellow-200" : ""}`}
                      title="Renommer"
                    >
                      <FaEdit className="text-lg" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.name)}
                      className={`text-red-600 hover:text-red-900 ${darkMode ? "dark:text-red-400 dark:hover:text-red-200" : ""}`}
                      title="Supprimer"
                    >
                      <FaTrash className="text-lg" />
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className={`p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                    <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Nombre de produits</p>
                    <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {category.count} {category.count > 1 ? "produits" : "produit"}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-blue-50"}`}>
                    <p className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-blue-600"}`}>Valeur totale</p>
                    <p className={`text-xl font-semibold ${darkMode ? "text-white" : "text-blue-900"}`}>
                      {formatCurrency(category.totalValue)}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-green-50"}`}>
                    <p className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-green-600"}`}>Valeur de vente</p>
                    <p className={`text-xl font-semibold ${darkMode ? "text-white" : "text-green-900"}`}>
                      {formatCurrency(category.totalSaleValue)}
                    </p>
                  </div>
                </div>
                {category.products.length > 0 && (
                  <div className={`mt-4 pt-4 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                    <p className={`text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                      Exemples de produits :
                    </p>
                    <div className="space-y-1">
                      {category.products.slice(0, 3).map(product => (
                        <p key={product._id} className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          • {product.name} ({product.quantity} {product.unit || "unité"})
                        </p>
                      ))}
                      {category.products.length > 3 && (
                        <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                          ... et {category.products.length - 3} autre(s)
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Modal Informations */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
            <div className={`relative p-8 rounded-lg shadow-xl w-full max-w-md ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"}`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Information sur les catégories</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className={`text-gray-500 hover:text-gray-700 ${darkMode ? "hover:text-gray-300" : ""}`}
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
              <div className="space-y-4">
                <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
                  Les catégories sont créées automatiquement lorsque vous ajoutez des produits avec une catégorie.
                </p>
                <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
                  Pour créer une nouvelle catégorie, ajoutez un produit et spécifiez sa catégorie.
                </p>
                <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
                  Vous pouvez renommer une catégorie pour mettre à jour tous les produits associés.
                </p>
                <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
                  La suppression d'une catégorie retirera la catégorie de tous les produits associés.
                </p>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Compris
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Renommer */}
        {showRenameModal && editingCategory && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
            <div className={`relative p-8 rounded-lg shadow-xl w-full max-w-md ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"}`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Renommer la catégorie</h3>
                <button
                  onClick={() => {
                    setShowRenameModal(false);
                    setEditingCategory(null);
                    setNewCategoryName("");
                  }}
                  className={`text-gray-500 hover:text-gray-700 ${darkMode ? "hover:text-gray-300" : ""}`}
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Nom actuel
                  </label>
                  <p className={`p-2 rounded-md ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                    {editingCategory.name}
                  </p>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Nouveau nom *
                  </label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className={`w-full p-2 rounded-md border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-100 border-gray-300 text-gray-900"}`}
                    placeholder="Nouveau nom de catégorie"
                    required
                  />
                </div>
                <div className={`p-3 rounded-lg ${darkMode ? "bg-yellow-900 text-yellow-200" : "bg-yellow-100 text-yellow-800"}`}>
                  <p className="text-sm">
                    <strong>Attention:</strong> Cette action mettra à jour {editingCategory.count} produit(s) associé(s) à cette catégorie.
                  </p>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowRenameModal(false);
                      setEditingCategory(null);
                      setNewCategoryName("");
                    }}
                    className={`px-4 py-2 rounded-md ${darkMode ? "bg-gray-600 hover:bg-gray-500 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleRenameCategory}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Renommer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Détails Catégorie */}
        {selectedCategory && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
            <div className={`relative p-8 rounded-lg shadow-xl w-full max-w-3xl ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"}`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <FaTags className="text-blue-500" />
                  {selectedCategory.name}
                </h3>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`text-gray-500 hover:text-gray-700 ${darkMode ? "hover:text-gray-300" : ""}`}
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                  <p className={`text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Nombre de produits</p>
                  <p className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {selectedCategory.count}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-blue-50"}`}>
                  <p className={`text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-blue-600"}`}>Valeur totale</p>
                  <p className={`text-3xl font-bold ${darkMode ? "text-white" : "text-blue-900"}`}>
                    {formatCurrency(selectedCategory.totalValue)}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-green-50"}`}>
                  <p className={`text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-green-600"}`}>Valeur de vente</p>
                  <p className={`text-3xl font-bold ${darkMode ? "text-white" : "text-green-900"}`}>
                    {formatCurrency(selectedCategory.totalSaleValue)}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-purple-50"}`}>
                  <p className={`text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-purple-600"}`}>Valeur moyenne</p>
                  <p className={`text-3xl font-bold ${darkMode ? "text-white" : "text-purple-900"}`}>
                    {formatCurrency(selectedCategory.count > 0 ? selectedCategory.totalValue / selectedCategory.count : 0)}
                  </p>
                </div>
              </div>
              {selectedCategory.products.length > 0 && (
                <div>
                  <h4 className={`text-lg font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-800"}`}>
                    Produits dans cette catégorie ({selectedCategory.products.length})
                  </h4>
                  <div className={`overflow-x-auto max-h-96 overflow-y-auto ${darkMode ? "bg-gray-700" : "bg-gray-50"} rounded-lg p-4`}>
                    <table className="min-w-full">
                      <thead>
                        <tr className={darkMode ? "text-gray-300" : "text-gray-600"}>
                          <th className="text-left px-4 py-2">Produit</th>
                          <th className="text-left px-4 py-2">Référence</th>
                          <th className="text-right px-4 py-2">Quantité</th>
                          <th className="text-right px-4 py-2">Prix d'achat</th>
                          <th className="text-right px-4 py-2">Prix de vente</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedCategory.products.map(product => (
                          <tr key={product._id} className={darkMode ? "border-gray-600" : "border-gray-200"}>
                            <td className={`px-4 py-2 ${darkMode ? "text-white" : "text-gray-900"}`}>{product.name}</td>
                            <td className={`px-4 py-2 font-mono text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{product.reference}</td>
                            <td className={`px-4 py-2 text-right ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                              {product.quantity} {product.unit || "unité"}
                            </td>
                            <td className={`px-4 py-2 text-right ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                              {formatCurrency(product.pricePurchase)}
                            </td>
                            <td className={`px-4 py-2 text-right font-semibold ${darkMode ? "text-green-400" : "text-green-600"}`}>
                              {formatCurrency(product.priceSale)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setEditingCategory(selectedCategory);
                    setNewCategoryName(selectedCategory.name);
                    setShowRenameModal(true);
                  }}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
                >
                  Renommer
                </button>
                <button
                  onClick={() => setSelectedCategory(null)}
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

export default CategoriesPage;
