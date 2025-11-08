import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  FaChartLine,
  FaUsers,
  FaBox,
  FaShoppingCart,
  FaMoneyBill,
  FaTools,
  FaCog,
  FaBell,
  FaChevronDown,
  FaBars,
  FaTimes
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { useSidebar } from "../context/SidebarContext";
import { useTheme } from "../context/ThemeContext";
import { rolePermissions } from "../utils/rolePermissions";

// Déplacer allMenus en dehors du composant pour éviter les recréations
const allMenus = [
  {
    title: "Tableau de bord",
    icon: FaChartLine,
    path: "/dashboard/admin",
    color: "from-blue-500 to-blue-600",
    getPath: (role) => rolePermissions[role]?.dashboard || "/dashboard/admin"
  },
  {
    title: "RH & Employés",
    icon: FaUsers,
    color: "from-green-500 to-green-600",
    subMenus: [
      { title: "Employés", path: "/rh/employes" },
      { title: "Recrutement", path: "/rh/recrutement" },
      { title: "Feuilles de temps", path: "/rh/temps" },
      { title: "Paie & Contrats", path: "/rh/paie" }
    ]
  },
  {
    title: "Produits & Stocks",
    icon: FaBox,
    color: "from-yellow-500 to-yellow-600",
    subMenus: [
      { title: "Liste produits", path: "/stock/produits" },
      { title: "Catégories", path: "/stock/categories" },
      { title: "Stocks & Inventaire", path: "/stock/inventaire" },
      { title: "Fournisseurs", path: "/stock/fournisseurs" }
    ]
  },
  {
    title: "Équipements",
    icon: FaTools,
    color: "from-purple-500 to-purple-600",
    subMenus: [
      { title: "Liste équipements", path: "/equipements/liste" }
    ]
  },
  {
    title: "Ventes & Achats",
    icon: FaShoppingCart,
    color: "from-orange-500 to-orange-600",
    subMenus: [
      { title: "Commandes clients", path: "/vente/commandes" },
      { title: "Facturation", path: "/vente/factures" },
      { title: "Devis & Bons", path: "/vente/devis" },
      { title: "Achats", path: "/achat/achats" }
    ]
  },
  {
    title: "Finance",
    icon: FaMoneyBill,
    color: "from-teal-500 to-teal-600",
    subMenus: [
      { title: "Transactions", path: "/finance/transactions" },
      { title: "Salaires", path: "/finance/salaires" },
      { title: "Rapports financiers", path: "/finance/rapports" },
      { title: "Budgets & prévisions", path: "/finance/budgets" }
    ]
  },
  {
    title: "Notifications",
    icon: FaBell,
    color: "from-red-500 to-red-600",
    path: "/admin/alerts"
  },
  {
    title: "Paramètres",
    icon: FaCog,
    color: "from-gray-500 to-gray-600",
    subMenus: [
      { title: "Profil", path: "/admin/profile" }
    ]
  }
];

