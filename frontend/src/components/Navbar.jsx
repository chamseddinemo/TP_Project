import React, { useContext, useState, useRef, useEffect, memo } from "react";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaUserCircle, FaChevronDown, FaEnvelope, FaUser, FaShieldAlt, FaEdit, FaLock, FaSun, FaMoon } from "react-icons/fa";

const Navbar = memo(() => {
  const { user, logout } = useContext(AuthContext);
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Fermer le dropdown si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setShowDropdown(false);
  };

  const getRoleLabel = (role) => {
    const labels = {
      admin: "Administrateur",
      employee: "Employé",
      client: "Client",
      stock: "Gestionnaire Stock",
      vente: "Vente",
      achat: "Achat",
      rh: "Ressources Humaines",
      comptable: "Comptable",
      technicien: "Technicien"
    };
    return labels[role] || role;
  };

  return (
    <nav className={`${darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-200'} shadow-md border-b px-6 py-4 flex justify-between items-center fixed top-0 left-0 right-0 z-50 w-full h-[73px] transition-colors duration-300`}>
      <div className="flex items-center gap-3">
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>ERP-TP</h2>
      </div>
      
      <div className="flex items-center gap-4">
        {user && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 cursor-pointer ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <FaUserCircle className={`text-2xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              <div className="text-right hidden md:block">
                <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{user.name}</p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{getRoleLabel(user.role)}</p>
              </div>
              <FaChevronDown className={`text-xs transition-transform duration-200 ${darkMode ? 'text-gray-400' : 'text-gray-500'} ${showDropdown ? "rotate-180" : ""}`} />
            </button>

            {/* Menu déroulant */}
            {showDropdown && (
              <div className={`absolute right-0 mt-2 w-72 rounded-lg shadow-xl border py-2 z-50 transition-colors duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                {/* Nom de l'utilisateur en haut */}
                <div className={`px-4 py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-3">
                    <FaUserCircle className="text-blue-600 text-3xl" />
                    <div>
                      <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{user.name}</p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{getRoleLabel(user.role)}</p>
                    </div>
                  </div>
                </div>

                {/* Actions du menu */}
                <div className="py-2">
                  {/* Modifier le profil */}
                  <button
                    onClick={() => {
                      navigate("/admin/profile");
                      setShowDropdown(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors duration-200 ${darkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    <FaEdit className="text-blue-600" />
                    <span>Modifier le profil</span>
                  </button>

                  {/* Réinitialiser le mot de passe */}
                  <button
                    onClick={() => {
                      navigate("/admin/profile?tab=password");
                      setShowDropdown(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors duration-200 ${darkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    <FaLock className="text-orange-600" />
                    <span>Réinitialiser le mot de passe</span>
                  </button>

                  {/* Mode Sombre / Mode Clair */}
                  <button
                    onClick={() => {
                      toggleTheme();
                      setShowDropdown(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors duration-200 ${darkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    {darkMode ? (
                      <>
                        <FaSun className="text-yellow-500" />
                        <span>Mode Clair</span>
                      </>
                    ) : (
                      <>
                        <FaMoon className="text-indigo-600" />
                        <span>Mode Sombre</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Informations détaillées */}
                <div className={`px-4 py-2 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className={`flex items-center gap-3 py-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <FaEnvelope className="text-gray-400" />
                    <span>{user.email}</span>
                  </div>
                </div>

                {/* Bouton déconnexion */}
                <div className={`px-4 py-2 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 shadow-sm hover:shadow-md"
                  >
                    <FaSignOutAlt /> Déconnexion
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
});

Navbar.displayName = "Navbar";

export default Navbar;
