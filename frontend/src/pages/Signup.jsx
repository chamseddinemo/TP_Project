import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("vente");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/signup", { name, email, password, role });
      alert("Utilisateur créé ✅");
      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.message || "Erreur signup");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto" }}>
      <h2>Signup</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <select value={role} onChange={e => setRole(e.target.value)}>
          <option value="vente">Vente</option>
          <option value="achat">Achat</option>
          <option value="stock">Stock</option>
          <option value="rh">RH</option>
          <option value="comptable">Finance</option>
          <option value="technicien">Technicien</option>
        </select>
        <button type="submit">Signup</button>
      </form>
    </div>
  );
};

export default Signup;
