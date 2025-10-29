import React, { useEffect, useState, useContext } from "react";
import AppLayout from "../../components/AppLayout";
import CardStat from "../../components/CardStat";
import Table from "../../components/Table";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";

// Dashboards individuels
import DashboardVentes from "./DashboardVentes";
import DashboardRH from "./DashboardRH";
import DashboardFinance from "./DashboardFinance";
import DashboardEquipment from "./DashboardEquipment";
import DashboardStock from "./DashboardStock";
import DashboardAchats from "./DashboardAchats";
import "./Dashboard.css"; // CSS global

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
          totalUsers: data.totalUsers,
          totalProducts: data.totalProducts,
          totalVentes: data.totalVentes,
          totalAchats: data.totalAchats,
          totalRH: data.totalRH,
          totalFinance: data.totalFinance,
          totalEquipments: data.totalEquipments,
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
    <AppLayout>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
          <CardStat title="Utilisateurs" value={stats.totalUsers} color="#10b981" icon="👥" />
          <CardStat title="Produits" value={stats.totalProducts} color="#3b82f6" icon="📦" />
          <CardStat title="Ventes" value={stats.totalVentes} color="#f59e0b" icon="💰" />
          <CardStat title="Achats" value={stats.totalAchats} color="#8b5cf6" icon="🛒" />
          <CardStat title="RH" value={stats.totalRH} color="#ef4444" icon="👔" />
          <CardStat title="Finance" value={stats.totalFinance} color="#06b6d4" icon="💳" />
          <CardStat title="Équipements" value={stats.totalEquipments} color="#f97316" icon="🏗️" />
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ margin: 0 }}>Liste des utilisateurs</h2>
            <button className="btn btn-primary">+ Nouvel utilisateur</button>
          </div>
          <Table columns={columns} data={users} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
          <DashboardVentes />
          <DashboardRH />
          <DashboardFinance />
          <DashboardEquipment />
          <DashboardStock />
          <DashboardAchats />
      </div>
    </AppLayout>
  );
};

export default AdminDashboard;
