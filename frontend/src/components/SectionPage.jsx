import React from "react";
import AppLayout from "./AppLayout";

const SectionPage = ({ title, description, children }) => {
  return (
    <AppLayout>
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ marginBottom: 8 }}>{title}</h2>
        {description && <p>{description}</p>}
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 8 }}>Aperçu</h3>
        <p>Contenu de {title} en préparation. Ajoute ici tes widgets, filtres, et actions.</p>
      </div>

      {children}
    </AppLayout>
  );
};

export default SectionPage;


