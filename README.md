# 🌿 Sprint 2 – RH, Stocks & Équipements (ERP-TP)

Ce sprint enrichit la base du projet (Sprint 1) avec les modules métiers internes : Ressources Humaines, Gestion de stock et Gestion des équipements, accompagnés des notifications internes basiques.

---

## 🎯 Objectifs du sprint

- Étendre l’authentification existante aux rôles opérationnels (RH, Stock, Technicien).
- Mettre à disposition les modules RH (employés, paie, recrutement).
- Activer la gestion des produits/stocks avec suivi des fournisseurs.
- Offrir la supervision des équipements (liste, disponibilité, maintenance prévue).
- Introduire les notifications internes pour les administrateurs.

---

## ✅ Fonctionnalités incluses

- **Backend**
  - Routes REST pour RH (`/api/rh`), Stock (`/api/stock`), Équipements (`/api/equipements`), Notifications (`/api/notifications`).
  - Statistiques admin enrichies (comptage employés, équipements, stocks).
  - Modèle utilisateur compatible avec les rôles historiques + nouveaux rôles `employee` & `client`.

- **Frontend**
  - Tableaux de bord dédiés : Admin, Employé, Client, Stock, RH, Technicien.
  - Menus contextuels selon les rôles (RH & Employés, Produits & Stocks, Équipements, Notifications).
  - Pages métiers :
    - RH : employés, recrutement, feuilles de temps, paie & contrats.
    - Stock : produits, catégories, inventaire, fournisseurs.
    - Équipements : liste et suivi de disponibilité.
  - Notifications internes accessibles côté admin (`/admin/alerts`).

---

## 🚀 Mise en route (Backend + Frontend)

### 1. Pré-requis
- Node.js 18+
- MongoDB local ou Atlas (par défaut : `mongodb://localhost:27017/erp-tp`)

### 2. Installation & configuration
```bash
# Installer les dépendances si nécessaire
cd backend
npm install
node create-env.js   # génère backend/.env si absent

cd ../frontend
npm install
```

### 3. Lancer l’environnement
```bash
# Backend (terminal 1)
cd backend
npm run dev

# Frontend (terminal 2)
cd frontend
npm run dev
```

### 4. URLs
- API Backend : http://localhost:5000
- Frontend : http://localhost:5173

---

## 🔐 Comptes de démonstration

| Rôle            | Email             | Mot de passe |
|-----------------|-------------------|--------------|
| Administrateur  | admin@tp.com      | admin123     |
| Gestion stock   | stock@tp.com      | 123456       |
| RH              | rh@tp.com         | 123456       |
| Technicien      | technicien@tp.com | 123456       |
| Client (vente)  | vente@tp.com      | 123456       |

> Se connecter via `/login`, puis accéder aux menus en fonction du rôle attribué.

---

## 🧭 Navigation & modules

- **Tableau de bord Admin** : `/dashboard/admin` (stats globales + notifications).
- **RH** : `/rh/employes`, `/rh/recrutement`, `/rh/temps`, `/rh/paie`.
- **Stocks** : `/stock/produits`, `/stock/categories`, `/stock/inventaire`, `/stock/fournisseurs`.
- **Équipements** : `/equipements/liste`.
- **Notifications** : `/admin/alerts`.

La barre latérale s’adapte automatiquement aux permissions définies dans `src/utils/rolePermissions.js`.

---

## 🧪 Vérifications rapides

```bash
# Vérifier la base de données
cd backend
node setup-database.js

# Tests E2E express
node test-all-features.js  # nécessite le backend démarré
```

---

## 🔗 Branches associées

- Branche précédente : [`sprint1`](https://github.com/chamseddinemo/TP_Project/tree/sprint1) – Base & Authentification.
- Branche suivante : `sprint3` – Ventes, Achats & Rapports (à venir).
- Branche finale : `main` – version complète du produit.

---

Bon sprint et bonne présentation ! 🚀


