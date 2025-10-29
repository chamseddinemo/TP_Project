import React from "react";

const DashboardEquipment = () => {
  return (
    <div className="card" style={{ background: "linear-gradient(135deg, #f9731615 0%, #f9731605 100%)", borderLeft: "4px solid #f97316" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 24 }}>🏗️</span>
        <h3 style={{ margin: 0 }}>Équipements</h3>
      </div>
      <p style={{ fontSize: 14, opacity: 0.8, marginBottom: 16 }}>Gestion des machines, chantiers et maintenance.</p>
      <div style={{ display: "grid", gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <span style={{ fontSize: 13, opacity: 0.7 }}>En service</span>
          <span style={{ fontWeight: 600 }}>0</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
          <span style={{ fontSize: 13, opacity: 0.7 }}>En maintenance</span>
          <span style={{ fontWeight: 600, color: "#f59e0b" }}>0</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardEquipment;
