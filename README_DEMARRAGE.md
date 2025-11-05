# 🚀 ERP-TP - Guide de Démarrage Rapide

## ⚡ Démarrage Ultra-Rapide (3 commandes)

### 1️⃣ Initialiser la base de données avec toutes les données de test

```powershell
cd C:\Users\Acer\ERP-TP\backend
node seedAll.js
```

Cette commande crée **TOUT** automatiquement:
- ✅ 7 utilisateurs avec différents rôles
- ✅ 6 employés québécois (secteur construction)
- ✅ 6 contrats de travail
- ✅ 4 produits
- ✅ 1 client et 1 fournisseur

### 2️⃣ Démarrer le Backend

```powershell
cd C:\Users\Acer\ERP-TP\backend
npm run dev
```

Le backend démarre sur **http://localhost:5000**

### 3️⃣ Démarrer le Frontend (Nouvelle fenêtre PowerShell)

```powershell
cd C:\Users\Acer\ERP-TP\frontend
npm run dev
```

Le frontend démarre sur **http://localhost:5173**

## 🔐 Comptes de Connexion

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| **Admin** | `admin@tp.com` | `admin123` |
| Stock | `stock@tp.com` | `123456` |
| Ventes | `vente@tp.com` | `123456` |
| Achats | `achat@tp.com` | `123456` |
| RH | `rh@tp.com` | `123456` |
| Comptable | `comptable@tp.com` | `123456` |
| Technicien | `technicien@tp.com` | `123456` |

## 🇨🇦 Fonctionnalités Québec - Construction

### 💰 Système de Paie

1. Connectez-vous avec le compte RH ou Admin
2. Allez sur **http://localhost:5173/rh/paie**
3. Vous verrez 6 employés avec leurs calculs de salaire
4. Cliquez sur **"Générer tout"** pour créer toutes les fiches de paie
5. Cliquez sur 📥 pour télécharger une fiche individuelle

### 👷 Gestion des Employés

- **http://localhost:5173/rh/employes** - Liste complète
- **http://localhost:5173/rh/temps** - Feuilles de temps (vue hebdomadaire)
- **http://localhost:5173/rh/paie** - Paie & Contrats

### 📊 Dashboards

- **http://localhost:5173/dashboard/admin** - Vue globale (admin)
- **http://localhost:5173/dashboard/rh** - Vue RH
- **http://localhost:5173/dashboard/stock** - Vue Stock
- **http://localhost:5173/dashboard/vente** - Vue Ventes

## 🛠️ Commandes Utiles

### Réinitialiser toutes les données

```powershell
cd C:\Users\Acer\ERP-TP\backend
node seedAll.js
```

### Créer seulement les employés

```powershell
cd C:\Users\Acer\ERP-TP\backend
node seedEmployees.js
```

### Créer seulement les contrats

```powershell
cd C:\Users\Acer\ERP-TP\backend
node seedContracts.js
```

### Vérifier que MongoDB fonctionne

```powershell
Get-Service MongoDB
```

Si MongoDB n'est pas démarré:
```powershell
Start-Service MongoDB
```

## ❓ Problèmes Courants

### "Failed to load resource: net::ERR_CONNECTION_REFUSED"

✅ **Solution**: Le backend n'est pas démarré
```powershell
cd C:\Users\Acer\ERP-TP\backend
npm run dev
```

### "MongoDB connection error"

✅ **Solution**: MongoDB n'est pas démarré
```powershell
Start-Service MongoDB
```

### Page blanche ou erreur React

✅ **Solution**: Videz le cache et rechargez
- Appuyez sur `Ctrl + Shift + R`
- Ou `Ctrl + F5`

### Les employés n'apparaissent pas

✅ **Solution**: Réexécutez le seed
```powershell
cd C:\Users\Acer\ERP-TP\backend
node seedAll.js
```

## 📝 Structure du Projet

```
ERP-TP/
├── backend/          # API Node.js/Express
│   ├── models/       # Modèles MongoDB
│   ├── routes/       # Routes API
│   ├── controllers/  # Logique métier
│   ├── seed*.js      # Scripts de données de test
│   └── server.js     # Point d'entrée
│
├── frontend/         # React + Vite
│   ├── src/
│   │   ├── pages/    # Pages de l'application
│   │   ├── components/ # Composants réutilisables
│   │   └── services/ # Appels API
│   └── package.json
│
└── README_DEMARRAGE.md  # Ce fichier
```

## 🎯 Prochaines Étapes

1. ✅ Connectez-vous sur http://localhost:5173
2. ✅ Testez le compte admin: `admin@tp.com` / `admin123`
3. ✅ Explorez les différents modules (RH, Stock, Ventes, etc.)
4. ✅ Générez des fiches de paie sur `/rh/paie`
5. ✅ Ajoutez vos propres données!

## 📞 Support

- Backend API: http://localhost:5000
- Frontend: http://localhost:5173
- Documentation Paie: `backend/GUIDE_PAIE.md`

**Bon développement! 🚀**

