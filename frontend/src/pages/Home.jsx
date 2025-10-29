import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      switch (user.role) {
        case "admin": navigate("/dashboard/admin"); break;
        case "stock": navigate("/dashboard/stock"); break;
        case "vente": navigate("/dashboard/vente"); break;
        case "achat": navigate("/dashboard/achat"); break;
        case "rh": navigate("/dashboard/rh"); break;
        case "comptable": navigate("/dashboard/finance"); break;
        case "technicien": navigate("/dashboard/equipement"); break;
        default: break;
      }
    }
  }, [user]);

  return (
    <div style={{ display: "grid", placeItems: "center", minHeight: "100vh", padding: 24 }}>
      <div className="card" style={{ textAlign: "center", maxWidth: 640 }}>
        <h1 style={{ marginBottom: 10 }}>Bienvenue sur ERP-TP</h1>
        <p style={{ marginBottom: 20 }}>Gérez vos ventes, stocks, RH, achats, finance et équipements.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button className="btn btn-primary" onClick={() => navigate("/login")}>Se connecter</button>
          <button className="btn" onClick={() => navigate("/signup")}>Créer un compte</button>
        </div>
      </div>
    </div>
  );
};

export default Home;
