import React from "react";
import DashboardLayout from "../../components/DashboardLayout";

const ClientDashboard = () => {
  return (
    <DashboardLayout role="client">
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Espace Client</h1>
        <p className="text-gray-600">
          Ce tableau de bord offre un aperçu simplifié des informations clients pour le Sprint 1.
          Les fonctionnalités de ventes, de facturation et de suivi des commandes seront ajoutées
          lors des prochains sprints.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Statut du compte</h2>
            <p className="text-gray-600">
              • Profils clients actifs<br />
              • Dernières interactions<br />
              • Messages récents
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Actions disponibles</h2>
            <p className="text-gray-600">
              • Mettre à jour ses informations<br />
              • Contacter le support<br />
              • Télécharger des documents
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientDashboard;

