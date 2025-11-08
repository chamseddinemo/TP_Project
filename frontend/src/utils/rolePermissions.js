// Permissions par rôle pour le Sprint 1
export const rolePermissions = {
  admin: {
    dashboard: "/dashboard/admin",
    menus: ["Tableau de bord", "Paramètres"],
    subMenus: {
      "Paramètres": ["Profil"]
    }
  },
  employee: {
    dashboard: "/dashboard/employe",
    menus: ["Tableau de bord"]
  },
  client: {
    dashboard: "/dashboard/client",
    menus: ["Tableau de bord"]
  },
  // Compatibilité avec les rôles historiques de la base de données
  stock: {
    dashboard: "/dashboard/employe",
    menus: ["Tableau de bord"]
  },
  rh: {
    dashboard: "/dashboard/employe",
    menus: ["Tableau de bord"]
  },
  vente: {
    dashboard: "/dashboard/client",
    menus: ["Tableau de bord"]
  },
  achat: {
    dashboard: "/dashboard/employe",
    menus: ["Tableau de bord"]
  },
  comptable: {
    dashboard: "/dashboard/employe",
    menus: ["Tableau de bord"]
  },
  technicien: {
    dashboard: "/dashboard/employe",
    menus: ["Tableau de bord"]
  }
};

