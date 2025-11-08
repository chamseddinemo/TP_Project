# 🌱 Sprint 1 – Base & Authentification (ERP-TP)

Cette branche concentre les fondations de l’ERP : authentification sécurisée, accès aux rôles essentiels (administrateur, employé, client) et tableaux de bord simplifiés. Elle sert de socle pour les évolutions ultérieures.

---

## 🎯 Objectifs du sprint

- Mettre en place l’architecture Backend + Frontend prête à l’emploi.
- Gérer l’authentification via JWT (inscription, connexion, rôles).
- Fournir des tableaux de bord dédiés aux rôles principaux (admin, employé, client).
- Poser les bases UI/UX (layout, thème clair/sombre, navigation).

---

## ✅ Fonctionnalités incluses

- Authentification complète : inscription, login, déconnexion, protection des routes.
- Gestion des utilisateurs côté admin (liste & rôles).
- Tableau de bord administrateur connecté aux statistiques backend.
- Tableaux de bord employé et client (contenu pédagogique, sans modules métiers).
- Layout réactif avec barre latérale filtrée selon le rôle connecté.

> ℹ️ Les modules RH, Stocks, Ventes, Achats, Finance, Notifications et Équipements seront activés dans les sprints suivants.

---

## 🚀 Mise en route (Backend + Frontend)

### 1. Pré-requis
- Node.js 18+
- MongoDB local (par défaut : `mongodb://localhost:27017/erp-tp`)

### 2. Configuration
```bash
cd backend
npm install
cp .env.example .env   # ou node create-env.js

cd ../frontend
npm install
```

### 3. Lancer les services
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

## 🔐 Comptes de démonstration

| Rôle        | Email             | Mot de passe |
|-------------|-------------------|--------------|
| Administrateur | admin@tp.com     | admin123     |
| Employé (stock) | stock@tp.com     | 123456       |
| Client (vente)  | vente@tp.com     | 123456       |

> Utilisez l’écran de connexion (`/login`) pour accéder aux tableaux de bord correspondants.

---

## 🧭 Navigation dans cette version

- **Admin** → `/dashboard/admin` : vue métriques/alertes + gestion des utilisateurs.
- **Employé** → `/dashboard/employe` : vue synthétique (soit utilisateur rôle `stock`, `rh`, `employee`, etc.).
- **Client** → `/dashboard/client` : aperçu simplifié (rôle `vente` ou `client`).
- `Profil` accessible à tous via le menu latéral ou le menu utilisateur (navbar).

---

## 🧪 Vérifications rapides

```bash
# Tester la connexion DB
cd backend
node setup-database.js

# Vérifier les API essentielles
curl http://localhost:5000/api/auth/ping
curl http://localhost:5000/api/admin/stats
```

---

## 🔗 Branche précédente

- `main` – version complète du produit (toutes fonctionnalités).  
  Utilisez `git checkout main` pour revenir à la version finale.

---

## 🔄 Prochain sprint

- `sprint2` activera les modules **RH**, **Stocks** et **Équipements**, ainsi que les notifications internes de base.

---

Bon sprint et bonne démo ! 🚀

