# 🌟 Sprint 4 – Finalisation & Optimisations (ERP-TP)

Dernière ligne droite du projet : stabilisation, finitions UX/UI, notifications avancées, documentation exhaustive et préparation à la mise en production. Cette branche représente l’état final prêt à être fusionné dans `main`.

---

## 🎯 Objectifs du sprint

- Optimiser l’expérience utilisateur (design final, responsive, thème dark/light).
- Consolider les notifications temps réel (Socket.IO) et scenarios métiers.
- Renforcer la sécurité (middleware JWT, gestion des rôles, validations).
- Industrialiser la qualité : scripts de vérification (`verify-all`, `test-all-features`), jeux de données et checklists.
- Finaliser la documentation (guides d’installation, tests complets, procédures de démo).

---

## ✅ Fonctionnalités incluses

- **Backend complet**
  - Modules Auth, RH, Stocks, Équipements, Ventes, Achats, Finance, Notifications.
  - Websocket (Socket.IO) pour alertes temps réel et mises à jour dashboards.
  - Scripts d’automatisation : `verify-all.js`, `test-all-features.js`, `setup-database.js`, seeds modulaires.
  - Gestion avancée des rôles (admin, stock, vente, achat, rh, comptable, technicien, client/employee).

- **Frontend final**
  - Layout responsive (Navbar + Sidebar contextuelle + thèmes).
  - Dashboards par métier (admin, vente, achat, finance, stock, RH, technicien, employé, client).
  - Pages métiers : RH, Stock, Ventes, Achats, Finance, Notifications, Paramètres, Rapports.
  - Composants UI optimisés (cartes KPI, graphiques, tableaux, alertes, exports).

- **Documentation & outils**
  - Guides dédiés : `DEMARRAGE_RAPIDE.md`, `GUIDE_DEMARRAGE_MONGODB.md`, `GUIDE_TEST_COMPLET.md`, `VERIFICATION_COMPLETE.md`.
  - Scripts batch pour Windows : `DEMARRER.bat`, `DEMARRER_SANS_ADMIN.bat`, `TEST_COMPLET.bat`, etc.
  - README de chaque sprint pour rejouer l’historique produit (`sprint1`, `sprint2`, `sprint3`).

---

## 🚀 Mise en route (production ready)

### 1. Prérequis
- Node.js 18+
- MongoDB (local ou Atlas)
- npm (ou yarn)

### 2. Installation & configuration
```bash
# Racine (scripts partagés)
npm install

# Backend
cd backend
npm install
node create-env.js     # génère backend/.env si absent

# Frontend
cd ../frontend
npm install
```

Vérifiez/ajustez `backend/.env` :
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/erp-tp
JWT_SECRET=votre_secret_jwt_super_securise_2024_12345
FRONTEND_URL=http://localhost:5173
```

### 3. Lancer l’application
```bash
# Terminal 1 – Backend
cd backend
npm run dev

# Terminal 2 – Frontend
cd frontend
npm run dev
```

### 4. URLs
- Backend API : http://localhost:5000
- Frontend : http://localhost:5173

---

## 🔐 Comptes de démonstration (seed par défaut)

| Rôle            | Email             | Mot de passe |
|-----------------|-------------------|--------------|
| Administrateur  | admin@tp.com      | admin123     |
| Stock           | stock@tp.com      | 123456       |
| Ventes          | vente@tp.com      | 123456       |
| Achats          | achat@tp.com      | 123456       |
| RH              | rh@tp.com         | 123456       |
| Comptable       | comptable@tp.com  | 123456       |
| Technicien      | technicien@tp.com | 123456       |

> Possibilité de créer des clients/employés supplémentaires via `/signup` (rôles `client`, `employee`).  

---

## 🧭 Modules & navigation

- Dashboards : `/dashboard/admin`, `/dashboard/vente`, `/dashboard/achat`, `/dashboard/finance`, `/dashboard/stock`, `/dashboard/rh`, `/dashboard/equipement`, `/dashboard/employe`, `/dashboard/client`.
- RH : `/rh/employes`, `/rh/recrutement`, `/rh/temps`, `/rh/paie`.
- Stocks : `/stock/produits`, `/stock/categories`, `/stock/inventaire`, `/stock/fournisseurs`.
- Ventes : `/vente/commandes`, `/vente/factures`, `/vente/devis`.
- Achats : `/achat/achats`.
- Finance : `/finance/transactions`, `/finance/salaires`, `/finance/rapports`, `/finance/budgets`.
- Notifications : `/admin/alerts` (temps réel).
- Paramètres : `/settings/roles`, `/settings/securite`, `/settings/journal`, `/settings/systeme`, `/admin/profile`.

Les menus affichés dépendent du rôle connecté (`src/utils/rolePermissions.js`).  

---

## 🧪 Qualité & vérifications

```bash
# Vérification de configuration & base de données
cd backend
node verify-all.js

# Tests E2E métier (néc. backend démarré)
node test-all-features.js

# Vérification rapide MongoDB
node setup-database.js
```

Scripts batch disponibles à la racine pour automatiser : `TEST_COMPLET.bat`, `TEST_TOUTES_FONCTIONNALITES.bat`, `DEMARRER_SANS_ADMIN.bat`, etc.

---

## 📚 Documentation complémentaire

- `DEMARRAGE_RAPIDE.md` – pas-à-pas complet.
- `GUIDE_DEMARRAGE_MONGODB.md` – résolution des problèmes MongoDB (accès refusé, service, Atlas).
- `GUIDE_TEST_COMPLET.md` – scénarios de tests bout-en-bout.
- `VERIFICATION_COMPLETE.md` – checklist de validation finale.
- `RESUME_CORRECTIONS.md` – historique des correctifs & améliorations.

---

## 🔗 Branches de sprint

- Branche précédente : [`sprint3`](https://github.com/chamseddinemo/TP_Project/tree/sprint3) – Ventes, Achats & Rapports.
- Branche finale : `main` – fusion finale une fois la validation terminée.
- Archives : `sprint1`, `sprint2`, `sprint3` pour rejouer la progression Agile.

---

✨ Sprint 4 livré : l’ERP-TP est prêt pour la démo finale et la mise en production. bonnes missions ! 🚀

