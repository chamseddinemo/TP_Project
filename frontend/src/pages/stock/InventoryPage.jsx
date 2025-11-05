import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";
import api from "../../services/api";
import { FaExclamationTriangle, FaCheckCircle, FaBox, FaClipboardList } from "react-icons/fa";
import CardStat from "../../components/CardStat";

const InventoryPage = () => {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, low, out, ok

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get("/stock/products");
      setProducts(data);
    } catch (error) {
      console.error("Erreur récupération produits:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: products.length,
    outOfStock: products.filter(p => p.quantity === 0).length,
    lowStock: products.filter(p => p.quantity > 0 && p.quantity < p.minQuantity).length,
    ok: products.filter(p => p.quantity >= p.minQuantity).length,
    totalValue: products.reduce((sum, p) => sum + (p.quantity * p.pricePurchase || 0), 0)
  };

  const getFilteredProducts = () => {
    switch (filter) {
      case "low":
        return products.filter(p => p.quantity > 0 && p.quantity < p.minQuantity);
      case "out":
        return products.filter(p => p.quantity === 0);
      case "ok":
        return products.filter(p => p.quantity >= p.minQuantity);
      default:
        return products;
    }
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar role={user?.role} />
      <div className="main-content">
        <Navbar />
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Stocks & Inventaire</h1>
          </div>

          <div className="stats-section mb-6">
            <CardStat title="Total produits" value={stats.total} color="#2196F3" />
            <CardStat title="Rupture de stock" value={stats.outOfStock} color="#F44336" />
            <CardStat title="Stock faible" value={stats.lowStock} color="#FF9800" />
            <CardStat title="Stock OK" value={stats.ok} color="#4CAF50" />
            <CardStat title="Valeur totale" value={`${stats.totalValue.toFixed(2)} $`} color="#9C27B0" />
          </div>

          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg ${filter === "all" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
            >
              Tous
            </button>
            <button
              onClick={() => setFilter("low")}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${filter === "low" ? "bg-yellow-600 text-white" : "bg-gray-200 text-gray-700"}`}
            >
              <FaExclamationTriangle /> Stock faible
            </button>
            <button
              onClick={() => setFilter("out")}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${filter === "out" ? "bg-red-600 text-white" : "bg-gray-200 text-gray-700"}`}
            >
              <FaExclamationTriangle /> Rupture
            </button>
            <button
              onClick={() => setFilter("ok")}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${filter === "ok" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"}`}
            >
              <FaCheckCircle /> Stock OK
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Référence</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock actuel</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock min</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valeur stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getFilteredProducts().map((product) => {
                    const status = product.quantity === 0
                      ? { text: "Rupture", color: "bg-red-100 text-red-800", icon: <FaExclamationTriangle /> }
                      : product.quantity < product.minQuantity
                      ? { text: "Stock faible", color: "bg-yellow-100 text-yellow-800", icon: <FaExclamationTriangle /> }
                      : { text: "OK", color: "bg-green-100 text-green-800", icon: <FaCheckCircle /> };
                    const stockValue = (product.quantity * product.pricePurchase || 0).toFixed(2);

                    return (
                      <tr key={product._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-mono">{product.reference}</td>
                        <td className="px-6 py-4">{product.name}</td>
                        <td className="px-6 py-4">{product.category || "-"}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{product.quantity}</span>
                            <span className="text-gray-500">{product.unit}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">{product.minQuantity} {product.unit}</td>
                        <td className="px-6 py-4">{stockValue} $</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 w-fit ${status.color}`}>
                            {status.icon} {status.text}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {getFilteredProducts().length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Aucun produit trouvé avec ce filtre
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;

