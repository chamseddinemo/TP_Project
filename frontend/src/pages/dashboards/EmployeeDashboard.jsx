import React from "react";
import DashboardLayout from "../../components/DashboardLayout";

const EmployeeDashboard = () => {
  return (
    <DashboardLayout role="employee">
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Tableau de bord Employé</h1>
        <p className="text-gray-600">
          Bienvenue sur votre tableau de bord. Dans ce sprint, les employés peuvent consulter les
          tâches principales, les accès rapides et les messages internes. Les modules avancés seront
          activés dans les prochains sprints.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Aperçu des activités</h2>
            <ul className="space-y-2 text-gray-600">
              <li>• Accès aux informations personnelles</li>
              <li>• Suivi des tâches assignées</li>
              <li>• Historique des connexions</li>
            </ul>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Accès rapides</h2>
            <ul className="space-y-2 text-gray-600">
              <li>• Profil et paramètres</li>
              <li>• Messagerie interne</li>
              <li>• Support technique</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployeeDashboard;

