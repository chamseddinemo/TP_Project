import React, { useEffect, useState } from "react";
import AppLayout from "../../components/AppLayout";
import Table from "../../components/Table";
import api from "../../services/api";

const Employes = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/rh/employes");
        setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e.response?.data?.message || e.message || "Erreur chargement");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const columns = ["name", "email", "poste", "departement", "dateEmbauche"]; // adapte selon backend

  return (
    <AppLayout>
      <div className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ marginBottom: 8 }}>Employés</h2>
        <p>Gérez les profils, contrats et statuts.</p>
      </div>

      <div className="card">
        {loading ? (
          <p>Chargement…</p>
        ) : error ? (
          <p style={{ color: "#ef4444" }}>{error}</p>
        ) : (
          <Table columns={columns} data={rows} />
        )}
      </div>
    </AppLayout>
  );
};

export default Employes;


