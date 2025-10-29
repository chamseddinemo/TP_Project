import React from "react";

const DashboardVentes = () => {
  return (
    <div className="card" style={{ background: "linear-gradient(135deg, #f59e0b15 0%, #f59e0b05 100%)", borderLeft: "4px solid #f59e0b" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 24 }}>💰</span>
        <h3 style={{ margin: 0 }}>Ventes</h3>
      </div>
      <p style={{ fontSize: 14, opacity: 0.8, marginBottom: 16 }}>Suivez les ventes, clients et factures.</p>
      <div style={{ display: "grid", gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <span style={{ fontSize: 13, opacity: 0.7 }}>CA du mois</span>
          <span style={{ fontWeight: 600 }}>0 €</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
          <span style={{ fontSize: 13, opacity: 0.7 }}>Factures en attente</span>
          <span style={{ fontWeight: 600 }}>0</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardVentes;
