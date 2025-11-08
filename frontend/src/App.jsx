// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import EmployeeDashboard from "./pages/dashboards/EmployeeDashboard";
import ClientDashboard from "./pages/dashboards/ClientDashboard";
import DashboardStock from "./pages/dashboards/DashboardStock";
import DashboardRH from "./pages/dashboards/DashboardRH";
import DashboardEquipment from "./pages/dashboards/DashboardEquipment";
import DashboardVentes from "./pages/dashboards/DashboardVentes";
import DashboardAchats from "./pages/dashboards/DashboardAchats";
import DashboardFinance from "./pages/dashboards/DashboardFinance";
import AdminAlertsPage from "./pages/admin/AdminAlertsPage";
import ProfileSettingsPage from "./pages/admin/ProfileSettingsPage";
import EmployeesPage from "./pages/rh/EmployeesPage";
import RecrutementPage from "./pages/rh/RecrutementPage";
import TimesheetsPage from "./pages/rh/TimesheetsPage";
import PaieContratsPage from "./pages/rh/PaieContratsPage";
import ProductsPage from "./pages/stock/ProductsPage";
import CategoriesPage from "./pages/stock/CategoriesPage";
import InventoryPage from "./pages/stock/InventoryPage";
import SuppliersPage from "./pages/stock/SuppliersPage";
import EquipmentListPage from "./pages/equipements/EquipmentListPage";
import OrdersPage from "./pages/vente/OrdersPage";
import InvoicingPage from "./pages/vente/InvoicingPage";
import QuotesPage from "./pages/vente/QuotesPage";
import PurchasesPage from "./pages/achat/PurchasesPage";
import TransactionsPage from "./pages/finance/TransactionsPage";
import SalariesPage from "./pages/finance/SalariesPage";
import ReportsPage from "./pages/finance/ReportsPage";
import BudgetsPage from "./pages/finance/BudgetsPage";
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

          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/employe"
            element={
              <ProtectedRoute roles={["employee", "stock", "rh"]}>
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/client"
            element={
              <ProtectedRoute roles={["client", "vente"]}>
                <ClientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/stock"
            element={
              <ProtectedRoute roles={["stock", "admin"]}>
                <DashboardStock />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/rh"
            element={
              <ProtectedRoute roles={["rh", "admin", "employee"]}>
                <DashboardRH />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/equipement"
            element={
              <ProtectedRoute roles={["technicien", "admin"]}>
                <DashboardEquipment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/vente"
            element={
              <ProtectedRoute roles={["vente", "admin"]}>
                <DashboardVentes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/achat"
            element={
              <ProtectedRoute roles={["achat", "admin"]}>
                <DashboardAchats />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/finance"
            element={
              <ProtectedRoute roles={["comptable", "admin"]}>
                <DashboardFinance />
              </ProtectedRoute>
            }
          />

          {/* Page Paramètres Profil */}
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute roles={["admin", "employee", "client", "stock", "vente", "rh", "achat", "comptable"]}>
                <ProfileSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/alerts"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminAlertsPage />
              </ProtectedRoute>
            }
          />

          {/* Modules RH */}
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
              <ProtectedRoute roles={["admin", "rh"]}>
                <PaieContratsPage />
              </ProtectedRoute>
            }
          />

          {/* Modules Stock */}
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

          {/* Modules Équipements */}
          <Route
            path="/equipements/liste"
            element={
              <ProtectedRoute roles={["admin", "technicien"]}>
                <EquipmentListPage />
              </ProtectedRoute>
            }
          />
          {/* Modules Ventes */}
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
            path="/vente/devis"
            element={
              <ProtectedRoute roles={["admin", "vente"]}>
                <QuotesPage />
              </ProtectedRoute>
            }
          />

          {/* Modules Achats */}
          <Route
            path="/achat/achats"
            element={
              <ProtectedRoute roles={["admin", "achat"]}>
                <PurchasesPage />
              </ProtectedRoute>
            }
          />

          {/* Modules Finance & Rapports */}
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
          </Routes>
        </SidebarProvider>
      </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}


export default App;
