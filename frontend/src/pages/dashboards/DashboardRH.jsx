import React from "react";

const DashboardRH = () => {
  return (
    <div className="card" style={{ background: "linear-gradient(135deg, #ef444415 0%, #ef444405 100%)", borderLeft: "4px solid #ef4444" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 24 }}>👔</span>
        <h3 style={{ margin: 0 }}>Ressources humaines</h3>
      </div>
      <p style={{ fontSize: 14, opacity: 0.8, marginBottom: 16 }}>Gestion des employés, pointage, salaire et présence.</p>
      <div style={{ display: "grid", gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <span style={{ fontSize: 13, opacity: 0.7 }}>Employés actifs</span>
          <span style={{ fontWeight: 600 }}>0</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
          <span style={{ fontSize: 13, opacity: 0.7 }}>En congé</span>
          <span style={{ fontWeight: 600 }}>0</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardRH;
