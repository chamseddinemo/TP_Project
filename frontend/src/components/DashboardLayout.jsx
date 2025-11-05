import React, { memo, useContext } from "react";
import { useSidebar } from "../context/SidebarContext";
import { AuthContext } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const DashboardLayout = memo(({ children, role }) => {
  const { collapsed } = useSidebar();
  const { user } = useContext(AuthContext);
  
  // Utiliser le rôle passé en prop, sinon utiliser celui de l'utilisateur connecté
  const userRole = role || user?.role;
  
  return (
    <div className="dashboard-container-wrapper">
      <Navbar />
      <div className={`dashboard-wrapper ${collapsed ? "sidebar-collapsed" : ""}`}>
        <Sidebar role={userRole} />
        <div className="main-content">
          {children}
        </div>
      </div>
    </div>
  );
});

DashboardLayout.displayName = "DashboardLayout";

export default DashboardLayout;

