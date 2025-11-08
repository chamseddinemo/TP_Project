# ERP-TP

**ERP interne spécialisé pour le domaine TP (Travaux Publics)**  
Système de gestion complet pour entreprise de travaux publics : stock, ventes, achats, clients, fournisseurs, employés et équipements.

---

## ⚙️ Technologies

- **Backend** : Node.js, Express.js, MongoDB, Mongoose  
- **Frontend** : React, Vite, Tailwind CSS  
- **Authentification** : JWT + rôles (admin, stock, vente, achat, RH, technicien, comptable)

---

## 🚀 Démarrage Rapide

### Prérequis

- Node.js (v14 ou supérieur)
- MongoDB (local ou Atlas)
- npm ou yarn

### Installation

1. **Installer les dépendances**

```powershell
# À la racine du projet
npm install

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

2. **Configurer l'environnement**

Créez un fichier `backend/.env` :

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/erp-tp
JWT_SECRET=votre_secret_jwt_super_securise_2024_12345
FRONTEND_URL=http://localhost:5173
```

3. **Démarrer MongoDB**

```powershell
# Option 1: Service Windows
net start MongoDB

# Option 2: Script fourni
.\start-mongodb.bat

# Option 3: Manuellement
mongod --dbpath C:\data\db
```

4. **Initialiser la base de données**

```powershell
cd backend
node seedAll.js
```

5. **Démarrer l'application**

```powershell
# À la racine du projet
npm run dev
```

L'application sera accessible sur :
- **Frontend** : http://localhost:5173
- **Backend** : http://localhost:5000

---

## 🔐 Comptes de Test

Après avoir exécuté `seedAll.js`, vous pouvez vous connecter avec :

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| **Admin** | admin@tp.com | admin123 |
| Stock | stock@tp.com | 123456 |
| Ventes | vente@tp.com | 123456 |
| Achats | achat@tp.com | 123456 |
| RH | rh@tp.com | 123456 |
| Comptable | comptable@tp.com | 123456 |
| Technicien | technicien@tp.com | 123456 |

---

## 📦 Modules Disponibles

### Stock
- Gestion des produits
- Suivi des quantités
- Alertes de stock faible
- Catégories de produits

### Ventes
- Création de propositions
- Génération de devis
- Facturation
- Gestion des clients

### Achats
- Commandes fournisseurs
- Réception de marchandises
- Gestion des fournisseurs
- Historique des achats

### Ressources Humaines
- Gestion des employés
- Fiches de paie
- Contrats de travail
- Feuilles de temps
- Recrutement

### Finance
- Budgets
- Transactions
- Rapports financiers
- Salaires

### Équipements
- Suivi des équipements
- Maintenance préventive
- Historique de maintenance
- Statut des équipements

---

## 🛠️ Commandes Utiles

### Démarrage
```powershell
npm run dev                    # Démarrer backend + frontend
npm run dev:backend           # Démarrer uniquement le backend
npm run dev:frontend          # Démarrer uniquement le frontend
```

### Base de données
```powershell
cd backend
node setup-database.js        # Vérifier la connexion MongoDB
node seedAll.js               # Initialiser toutes les données
node seedEmployees.js         # Initialiser uniquement les employés
```

### MongoDB
```powershell
net start MongoDB             # Démarrer MongoDB (Windows)
.\start-mongodb.bat           # Script de démarrage
```

---

## 📁 Structure du Projet

```
ERP-TP/
├── backend/              # API Node.js/Express
│   ├── config/          # Configuration
│   ├── controllers/     # Contrôleurs
│   ├── models/          # Modèles MongoDB
│   ├── routes/          # Routes API
│   ├── middleware/      # Middlewares
│   ├── utils/           # Utilitaires
│   ├── server.js        # Point d'entrée
│   └── seedAll.js       # Script d'initialisation
│
├── frontend/            # Application React
│   ├── src/
│   │   ├── components/  # Composants réutilisables
│   │   ├── pages/       # Pages de l'application
│   │   ├── services/    # Services API
│   │   ├── context/     # Contextes React
│   │   └── utils/       # Utilitaires
│   └── vite.config.js
│
├── README.md            # Ce fichier
├── DEMARRAGE_RAPIDE.md  # Guide de démarrage détaillé
└── package.json         # Configuration du projet
```

---

## 🔧 Résolution de Problèmes

### MongoDB ne démarre pas
```powershell
# Vérifier le service
Get-Service MongoDB

# Démarrer le service
net start MongoDB

# Ou démarrer manuellement
mongod --dbpath C:\data\db
```

### Port déjà utilisé
- Backend : Changez `PORT` dans `backend/.env`
- Frontend : Vite utilisera automatiquement le port suivant disponible

### Erreur de connexion MongoDB
- Vérifiez que MongoDB est démarré
- Vérifiez `MONGO_URI` dans `backend/.env`
- Utilisez MongoDB Atlas (cloud) si nécessaire

---

## 📝 Licence

MIT License

---

## 📞 Support

Pour plus d'informations, consultez `DEMARRAGE_RAPIDE.md`

**Bon développement ! 🚀**
