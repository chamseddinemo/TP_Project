import React from "react";

const DashboardFinance = () => {
  return (
    <div className="card" style={{ background: "linear-gradient(135deg, #06b6d415 0%, #06b6d405 100%)", borderLeft: "4px solid #06b6d4" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 24 }}>💳</span>
        <h3 style={{ margin: 0 }}>Finance</h3>
      </div>
      <p style={{ fontSize: 14, opacity: 0.8, marginBottom: 16 }}>Suivi des revenus, dépenses et factures payées.</p>
      <div style={{ display: "grid", gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <span style={{ fontSize: 13, opacity: 0.7 }}>Solde</span>
          <span style={{ fontWeight: 600, color: "#10b981" }}>+0 €</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
          <span style={{ fontSize: 13, opacity: 0.7 }}>Factures impayées</span>
          <span style={{ fontWeight: 600 }}>0</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardFinance;
