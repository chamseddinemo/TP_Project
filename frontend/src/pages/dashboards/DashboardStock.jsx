import React from "react";

const DashboardStock = () => {
  return (
    <div className="card" style={{ background: "linear-gradient(135deg, #3b82f615 0%, #3b82f605 100%)", borderLeft: "4px solid #3b82f6" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 24 }}>📦</span>
        <h3 style={{ margin: 0 }}>Stock</h3>
      </div>
      <p style={{ fontSize: 14, opacity: 0.8, marginBottom: 16 }}>Visualisez et gérez les produits, quantités et fournisseurs.</p>
      <div style={{ display: "grid", gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <span style={{ fontSize: 13, opacity: 0.7 }}>Produits</span>
          <span style={{ fontWeight: 600 }}>0</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
          <span style={{ fontSize: 13, opacity: 0.7 }}>Rupture de stock</span>
          <span style={{ fontWeight: 600, color: "#ef4444" }}>0</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardStock;