const Sidebar = ({ role }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { collapsed, setCollapsed } = useSidebar();
  const { darkMode } = useTheme();

  // Filtrer les menus selon les permissions du rôle - Mémorisé pour éviter les recalculs
  const filteredMenus = useMemo(() => {
    if (!role || !rolePermissions[role]) return [];
    
    const permissions = rolePermissions[role];
    const allowedMenus = permissions.menus || [];
    
    return allMenus
      .filter(menu => allowedMenus.includes(menu.title))
      .map(menu => {
        // Si c'est le tableau de bord, utiliser le chemin spécifique au rôle
        if (menu.title === "Tableau de bord" && menu.getPath) {
          return { ...menu, path: menu.getPath(role) };
        }
        
        // Filtrer les sous-menus selon les permissions
        if (menu.subMenus && permissions.subMenus && permissions.subMenus[menu.title]) {
          const allowedSubMenus = permissions.subMenus[menu.title];
          return {
            ...menu,
            subMenus: menu.subMenus.filter(sub => allowedSubMenus.includes(sub.title))
          };
        }
        
        return menu;
      });
  }, [role]);

  const [openMenus, setOpenMenus] = useState({});

  // Ouvrir automatiquement le menu si la page active est dans un sous-menu
  useEffect(() => {
    setOpenMenus(prev => {
      const newOpenMenus = {};
      filteredMenus.forEach(menu => {
        if (menu.subMenus) {
          const isActive = menu.subMenus.some(sub => location.pathname.startsWith(sub.path));
          if (isActive) {
            newOpenMenus[menu.title] = true;
          }
        }
      });
      
      // Comparer avec l'état précédent pour éviter les mises à jour inutiles
      const prevKeys = Object.keys(prev).sort();
      const newKeys = Object.keys(newOpenMenus).sort();
      
      if (prevKeys.length !== newKeys.length) {
        return newOpenMenus;
      }
      
      const hasChanges = prevKeys.some(key => !newOpenMenus[key]) ||
                         newKeys.some(key => !prev[key]);
      
      return hasChanges ? newOpenMenus : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, role]); // Utiliser role au lieu de filteredMenus pour éviter la boucle

  const toggleMenu = useCallback((title) => {
    setOpenMenus(prev => ({ ...prev, [title]: !prev[title] }));
  }, []);

  const toggleSidebar = useCallback(() => {
    setCollapsed(!collapsed);
  }, [collapsed, setCollapsed]);

  // Navigation optimisée avec préchargement
  const handleNavigate = useCallback((path) => {
    navigate(path);
  }, [navigate]);

  return (
    <aside className={`${darkMode ? "bg-gradient-to-b from-gray-900 to-gray-800 text-white" : "bg-gradient-to-b from-white to-gray-50 text-gray-900"} 
                      fixed left-0 flex flex-col transition-all duration-300 ease-in-out z-40
                      ${collapsed ? "w-20" : "w-80"} shadow-2xl border-r ${darkMode ? "border-gray-700" : "border-gray-200"}`}
                      style={{ willChange: 'width' }}>

      {/* Toggle Button */}
      <div className={`flex items-center justify-end p-3 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
        <button 
          onClick={toggleSidebar} 
          className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${darkMode ? "hover:bg-gray-700 text-white" : "hover:bg-gray-100 text-gray-700"}`}
        >
          {collapsed ? <FaBars className="text-lg" /> : <FaTimes className="text-lg" />}
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto mt-2 px-2">
        {filteredMenus.length === 0 ? (
          <div className={`p-4 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            {!role ? (
              <p className="text-sm">Chargement...</p>
            ) : (
              <p className="text-sm">Aucun menu disponible</p>
            )}
          </div>
        ) : (
          filteredMenus.map(menu => {
            const isActive = location.pathname.startsWith(menu.path) || (menu.subMenus && menu.subMenus.some(sub => location.pathname.startsWith(sub.path)));
            return (
              <div key={menu.title} className="group mb-2">
                <div
                  onClick={() => menu.subMenus ? toggleMenu(menu.title) : handleNavigate(menu.path)}
                  className={`flex items-center justify-between p-4 cursor-pointer hover:shadow-lg transition-all duration-300 rounded-xl m-1 bg-gradient-to-r ${menu.color} ${darkMode ? "bg-opacity-30 hover:bg-opacity-50" : "bg-opacity-20 hover:bg-opacity-40"} ${isActive ? "ring-2 ring-opacity-50 " + (darkMode ? "ring-white" : "ring-gray-800") : ""}`}
                  title={collapsed ? menu.title : ""}
                >
                  <div className="flex items-center gap-4">
                    <span className={`text-xl ${isActive ? darkMode ? "text-white" : "text-gray-900" : darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      {React.createElement(menu.icon)}
                    </span>
                    {!collapsed && <span className={`font-semibold ${isActive ? darkMode ? "text-white" : "text-gray-900" : darkMode ? "text-gray-200" : "text-gray-700"}`}>{menu.title}</span>}
                  </div>
                  {menu.subMenus && !collapsed && (
                    <FaChevronDown className={`transition-transform duration-300 ${openMenus[menu.title] ? "rotate-180" : ""} ${isActive ? darkMode ? "text-white" : "text-gray-900" : darkMode ? "text-gray-300" : "text-gray-600"}`} />
                  )}
                </div>

                {menu.subMenus && openMenus[menu.title] && !collapsed && (
                  <div className={`pl-12 flex flex-col gap-2 border-l-4 ml-4 animate-fade-in ${darkMode ? "text-gray-300 border-gray-600" : "text-gray-600 border-gray-300"}`}>
                    {menu.subMenus.map(sub => {
                      const isSubActive = location.pathname.startsWith(sub.path);
                      return (
                        <div
                          key={sub.title}
                          onClick={() => handleNavigate(sub.path)}
                          className={`p-3 cursor-pointer hover:scale-105 transition-all duration-200 rounded-lg ${
                            isSubActive 
                              ? darkMode ? "text-white bg-gray-700" : "text-gray-900 bg-gray-100"
                              : darkMode ? "hover:text-white hover:bg-gray-700 text-gray-300" : "hover:text-gray-900 hover:bg-gray-100 text-gray-600"
                          }`}
                        >
                          {sub.title}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </nav>

      {/* Déconnexion - Retiré car maintenant dans la Navbar */}
    </aside>
  );
};

export default Sidebar;
