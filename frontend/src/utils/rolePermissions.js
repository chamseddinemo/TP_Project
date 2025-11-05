// Permissions par rôle pour les menus
export const rolePermissions = {
  admin: {
    dashboard: "/dashboard/admin",
    menus: [
      "Tableau de bord",
      "RH & Employés",
      "Produits & Stocks",
      "Ventes & Achats",
      "Finance",
      "Équipements",
      "Paramètres"
    ],
    subMenus: {
      "RH & Employés": ["Employés", "Recrutement", "Feuilles de temps", "Paie & Contrats"],
      "Produits & Stocks": ["Liste produits", "Catégories", "Stocks & Inventaire", "Fournisseurs"],
      "Ventes & Achats": ["Commandes clients", "Facturation", "Achats", "Devis & Bons"],
      "Finance": ["Transactions", "Salaires", "Rapports financiers", "Budgets & prévisions"],
      "Équipements": ["Liste équipements", "Maintenance planifiée", "Historique réparations"],
      "Paramètres": ["Gestion des rôles", "Sécurité & accès", "Journal d'activité", "Paramètres système"]
    }
  },
  stock: {
    dashboard: "/dashboard/stock",
    menus: [
      "Tableau de bord",
      "Produits & Stocks"
    ],
    subMenus: {
      "Produits & Stocks": ["Liste produits", "Catégories", "Stocks & Inventaire", "Fournisseurs"]
    }
  },
  vente: {
    dashboard: "/dashboard/vente",
    menus: [
      "Tableau de bord",
      "Ventes & Achats"
    ],
    subMenus: {
      "Ventes & Achats": ["Commandes clients", "Facturation", "Devis & Bons"]
    }
  },
  achat: {
    dashboard: "/dashboard/achat",
    menus: [
      "Tableau de bord",
      "Produits & Stocks",
      "Ventes & Achats"
    ],
    subMenus: {
      "Produits & Stocks": ["Fournisseurs"],
      "Ventes & Achats": ["Achats"]
    }
  },
  rh: {
    dashboard: "/dashboard/rh",
    menus: [
      "Tableau de bord",
      "RH & Employés",
      "Finance"
    ],
    subMenus: {
      "RH & Employés": ["Employés", "Recrutement", "Feuilles de temps", "Paie & Contrats"],
      "Finance": ["Salaires"]
    }
  },
  comptable: {
    dashboard: "/dashboard/finance",
    menus: [
      "Tableau de bord",
      "Ventes & Achats",
      "Finance",
      "RH & Employés"
    ],
    subMenus: {
      "Ventes & Achats": ["Facturation"],
      "Finance": ["Transactions", "Salaires", "Rapports financiers", "Budgets & prévisions"],
      "RH & Employés": ["Paie & Contrats"]
    }
  },
  technicien: {
    dashboard: "/dashboard/equipement",
    menus: [
      "Tableau de bord",
      "Équipements"
    ],
    subMenus: {
      "Équipements": ["Liste équipements", "Maintenance planifiée", "Historique réparations"]
    }
  }
};

