import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem("erp_sidebar_dark");
      if (saved !== null) setDarkMode(saved === "true");
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("erp_sidebar_dark", String(darkMode));
      document.body.classList.toggle('light', !darkMode);
      document.dispatchEvent(new CustomEvent('erp-theme', { detail: { dark: darkMode } }));
    } catch {}
  }, [darkMode]);

  const initials = (user?.name || "ERP TP").split(" ").map(s => s[0]).slice(0,2).join("").toUpperCase();

  return (
    <nav style={{ padding: "10px 16px", backdropFilter: "blur(10px)", display: "grid", gridTemplateColumns: "220px 1fr auto", alignItems: "center", gap: 12, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(90deg,#3b82f6,#a855f7)", boxShadow: "0 4px 14px rgba(0,0,0,0.2)" }} />
        <h2 style={{ margin: 0, fontSize: 18 }}>ERP-TP</h2>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <input className="input" placeholder="Rechercher..." style={{ flex: 1 }} />
        <button className="btn btn-primary" onClick={() => navigate('/vente/commandes')}>+ Vente</button>
        <button className="btn" onClick={() => navigate('/achat/achats')}>+ Achat</button>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button className="btn" onClick={() => setDarkMode((d)=>!d)}>{darkMode ? "Thème clair" : "Thème sombre"}</button>
        <div title="Compte" style={{ width: 30, height: 30, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.08)' }}>{initials}</div>
        <button className="btn" onClick={handleLogout}>Déconnexion</button>
      </div>
    </nav>
  );
};

export default Navbar;
