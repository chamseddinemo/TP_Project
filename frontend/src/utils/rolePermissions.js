// Permissions par rôle pour le Sprint 2
export const rolePermissions = {
  admin: {
    dashboard: "/dashboard/admin",
    menus: [
      "Tableau de bord",
      "RH & Employés",
      "Produits & Stocks",
      "Équipements",
      "Ventes & Achats",
      "Finance",
      "Notifications",
      "Paramètres"
    ],
    subMenus: {
      "RH & Employés": ["Employés", "Recrutement", "Feuilles de temps", "Paie & Contrats"],
      "Produits & Stocks": ["Liste produits", "Catégories", "Stocks & Inventaire", "Fournisseurs"],
      "Équipements": ["Liste équipements"],
      "Ventes & Achats": ["Commandes clients", "Facturation", "Devis & Bons", "Achats"],
      "Finance": ["Transactions", "Salaires", "Rapports financiers", "Budgets & prévisions"],
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
    menus: ["Tableau de bord", "Ventes & Achats"],
    subMenus: {
      "Ventes & Achats": ["Commandes clients", "Devis & Bons"]
    }
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
    dashboard: "/dashboard/vente",
    menus: ["Tableau de bord", "Ventes & Achats"],
    subMenus: {
      "Ventes & Achats": ["Commandes clients", "Facturation", "Devis & Bons"]
    }
  },
  achat: {
    dashboard: "/dashboard/achat",
    menus: ["Tableau de bord", "Ventes & Achats"],
    subMenus: {
      "Ventes & Achats": ["Achats"]
    }
  },
  comptable: {
    dashboard: "/dashboard/finance",
    menus: ["Tableau de bord", "Finance", "Ventes & Achats"],
    subMenus: {
      "Finance": ["Transactions", "Salaires", "Rapports financiers", "Budgets & prévisions"],
      "Ventes & Achats": ["Facturation"]
    }
  },
  technicien: {
    dashboard: "/dashboard/equipement",
    menus: ["Tableau de bord", "Équipements"],
    subMenus: {
      "Équipements": ["Liste équipements"]
    }
  }
};

