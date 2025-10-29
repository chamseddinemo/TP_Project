// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import DashboardStock from "./pages/dashboards/DashboardStock";
import DashboardVentes from "./pages/dashboards/DashboardVentes";
import DashboardAchats from "./pages/dashboards/DashboardAchats";
import DashboardRH from "./pages/dashboards/DashboardRH";
import DashboardFinance from "./pages/dashboards/DashboardFinance";
import DashboardEquipment from "./pages/dashboards/DashboardEquipment";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import SectionPage from "./components/SectionPage";
import Employes from "./pages/sections/Employes";
import Produits from "./pages/sections/Produits";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Dashboards protégés */}
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/stock"
            element={
              <ProtectedRoute roles={["stock"]}>
                <DashboardStock />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/vente"
            element={
              <ProtectedRoute roles={["vente"]}>
                <DashboardVentes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/achat"
            element={
              <ProtectedRoute roles={["achat"]}>
                <DashboardAchats />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/rh"
            element={
              <ProtectedRoute roles={["rh"]}>
                <DashboardRH />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/finance"
            element={
              <ProtectedRoute roles={["comptable"]}>
                <DashboardFinance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/equipement"
            element={
              <ProtectedRoute roles={["technicien"]}>
                <DashboardEquipment />
              </ProtectedRoute>
            }
          />

          {/* RH */}
          <Route path="/rh/employes" element={<ProtectedRoute roles={["rh","admin"]}><Employes /></ProtectedRoute>} />
          <Route path="/rh/recrutement" element={<ProtectedRoute roles={["rh","admin"]}><SectionPage title="Recrutement" description="Suivi des candidatures et offres." /></ProtectedRoute>} />
          <Route path="/rh/temps" element={<ProtectedRoute roles={["rh","admin"]}><SectionPage title="Feuilles de temps" description="Pointage et validation des heures." /></ProtectedRoute>} />
          <Route path="/rh/paie" element={<ProtectedRoute roles={["rh","admin"]}><SectionPage title="Paie & Contrats" description="Gestion des bulletins et contrats." /></ProtectedRoute>} />

          {/* Stock */}
          <Route path="/stock/produits" element={<ProtectedRoute roles={["stock","admin"]}><Produits /></ProtectedRoute>} />
          <Route path="/stock/categories" element={<ProtectedRoute roles={["stock","admin"]}><SectionPage title="Catégories" description="Organisation des familles de produits." /></ProtectedRoute>} />
          <Route path="/stock/inventaire" element={<ProtectedRoute roles={["stock","admin"]}><SectionPage title="Stocks & Inventaire" description="Niveaux, mouvements et inventaires." /></ProtectedRoute>} />
          <Route path="/stock/fournisseurs" element={<ProtectedRoute roles={["stock","admin"]}><SectionPage title="Fournisseurs" description="Répertoire et évaluations fournisseurs." /></ProtectedRoute>} />

          {/* Ventes & Achats */}
          <Route path="/vente/commandes" element={<ProtectedRoute roles={["vente","admin"]}><SectionPage title="Commandes clients" description="Suivi des commandes et livraisons." /></ProtectedRoute>} />
          <Route path="/vente/factures" element={<ProtectedRoute roles={["vente","admin"]}><SectionPage title="Facturation" description="Factures, avoirs et paiements." /></ProtectedRoute>} />
          <Route path="/achat/achats" element={<ProtectedRoute roles={["achat","admin"]}><SectionPage title="Achats" description="Commandes fournisseurs et réceptions." /></ProtectedRoute>} />
          <Route path="/achat/devis" element={<ProtectedRoute roles={["achat","admin"]}><SectionPage title="Devis & Bons" description="Devis, bons de commande et bons de réception." /></ProtectedRoute>} />

          {/* Finance */}
          <Route path="/finance/transactions" element={<ProtectedRoute roles={["comptable","admin"]}><SectionPage title="Transactions" description="Flux financiers et écritures." /></ProtectedRoute>} />
          <Route path="/finance/salaires" element={<ProtectedRoute roles={["comptable","admin"]}><SectionPage title="Salaires" description="Traitements salariaux et virements." /></ProtectedRoute>} />
          <Route path="/finance/rapports" element={<ProtectedRoute roles={["comptable","admin"]}><SectionPage title="Rapports financiers" description="Bilan, compte de résultat, analytique." /></ProtectedRoute>} />
          <Route path="/finance/budgets" element={<ProtectedRoute roles={["comptable","admin"]}><SectionPage title="Budgets & prévisions" description="Budgétisation et forecasts." /></ProtectedRoute>} />

          {/* Équipements */}
          <Route path="/equipements/liste" element={<ProtectedRoute roles={["technicien","admin"]}><SectionPage title="Liste équipements" description="Parc matériel et statuts." /></ProtectedRoute>} />
          <Route path="/equipements/maintenance" element={<ProtectedRoute roles={["technicien","admin"]}><SectionPage title="Maintenance planifiée" description="Préventif et ordres de travail." /></ProtectedRoute>} />
          <Route path="/equipements/historique" element={<ProtectedRoute roles={["technicien","admin"]}><SectionPage title="Historique réparations" description="Historique et coûts d’intervention." /></ProtectedRoute>} />

          {/* Paramètres */}
          <Route path="/settings/roles" element={<ProtectedRoute roles={["admin"]}><SectionPage title="Gestion des rôles" description="Autorisations et rôles utilisateur." /></ProtectedRoute>} />
          <Route path="/settings/securite" element={<ProtectedRoute roles={["admin"]}><SectionPage title="Sécurité & accès" description="Politiques d’accès et MFA." /></ProtectedRoute>} />
          <Route path="/settings/journal" element={<ProtectedRoute roles={["admin"]}><SectionPage title="Journal d’activité" description="Logs et audit trail." /></ProtectedRoute>} />
          <Route path="/settings/systeme" element={<ProtectedRoute roles={["admin"]}><SectionPage title="Paramètres système" description="Configuration globale de l’ERP." /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}


export default App;
