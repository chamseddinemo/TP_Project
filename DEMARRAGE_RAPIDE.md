# 🚀 Guide de Démarrage Rapide - ERP-TP

## ⚠️ IMPORTANT: Configuration MongoDB

Pour que l'application fonctionne, **MongoDB doit être configuré et en cours d'exécution**.

### Option 1: MongoDB Local (Recommandé pour développement)

#### Windows:
1. **Vérifier si MongoDB est installé:**
   ```powershell
   mongod --version
   ```

2. **Démarrer MongoDB:**
   ```powershell
   # Option A: Démarrer le service Windows
   net start MongoDB
   
   # Option B: Démarrer manuellement
   mongod --dbpath C:\data\db
   ```
   
   > **Note:** Si le dossier `C:\data\db` n'existe pas, créez-le d'abord.

3. **Vérifier la connexion:**
   ```powershell
   cd backend
   node setup-database.js
   ```

### Option 2: MongoDB Atlas (Cloud - Gratuit)

1. **Créer un compte:**
   - Allez sur https://www.mongodb.com/cloud/atlas
   - Créez un compte gratuit

2. **Créer un cluster:**
   - Cliquez sur "Build a Database"
   - Choisissez "FREE" (M0)
   - Sélectionnez une région proche
   - Créez le cluster

3. **Configurer la connexion:**
   - Cliquez sur "Connect"
   - Choisissez "Connect your application"
   - Copiez la connection string (elle ressemble à: `mongodb+srv://username:password@cluster.mongodb.net/`)
   - Remplacez `<password>` par votre mot de passe MongoDB
   - Remplacez `<dbname>` par `erp-tp`

4. **Mettre à jour le fichier .env:**
   ```env
   MONGO_URI=mongodb+srv://votre_username:votre_password@cluster.mongodb.net/erp-tp?retryWrites=true&w=majority
   ```

5. **Autoriser votre IP:**
   - Dans MongoDB Atlas, allez dans "Network Access"
   - Cliquez sur "Add IP Address"
   - Cliquez sur "Allow Access from Anywhere" (pour développement) ou ajoutez votre IP

---

## 📦 Installation et Configuration

### 1. Installer les dépendances

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

### 2. Configurer l'environnement

Le fichier `backend/.env` devrait contenir:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/erp-tp
JWT_SECRET=votre_secret_jwt_super_securise_2024_12345
FRONTEND_URL=http://localhost:5173
```

### 3. Initialiser la base de données

```powershell
cd backend
node setup-database.js    # Vérifie la connexion MongoDB
node seedAll.js           # Crée tous les utilisateurs et données de test
```

---

## 🎯 Démarrer l'application

### Méthode 1: Lancer tout en une fois (Recommandé)

```powershell
# À la racine du projet
npm run dev
```

Cette commande lance automatiquement:
- ✅ Backend sur http://localhost:5000
- ✅ Frontend sur http://localhost:5173 (ou 5174 si 5173 est occupé)

### Méthode 2: Lancer séparément

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

### Méthode 3: Via VS Code

1. Appuyez sur `F5`
2. Sélectionnez "🚀 Lancer Backend + Frontend (Recommandé)"
3. Ou utilisez `Ctrl + Shift + P` → `Tasks: Run Task` → "🚀 Lancer Tout"

---

## 🔐 Comptes de test

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

---

## 🐛 Résolution de problèmes

### Erreur: "MongoDB non accessible"

**Solution 1:** Démarrer MongoDB localement
```powershell
net start MongoDB
# Ou
mongod --dbpath C:\data\db
```

**Solution 2:** Utiliser MongoDB Atlas (voir Option 2 ci-dessus)

**Solution 3:** Vérifier que le port 27017 n'est pas utilisé
```powershell
netstat -ano | findstr :27017
```

### Erreur: "JWT_SECRET n'est pas défini"

Vérifiez que le fichier `backend/.env` existe et contient:
```env
JWT_SECRET=votre_secret_jwt_super_securise_2024_12345
```

### Erreur: "Port 5173 already in use"

Le frontend utilisera automatiquement le port 5174. C'est normal.

### Erreur d'authentification

1. Vérifiez que MongoDB fonctionne
2. Vérifiez que les utilisateurs sont créés: `node backend/seedAll.js`
3. Vérifiez les logs du backend dans le terminal

---

## ✅ Vérification

Une fois tout démarré, vous devriez voir:

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

**Test de connexion:**
1. Ouvrez http://localhost:5173
2. Connectez-vous avec `admin@tp.com` / `admin123`
3. Vous devriez être redirigé vers le dashboard admin

---

## 📞 Support

Si vous rencontrez des problèmes:
1. Vérifiez que MongoDB est démarré
2. Vérifiez les logs dans les terminaux
3. Vérifiez que le fichier `.env` est correctement configuré
4. Exécutez `node backend/setup-database.js` pour diagnostiquer

---

**Bon développement ! 🚀**

