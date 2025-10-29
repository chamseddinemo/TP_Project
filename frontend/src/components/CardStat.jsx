import React from "react";

const CardStat = ({ title, value, color, icon }) => {
  return (
    <div className="card" style={{
      background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
      borderLeft: `4px solid ${color}`,
      padding: "20px",
      minWidth: "200px",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      transition: "all 0.3s ease",
      cursor: "pointer"
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-4px)";
      e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.15)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "";
    }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "13px", fontWeight: 600, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.5px" }}>{title}</span>
        {icon && <span style={{ fontSize: "24px", opacity: 0.6 }}>{icon}</span>}
      </div>
      <div style={{ fontSize: "32px", fontWeight: 700, color: color }}>{value}</div>
      <div style={{ fontSize: "12px", opacity: 0.6 }}>vs période précédente</div>
    </div>
  );
};

export default CardStat;
