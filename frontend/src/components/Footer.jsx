import React from "react";

const Footer = () => {
  return (
    <footer style={{ 
      padding: "16px 24px", 
      backdropFilter: "blur(10px)", 
      borderTop: "1px solid rgba(255,255,255,0.1)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      fontSize: 14,
      opacity: 0.85
    }}>
      <div>© {new Date().getFullYear()} ERP-TP. Tous droits réservés.</div>
      <div style={{ display: "flex", gap: 16 }}>
        <a href="#" style={{ textDecoration: "none" }}>Support</a>
        <a href="#" style={{ textDecoration: "none" }}>Documentation</a>
        <a href="#" style={{ textDecoration: "none" }}>Politique de confidentialité</a>
      </div>
    </footer>
  );
};

export default Footer;

