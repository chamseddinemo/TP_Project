// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import AdminChartsPage from "./pages/dashboards/AdminChartsPage";
import AdminAlertsPage from "./pages/admin/AdminAlertsPage";
import ProfileSettingsPage from "./pages/admin/ProfileSettingsPage";
import DashboardStock from "./pages/dashboards/DashboardStock";
import DashboardVentes from "./pages/dashboards/DashboardVentes";
import DashboardAchats from "./pages/dashboards/DashboardAchats";
import DashboardRH from "./pages/dashboards/DashboardRH";
import DashboardFinance from "./pages/dashboards/DashboardFinance";
import DashboardEquipment from "./pages/dashboards/DashboardEquipment";
// Pages RH
import EmployeesPage from "./pages/rh/EmployeesPage";
import RecrutementPage from "./pages/rh/RecrutementPage";
import TimesheetsPage from "./pages/rh/TimesheetsPage";
import PaieContratsPage from "./pages/rh/PaieContratsPage";
// Pages Stock
import ProductsPage from "./pages/stock/ProductsPage";
import CategoriesPage from "./pages/stock/CategoriesPage";
import InventoryPage from "./pages/stock/InventoryPage";
import SuppliersPage from "./pages/stock/SuppliersPage";
// Pages Vente
import OrdersPage from "./pages/vente/OrdersPage";
import InvoicingPage from "./pages/vente/InvoicingPage";
import QuotesPage from "./pages/vente/QuotesPage";
// Pages Achat
import PurchasesPage from "./pages/achat/PurchasesPage";
// Pages Finance
import TransactionsPage from "./pages/finance/TransactionsPage";
import SalariesPage from "./pages/finance/SalariesPage";
import ReportsPage from "./pages/finance/ReportsPage";
import BudgetsPage from "./pages/finance/BudgetsPage";
// Pages Équipements
import EquipmentListPage from "./pages/equipements/EquipmentListPage";
// Pages Paramètres
import RolesPage from "./pages/settings/RolesPage";
import SecurityPage from "./pages/settings/SecurityPage";
import ActivityLogPage from "./pages/settings/ActivityLogPage";
import SystemSettingsPage from "./pages/settings/SystemSettingsPage";
import { AuthProvider } from "./context/AuthContext";
import { SidebarProvider } from "./context/SidebarContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <SidebarProvider>
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

          {/* Page Graphiques Admin */}
          <Route
            path="/admin/graphiques"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminChartsPage />
              </ProtectedRoute>
            }
          />

          {/* Page Alertes Admin */}
          <Route
            path="/admin/alerts"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminAlertsPage />
              </ProtectedRoute>
            }
          />

          {/* Page Paramètres Profil */}
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute roles={["admin", "stock", "vente", "achat", "rh", "comptable", "technicien"]}>
                <ProfileSettingsPage />
              </ProtectedRoute>
            }
          />
          
          {/* Routes RH pour Admin */}
          <Route
            path="/rh/employes"
            element={
              <ProtectedRoute roles={["admin", "rh"]}>
                <EmployeesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rh/recrutement"
            element={
              <ProtectedRoute roles={["admin", "rh"]}>
                <RecrutementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rh/temps"
            element={
              <ProtectedRoute roles={["admin", "rh"]}>
                <TimesheetsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rh/paie"
            element={
              <ProtectedRoute roles={["admin", "rh", "comptable"]}>
                <PaieContratsPage />
              </ProtectedRoute>
            }
          />
          
          {/* Routes Stock */}
          <Route
            path="/stock/produits"
            element={
              <ProtectedRoute roles={["admin", "stock"]}>
                <ProductsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stock/categories"
            element={
              <ProtectedRoute roles={["admin", "stock"]}>
                <CategoriesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stock/inventaire"
            element={
              <ProtectedRoute roles={["admin", "stock"]}>
                <InventoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stock/fournisseurs"
            element={
              <ProtectedRoute roles={["admin", "stock", "achat"]}>
                <SuppliersPage />
              </ProtectedRoute>
            }
          />
          
          {/* Routes Vente */}
          <Route
            path="/vente/commandes"
            element={
              <ProtectedRoute roles={["admin", "vente"]}>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vente/factures"
            element={
              <ProtectedRoute roles={["admin", "vente", "comptable"]}>
                <InvoicingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/achat/devis"
            element={
              <ProtectedRoute roles={["admin", "vente"]}>
                <QuotesPage />
              </ProtectedRoute>
            }
          />
          
          {/* Routes Achat */}
          <Route
            path="/achat/achats"
            element={
              <ProtectedRoute roles={["admin", "achat"]}>
                <PurchasesPage />
              </ProtectedRoute>
            }
          />
          
          {/* Routes Finance */}
          <Route
            path="/finance/transactions"
            element={
              <ProtectedRoute roles={["admin", "comptable"]}>
                <TransactionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance/salaires"
            element={
              <ProtectedRoute roles={["admin", "comptable", "rh"]}>
                <SalariesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance/rapports"
            element={
              <ProtectedRoute roles={["admin", "comptable"]}>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance/budgets"
            element={
              <ProtectedRoute roles={["admin", "comptable"]}>
                <BudgetsPage />
              </ProtectedRoute>
            }
          />
          
          {/* Routes Équipements */}
          <Route
            path="/equipements/liste"
            element={
              <ProtectedRoute roles={["admin", "technicien"]}>
                <EquipmentListPage />
              </ProtectedRoute>
            }
          />
          {/* Routes Paramètres */}
          <Route
            path="/settings/roles"
            element={
              <ProtectedRoute roles={["admin"]}>
                <RolesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/securite"
            element={
              <ProtectedRoute roles={["admin"]}>
                <SecurityPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/journal"
            element={
              <ProtectedRoute roles={["admin"]}>
                <ActivityLogPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/systeme"
            element={
              <ProtectedRoute roles={["admin"]}>
                <SystemSettingsPage />
              </ProtectedRoute>
            }
          />
          </Routes>
        </SidebarProvider>
      </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}


export default App;
