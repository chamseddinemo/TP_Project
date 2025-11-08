// Permissions par rôle pour le Sprint 2
export const rolePermissions = {
  admin: {
    dashboard: "/dashboard/admin",
    menus: [
      "Tableau de bord",
      "RH & Employés",
      "Produits & Stocks",
      "Équipements",
      "Notifications",
      "Paramètres"
    ],
    subMenus: {
      "RH & Employés": ["Employés", "Recrutement", "Feuilles de temps", "Paie & Contrats"],
      "Produits & Stocks": ["Liste produits", "Catégories", "Stocks & Inventaire", "Fournisseurs"],
      "Équipements": ["Liste équipements"],
      "Paramètres": ["Profil"]
    }
  },
  employee: {
    dashboard: "/dashboard/employe",
    menus: ["Tableau de bord", "RH & Employés"],
    subMenus: {
      "RH & Employés": ["Employés", "Feuilles de temps"]
    }
  },
  client: {
    dashboard: "/dashboard/client",
    menus: ["Tableau de bord"]
  },
  // Compatibilité avec les rôles historiques de la base de données
  stock: {
    dashboard: "/dashboard/stock",
    menus: ["Tableau de bord", "Produits & Stocks"],
    subMenus: {
      "Produits & Stocks": ["Liste produits", "Stocks & Inventaire", "Fournisseurs"]
    }
  },
  rh: {
    dashboard: "/dashboard/employe",
    menus: ["Tableau de bord", "RH & Employés"],
    subMenus: {
      "RH & Employés": ["Employés", "Paie & Contrats", "Feuilles de temps"]
    }
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
    dashboard: "/dashboard/equipement",
    menus: ["Tableau de bord", "Équipements"],
    subMenus: {
      "Équipements": ["Liste équipements"]
    }
  }
};

