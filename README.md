# ERP-TP

**ERP interne spécialisé pour le domaine TP (Travaux Publics)**  
Ce projet permet de gérer : stock, ventes, achats, clients, fournisseurs, employés et équipements pour une entreprise TP.

---

## 📁 Structure du projet


---

## ⚙️ Technologies

- **Backend** : Node.js, Express.js, MongoDB, Mongoose  
- **Frontend** : React, Tailwind CSS  
- **Authentification** : JWT + rôles (admin, stock, vente, achat, RH, technicien, comptable)  

---

## 🚀 Installation

### Backend

1. Aller dans le dossier `backend` :

```bash
cd backend


npm install

PORT=5000
MONGO_URI=<ton_mongodb_uri>
JWT_SECRET=<une_clef_secrete>

npm run dev

cd frontend

npm install

Lancer le frontend :

npm start


Le frontend tournera sur http://localhost:3000

🔐 Authentification

Signup / Login avec email + mot de passe

Rôles utilisateurs : admin, stock, vente, achat, RH, technicien, comptable

Accès limité selon rôle pour chaque module

📦 Modules

Stock : Ajouter / modifier / supprimer produits

Ventes : Créer propositions, devis, factures, mise à jour stock

Achats : Commandes fournisseurs, réception, mise à jour stock

RH : Gestion employés (poste, salaire, présence)

Équipements : Suivi machines, maintenance

Clients / Fournisseurs : Gestion informations et historique

💡 Fonctionnalités

Tableau de bord avec statistiques en temps réel

Mises à jour automatiques du stock selon ventes et achats

Sauvegarde et sécurité via JWT

Gestion complète des utilisateurs et rôles

git checkout -b feature/nom-de-fonctionnalite

Commits fréquents avec messages clairs :

git add .
git commit -m "Message descriptif"
git push origin feature/nom-de-fonctionnalite


MIT License


---
