# 🌾 Sprint 3 – Ventes, Achats & Rapports (ERP-TP)

Cette itération connecte l’ERP aux flux commerciaux et financiers. Les modules Ventes, Achats et Rapports analytiques viennent compléter les fondations (Sprint 1) et la couche opérationnelle interne (Sprint 2).

---

## 🎯 Objectifs du sprint

- Activer l’intégralité du cycle commercial : commandes clients, devis, facturation.
- Intégrer le suivi des achats fournisseurs et leur impact sur les stocks.
- Fournir des rapports analytiques (budgets, transactions, KPIs financiers).
- Enrichir les tableaux de bord dédiés (ventes, achats, finance).
- Centraliser les indicateurs dans les dashboards admin & métier.

---

## ✅ Fonctionnalités incluses

- **Backend**
  - Routes REST supplémentaires : `/api/vente`, `/api/achat`, `/api/finance`.
  - Calculs agrégés pour les statistiques admin (ventes, achats, finance).
  - Notifications internes conservées (Sprint 2) et utilisables par les nouveaux modules.

- **Frontend**
  - Nouveaux tableaux de bord : Ventes, Achats, Finance.
  - Menus contextuels « Ventes & Achats » et « Finance » avec accès par rôle.
  - Pages métiers :
    - Ventes : commandes, facturation, devis.
    - Achats : suivi des achats fournisseurs.
    - Finance : transactions, salaires, budgets, rapports dynamiques.
  - Permissions mises à jour (`rolePermissions.js`) pour refléter les responsabilités de chaque rôle (vente, achat, comptable, client, etc.).

---

## 🚀 Mise en route

### 1. Pré-requis
- Node.js 18+
- MongoDB local/Atlas (`mongodb://localhost:27017/erp-tp` par défaut)

### 2. Installation / configuration
```bash
cd backend
npm install
node create-env.js   # crée backend/.env si nécessaire

cd ../frontend
npm install
```

### 3. Lancement
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

### 4. URLs
- Backend API : http://localhost:5000
- Frontend : http://localhost:5173

---

## 🔐 Comptes de démonstration

| Rôle            | Email             | Mot de passe |
|-----------------|-------------------|--------------|
| Administrateur  | admin@tp.com      | admin123     |
| Ventes          | vente@tp.com      | 123456       |
| Achats          | achat@tp.com      | 123456       |
| Comptable       | comptable@tp.com  | 123456       |
| RH              | rh@tp.com         | 123456       |
| Stock           | stock@tp.com      | 123456       |

> Rôles et menus sont filtrés automatiquement via `rolePermissions.js`.

---

## 🧭 Navigation & modules

- **Dashboards** : `/dashboard/admin`, `/dashboard/vente`, `/dashboard/achat`, `/dashboard/finance`, etc.
- **Ventes** :
  - `/vente/commandes`
  - `/vente/factures`
  - `/vente/devis`
- **Achats** :
  - `/achat/achats`
- **Finance & Rapports** :
  - `/finance/transactions`
  - `/finance/salaires`
  - `/finance/rapports`
  - `/finance/budgets`
- **Notifications** : `/admin/alerts`

---

## 🧪 Vérifications recommandées

```bash
cd backend
node setup-database.js        # Vérifie MongoDB + collections
node test-all-features.js     # Tests E2E (backend actif requis)
```

---

## 🔗 Branches associées

- Branche précédente : [`sprint2`](https://github.com/chamseddinemo/TP_Project/tree/sprint2) – RH, Stocks & Équipements.
- Branche suivante : `sprint4` – Finalisation & Optimisations globales (design, performance, documentation).
- Branche finale : `main` – version complète et stabilisée.

---

Bonne démo commerciale ! 🚀



