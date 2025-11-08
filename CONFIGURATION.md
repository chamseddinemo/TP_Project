# 🔧 Guide de Configuration - ERP-TP

## ⚠️ Configuration Requise

### 1. Fichier .env Backend

Le fichier `.env` est **obligatoire** pour que le backend fonctionne. Il sera créé automatiquement lors de l'initialisation, mais vous pouvez aussi le créer manuellement.

**Emplacement:** `backend/.env`

**Contenu minimal:**
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/erp-tp
JWT_SECRET=votre_secret_jwt_super_securise_2024_12345_changez_moi_en_production
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

**Création automatique:**
```bash
cd backend
node create-env.js
```

### 2. Configuration MongoDB

#### Option A: MongoDB Local (Recommandé pour développement)

1. **Installer MongoDB:**
   - Télécharger depuis: https://www.mongodb.com/try/download/community
   - Installer et démarrer le service

2. **Démarrer MongoDB:**
   ```powershell
   # Windows (Service)
   net start MongoDB
   
   # Ou manuellement
   mongod --dbpath C:\data\db
   ```

3. **Vérifier la connexion:**
   ```powershell
   cd backend
   node setup-database.js
   ```

#### Option B: MongoDB Atlas (Cloud - Gratuit)

1. Créer un compte sur https://www.mongodb.com/cloud/atlas
2. Créer un cluster gratuit (M0)
3. Obtenir la connection string
4. Mettre à jour `MONGO_URI` dans `backend/.env`:
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/erp-tp?retryWrites=true&w=majority
   ```

### 3. Installation des Dépendances

```powershell
# À la racine du projet
npm install

# Backend
cd backend
npm install
cd ..

# Frontend
cd frontend
npm install
cd ..
```

**Ou utilisez le script automatique:**
```powershell
.\INITIALISER_PROJET.bat
```

### 4. Initialisation de la Base de Données

```powershell
cd backend
node setup-database.js    # Vérifie la connexion
node seedAll.js           # Crée les utilisateurs de test
```

## 🚀 Démarrage

### Méthode 1: Script Automatique (Recommandé)
```powershell
.\DEMARRER.bat
```

### Méthode 2: Commande NPM
```powershell
npm run dev
```

### Méthode 3: Séparément

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

## ✅ Vérification

Une fois démarré, vous devriez voir:

**Backend:**
```
✅ MongoDB connecté
Server running on port 5000
```

**Frontend:**
```
VITE v7.1.12  ready in XXX ms
➜  Local:   http://localhost:5173/
```

## 🔐 Comptes de Test

Après avoir exécuté `node seedAll.js`, vous pouvez vous connecter avec:

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| **Admin** | `admin@tp.com` | `admin123` |
| Stock | `stock@tp.com` | `123456` |
| Ventes | `vente@tp.com` | `123456` |
| Achats | `achat@tp.com` | `123456` |
| RH | `rh@tp.com` | `123456` |
| Comptable | `comptable@tp.com` | `123456` |
| Technicien | `technicien@tp.com` | `123456` |

## 🐛 Résolution de Problèmes

### Erreur: "MONGO_URI n'est pas défini"
**Solution:** Créer le fichier `backend/.env` avec les variables d'environnement

### Erreur: "MongoDB non accessible"
**Solution:** 
1. Démarrer MongoDB: `net start MongoDB` ou `start-mongodb.bat`
2. Vérifier que le port 27017 n'est pas utilisé
3. Utiliser MongoDB Atlas si MongoDB local ne fonctionne pas

### Erreur: "JWT_SECRET n'est pas défini"
**Solution:** Vérifier que `JWT_SECRET` est présent dans `backend/.env`

### Erreur: "Port 5000 already in use"
**Solution:** Changer le port dans `backend/.env` ou arrêter l'application qui utilise le port 5000

### Erreur: "Port 5173 already in use"
**Solution:** Vite utilisera automatiquement le port suivant (5174). C'est normal.

### Erreur de connexion frontend-backend
**Solution:** 
1. Vérifier que le backend est démarré sur le port 5000
2. Vérifier que `FRONTEND_URL` dans `.env` correspond à l'URL du frontend
3. Vérifier les paramètres CORS dans `backend/server.js`

## 📝 Notes Importantes

1. **Le fichier `.env` ne doit JAMAIS être commité dans Git** (il est dans `.gitignore`)
2. **Changez `JWT_SECRET` en production** pour la sécurité
3. **MongoDB doit être démarré avant de lancer l'application**
4. **Les utilisateurs de test sont créés uniquement après `node seedAll.js`**

## 🔄 Réinitialisation

Pour réinitialiser complètement le projet:

```powershell
# Supprimer node_modules
rm -r node_modules backend/node_modules frontend/node_modules

# Réinstaller
.\INITIALISER_PROJET.bat
```

---

**Bon développement ! 🚀**



