// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import EmployeeDashboard from "./pages/dashboards/EmployeeDashboard";
import ClientDashboard from "./pages/dashboards/ClientDashboard";
import ProfileSettingsPage from "./pages/admin/ProfileSettingsPage";
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

          {/* Page Paramètres Profil */}
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute roles={["admin", "employee", "client", "stock", "vente", "rh"]}>
                <ProfileSettingsPage />
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
