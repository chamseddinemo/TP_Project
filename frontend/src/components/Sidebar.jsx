import React, { useState, useEffect, useContext } from "react";
import {
  FaChartLine,
  FaUsers,
  FaBox,
  FaShoppingCart,
  FaMoneyBill,
  FaTools,
  FaCog,
  FaSignOutAlt,
  FaChevronDown,
  FaMoon,
  FaSun,
  FaBars,
  FaTimes
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Sidebar = ({ role }) => {
  const navigate = useNavigate();
  const location = useLocation(); // Pour détecter la page active
  const auth = useContext(AuthContext);
  const user = auth?.user;

  const menus = [
    { title: "Tableau de bord", icon: <FaChartLine />, path: "/dashboard/admin", color: "from-blue-500 to-blue-600" },
    { title: "Ressources humaines", icon: <FaUsers />, color: "from-green-500 to-green-600", subMenus: [
      { title: "Employés", path: "/rh/employes" },
      { title: "Recrutement", path: "/rh/recrutement" },
      { title: "Feuilles de temps", path: "/rh/temps" },
      { title: "Paie & contrats", path: "/rh/paie" }
    ]},
    { title: "Stocks & produits", icon: <FaBox />, color: "from-yellow-500 to-yellow-600", subMenus: [
      { title: "Produits", path: "/stock/produits" },
      { title: "Catégories", path: "/stock/categories" },
      { title: "Inventaire", path: "/stock/inventaire" },
      { title: "Fournisseurs", path: "/stock/fournisseurs" }
    ]},
    { title: "Ventes & achats", icon: <FaShoppingCart />, color: "from-orange-500 to-orange-600", subMenus: [
      { title: "Commandes", path: "/vente/commandes" },
      { title: "Facturation", path: "/vente/factures" },
      { title: "Achats", path: "/achat/achats" },
      { title: "Devis & bons", path: "/achat/devis" }
    ]},
    { title: "Finance", icon: <FaMoneyBill />, color: "from-teal-500 to-teal-600", subMenus: [
      { title: "Transactions", path: "/finance/transactions" },
      { title: "Salaires", path: "/finance/salaires" },
      { title: "Rapports financiers", path: "/finance/rapports" },
      { title: "Budgets & prévisions", path: "/finance/budgets" }
    ]},
    { title: "Équipements & maintenance", icon: <FaTools />, color: "from-purple-500 to-purple-600", subMenus: [
      { title: "Équipements", path: "/equipements/liste" },
      { title: "Maintenance", path: "/equipements/maintenance" },
      { title: "Historique", path: "/equipements/historique" }
    ]},
    { title: "Paramètres", icon: <FaCog />, color: "from-gray-500 to-gray-600", subMenus: [
      { title: "Rôles & accès", path: "/settings/roles" },
      { title: "Sécurité", path: "/settings/securite" },
      { title: "Journal d’activité", path: "/settings/journal" },
      { title: "Système", path: "/settings/systeme" }
    ]}
  ];

  // Filtrer les menus en fonction du rôle (exemple simple : admin voit tout, user voit moins)
  const filteredMenus = menus.filter(menu => {
    if (role === 'admin') return true;
    // Exemple : masquer certains menus pour les rôles non-admin
    if (role === 'user' && ['Paramètres'].includes(menu.title)) return false;
    return true;
  });

  const [openMenus, setOpenMenus] = useState({});
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [query, setQuery] = useState("");
  const [tileView, setTileView] = useState(true);

  // Charger les préférences depuis localStorage
  useEffect(() => {
    try {
      const savedDark = localStorage.getItem("erp_sidebar_dark");
      const savedCollapsed = localStorage.getItem("erp_sidebar_collapsed");
      const savedTiles = localStorage.getItem("erp_sidebar_tiles");
      if (savedDark !== null) setDarkMode(savedDark === "true");
      if (savedCollapsed !== null) setCollapsed(savedCollapsed === "true");
      if (savedTiles !== null) setTileView(savedTiles === "true");
    } catch {}
  }, []);

  // Persister les préférences
  useEffect(() => {
    try {
      localStorage.setItem("erp_sidebar_dark", String(darkMode));
    } catch {}
  }, [darkMode]);

  useEffect(() => {
    try {
      localStorage.setItem("erp_sidebar_collapsed", String(collapsed));
    } catch {}
  }, [collapsed]);

  useEffect(() => {
    try {
      localStorage.setItem("erp_sidebar_tiles", String(tileView));
    } catch {}
  }, [tileView]);

  // Appliquer le thème global au site en ajoutant/retirant la classe 'light' sur le body
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('light', !darkMode);
    }
  }, [darkMode]);

  // Écouter les changements de thème provenant de la Navbar
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const handler = (e) => {
      if (e?.detail?.dark !== undefined) {
        setDarkMode(!!e.detail.dark);
      }
    };
    document.addEventListener('erp-theme', handler);
    return () => document.removeEventListener('erp-theme', handler);
  }, []);

  // Synchroniser l'état 'collapsed' globalement pour permettre un layout réactif
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('sidebar-collapsed', collapsed);
    }
  }, [collapsed]);

  // Ouvrir automatiquement le menu si la page active est dans un sous-menu
  useEffect(() => {
    menus.forEach(menu => {
      if (menu.subMenus) {
        const isActive = menu.subMenus.some(sub => location.pathname.startsWith(sub.path));
        if (isActive) {
          setOpenMenus(prev => ({ ...prev, [menu.title]: true }));
        }
      }
    });
  }, [location.pathname]);

  const toggleMenu = (title) => setOpenMenus(prev => ({ ...prev, [title]: !prev[title] }));
  const toggleSidebar = () => setCollapsed(!collapsed);
  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleTileView = () => setTileView(!tileView);

  // Menus avec badges (exemples; à relier à de vraies données plus tard)
  const menusWithBadges = menus.map(m => {
    if (!m.subMenus) return m;
    const subMenus = m.subMenus.map(s => {
      if (["Commandes clients", "Facturation"].includes(s.title)) {
        return { ...s, badge: s.title === "Commandes clients" ? 5 : 2 };
      }
      return s;
    });
    return { ...m, subMenus };
  });

  // Filtrage par recherche
  const normalized = (t) => (t || "").toLowerCase();
  const displayMenus = (query ? menusWithBadges : filteredMenus).map(m => {
    if (!query) return m;
    const q = normalized(query);
    const hitTitle = normalized(m.title).includes(q);
    if (hitTitle || !m.subMenus) return m;
    const sub = m.subMenus.filter(s => normalized(s.title).includes(q));
    return { ...m, subMenus: sub };
  }).filter(m => m && (m.title || (m.subMenus && m.subMenus.length)));

  // Section headers mapping (simple regroupement)
  const sectionFor = (title) => {
    if (title === "Tableau de bord") return "Général";
    if (title === "Ressources humaines") return "RH";
    if (title === "Stocks & produits") return "Stocks";
    if (title === "Ventes & achats") return "Ventes & achats";
    if (title === "Finance") return "Finance";
    if (title === "Équipements & maintenance") return "Équipements";
    if (title === "Paramètres") return "Administration";
    return null;
  };

  return (
    <aside
      role="navigation"
      aria-label="Barre latérale"
      className={`${darkMode ? "bg-gradient-to-b from-gray-950 to-gray-900 text-white" : "bg-gradient-to-b from-white to-gray-100 text-gray-900"} 
                      h-screen flex flex-col transition-all duration-500 ease-in-out 
                      ${collapsed ? "w-20" : "w-80"} shadow-2xl border-r ${darkMode ? "border-gray-800" : "border-gray-200"} 
                      backdrop-blur-xl bg-opacity-90 z-50`}
    >

      {/* Logo + Toggle */}
      <div className={`flex items-center justify-between p-6 border-b ${darkMode ? "border-gray-800" : "border-gray-200"}`}>
        {/* Branding retiré pour un rendu épuré */}
        <button
          onClick={toggleSidebar}
          aria-label={collapsed ? "Ouvrir la barre latérale" : "Réduire la barre latérale"}
          className={`p-3 rounded-full transition-all duration-300 hover:scale-110 ${darkMode ? "hover:bg-gray-800" : "hover:bg-gray-200"}`}
        >
          {collapsed ? <FaBars className="text-xl" /> : <FaTimes className="text-xl" />}
        </button>
      </div>

      {/* Profil utilisateur (compact) */}
      <div className={`px-5 py-4 ${darkMode ? "border-b border-gray-800" : "border-b border-gray-200"}`}>
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          <div className={`h-10 w-10 rounded-full ${darkMode ? "bg-gradient-to-br from-blue-500/30 to-purple-500/30" : "bg-gradient-to-br from-blue-400/20 to-purple-400/20"} ring-2 ring-transparent` } title="Compte" />
          {/* Informations détaillées retirées pour un rendu plus pro/compact */}
        </div>
      </div>

      {/* Recherche déplacée en Navbar */}

      {/* Mode & Vue */}
      <div className={`p-4 border-b ${darkMode ? "border-gray-800" : "border-gray-200"} flex items-center gap-3`}>
        <button
          onClick={toggleDarkMode}
          aria-pressed={darkMode}
          className={`flex items-center gap-0 p-2.5 rounded-lg hover:scale-105 transition-all duration-300 w-full justify-center ${darkMode ? "hover:bg-gray-800" : "hover:bg-gray-200"}`}
          title={darkMode ? "Thème clair" : "Thème sombre"}
        >
          {darkMode ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-blue-400" />}
        </button>
        {!collapsed && (
          <button
            onClick={toggleTileView}
            aria-pressed={tileView}
            className={`flex items-center gap-0 p-2.5 rounded-lg transition-all duration-300 ${darkMode ? "hover:bg-gray-800" : "hover:bg-gray-200"}`}
            title={tileView ? "Vue tuiles" : "Vue liste"}
          >
            <span className="text-xs font-semibold" style={{visibility:'hidden', width:0, display:'inline-block'}}>{tileView ? "Tuiles" : "Liste"}</span>
        </button>
        )}
      </div>

      {/* Actions rapides déplacées en Navbar */}

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto mt-2 px-2 custom-scrollbar" aria-label="Navigation principale">
        {tileView && !collapsed && (
          <div className="grid grid-cols-1 gap-3 px-1">
            {displayMenus.map(menu => {
              const isActive = location.pathname.startsWith(menu.path) || (menu.subMenus && menu.subMenus.some(sub => location.pathname.startsWith(sub.path)));
              const section = sectionFor(menu.title);
              return (
                <div key={menu.title}>
                  {!collapsed && section && (
                    <div className={`px-1 py-1 text-xs tracking-wide uppercase ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{section}</div>
                  )}
                  <div
                    onClick={() => menu.subMenus ? toggleMenu(menu.title) : navigate(menu.path)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); menu.subMenus ? toggleMenu(menu.title) : navigate(menu.path); } }}
                    role="button"
                    tabIndex={0}
                    className={`card ring-soft ${darkMode ? "bg-white/5" : "panel-light"} cursor-pointer transition-all duration-300 ${isActive ? "ring-2" : "hover:shadow"}`}
                    style={{ padding: 14 }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{menu.title}</div>
                        {menu.subMenus && (
                          <div className="mt-2 flex flex-col gap-1">
                            {menu.subMenus.map((sub) => (
                              <div
                                key={sub.title}
                                onClick={(e)=>{e.stopPropagation(); navigate(sub.path);}}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e)=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); e.stopPropagation(); navigate(sub.path);} }}
                                className={`p-2 text-sm rounded-md cursor-pointer transition-colors ${darkMode ? "bg-white/5 hover:bg-white/10 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-800"}`}
                              >
                                {sub.title}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {(!tileView || collapsed) && displayMenus.map(menu => {
          const isActive = location.pathname.startsWith(menu.path) || (menu.subMenus && menu.subMenus.some(sub => location.pathname.startsWith(sub.path)));
          const section = sectionFor(menu.title);
          return (
            <div key={menu.title} className="group mb-2">
              {!collapsed && section && (
                <div className={`px-3 py-1 text-xs tracking-wide uppercase ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{section}</div>
              )}
              <div
                onClick={() => menu.subMenus ? toggleMenu(menu.title) : navigate(menu.path)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); menu.subMenus ? toggleMenu(menu.title) : navigate(menu.path); } }}
                role="button"
                tabIndex={0}
                className={`relative flex items-center justify-between p-3.5 cursor-pointer transition-all duration-300 rounded-xl m-1 bg-gradient-to-r ${menu.color} bg-opacity-20 hover:bg-opacity-40 ${isActive ? "ring-2 ring-white/60 shadow-lg" : "hover:shadow"}`}
                title={collapsed ? menu.title : ""}
                aria-expanded={!!menu.subMenus && !!openMenus[menu.title]}
                aria-current={isActive ? "page" : undefined}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-white/80" />
                )}
                <div className="flex items-center gap-2">
                  {!collapsed && <span className={`font-medium ${isActive ? "text-white" : ""}`}>{menu.title}</span>}
                </div>
                {menu.subMenus && !collapsed && (
                  <FaChevronDown className={`transition-transform duration-300 ${openMenus[menu.title] ? "rotate-180" : ""} ${isActive ? "text-white" : ""}`} />
                )}
              </div>

              {menu.subMenus && openMenus[menu.title] && !collapsed && (
                <div className={`pl-12 flex flex-col gap-1.5 ${darkMode ? "text-gray-300 border-l-4 border-gray-700" : "text-gray-600 border-l-4 border-gray-300"} ml-4 animate-fade-in`}>
                  {menu.subMenus.map(sub => {
                    const isSubActive = location.pathname.startsWith(sub.path);
                    return (
                      <div
                        key={sub.title}
                        onClick={() => navigate(sub.path)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(sub.path); } }}
                        role="button"
                        tabIndex={0}
                        className={`p-2.5 text-sm cursor-pointer transition-all duration-200 rounded-lg ${darkMode ? "hover:text-white hover:bg-gray-800" : "hover:text-gray-900 hover:bg-gray-200"} hover:scale-[1.02] ${isSubActive ? (darkMode ? "text-white bg-gray-800" : "text-gray-900 bg-gray-200") : ""} flex items-center justify-between`}
                      >
                        <span>{sub.title}</span>
                        {typeof sub.badge === 'number' && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${darkMode ? "bg-white/10 text-white" : "bg-gray-200 text-gray-800"}`}>{sub.badge}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Déconnexion */}
      <div
        className={`p-4 ${darkMode ? "border-t border-gray-800" : "border-t border-gray-200"} flex items-center gap-3 cursor-pointer hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 transition-all duration-300 rounded-xl m-2 hover:scale-105`}
        onClick={() => alert("Déconnexion")}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); alert('Déconnexion'); } }}
        title={collapsed ? "Déconnexion" : ""}
      >
        <FaSignOutAlt className="text-lg"/>
        {!collapsed && <span className="font-semibold">Déconnexion</span>}
      </div>
    </aside>
  );
};

export default Sidebar;
