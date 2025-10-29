import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(email, password); // AuthContext gère stockage
      // Redirection selon rôle
      switch (data.role) {
        case "admin": navigate("/dashboard/admin"); break;
        case "stock": navigate("/dashboard/stock"); break;
        case "vente": navigate("/dashboard/vente"); break;
        case "achat": navigate("/dashboard/achat"); break;
        case "rh": navigate("/dashboard/rh"); break;
        case "comptable": navigate("/dashboard/finance"); break;
        case "technicien": navigate("/dashboard/equipement"); break;
        default: navigate("/"); break;
      }
    } catch (error) {
      alert(error.response?.data?.message || "Erreur login");
    }
  };

  return (
    <div style={{ display: "grid", placeItems: "center", minHeight: "100vh", padding: "24px" }}>
      <div className="card" style={{ width: "100%", maxWidth: 420 }}>
        <h2 style={{ marginBottom: 16 }}>Connexion</h2>
        <p style={{ marginBottom: 20 }}>Accédez à votre espace ERP-TP</p>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
          <input
            className="input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="input"
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary" style={{ justifyContent: "center" }}>Se connecter</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
