import React, { useEffect, useState, useContext } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import CardStat from "../../components/CardStat";
import KPISection from "../../components/KPISection";
import AlertsSection from "../../components/AlertsSection";
import Table from "../../components/Table";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import "./Dashboard.css";

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalVentes: 0,
    totalAchats: 0,
    totalRH: 0,
    totalFinance: 0,
    totalEquipments: 0,
  });

  useEffect(() => {
    if (!user) return;

    const fetchUsers = async () => {
      try {
        const { data } = await api.get("/auth/users");
        setUsers(data);
      } catch (error) {
        console.error(error.response?.data || error.message);
      }
    };

    const fetchStats = async () => {
      try {
        const { data } = await api.get("/admin/stats");
        setStats({
          totalUsers: data.totalUsers || 0,
          totalProducts: data.totalProducts || 0,
          totalVentes: data.totalVentes || 0,
          totalAchats: data.totalAchats || 0,
          totalRH: data.totalRH || 0,
          totalFinance: data.totalFinance || 0,
          totalEquipments: data.totalEquipments || 0,
        });
      } catch (error) {
        console.error(error.response?.data || error.message);
      }
    };

    fetchUsers();
    fetchStats();

    const interval = setInterval(() => {
      fetchUsers();
      fetchStats();
    }, 5000);

    return () => clearInterval(interval);
  }, [user]);

  const columns = ["name", "email", "role", "createdAt"];

  return (
    <DashboardLayout role={user?.role}>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Tableau de bord Admin</h1>

        {/* Section Statistiques existantes */}
        <div className="stats-section">
          <CardStat title="Total utilisateurs" value={stats.totalUsers} color="#4CAF50" />
          <CardStat title="Stocks" value={stats.totalProducts} color="#2196F3" />
          <CardStat title="Ventes" value={stats.totalVentes} color="#FF9800" />
          <CardStat title="Achats" value={stats.totalAchats} color="#9C27B0" />
          <CardStat title="RH" value={stats.totalRH} color="#F44336" />
          <CardStat title="Finance" value={stats.totalFinance} color="#00BCD4" />
          <CardStat title="Équipements" value={stats.totalEquipments} color="#795548" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Liste des utilisateurs - Colonne gauche */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Liste des utilisateurs</h2>
            <Table columns={columns} data={users} />
          </div>

          {/* Alertes et Notifications - Colonne droite */}
          <AlertsSection />
        </div>

        {/* Section KPI */}
        <KPISection />
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
