# 🚀 Guide de Démarrage MongoDB (Sans Erreur d'Accès)

## ❌ Problème: "Erreur système 5 - Accès refusé"

Cette erreur se produit quand on essaie de démarrer le service MongoDB sans privilèges administrateur.

## ✅ Solutions

### Solution 1: Démarrer MongoDB en tant qu'Administrateur (Recommandé)

1. **Fermez tous les terminaux**
2. **Clic droit** sur PowerShell ou CMD
3. Sélectionnez **"Exécuter en tant qu'administrateur"**
4. Naviguez vers le projet:
   ```powershell
   cd C:\Users\Acer\ERP-TP
   ```
5. Démarrez MongoDB:
   ```powershell
   net start MongoDB
   ```
   Ou:
   ```powershell
   .\start-mongodb.bat
   ```

### Solution 2: Utiliser le Script Sans Admin (Nouveau)

J'ai créé un nouveau script qui ne nécessite pas de privilèges administrateur:

```powershell
.\DEMARRER_SANS_ADMIN.bat
```

Ce script:
- ✅ Vérifie si MongoDB est déjà en cours d'exécution
- ✅ Ne tente pas de démarrer le service (évite l'erreur)
- ✅ Vous permet de continuer si MongoDB est déjà démarré
- ✅ Fonctionne sans privilèges administrateur

### Solution 3: Démarrer MongoDB Manuellement (Sans Service)

Si vous ne pouvez pas utiliser le service, démarrez MongoDB manuellement:

1. Ouvrez un terminal normal (pas besoin d'admin)
2. Créez le dossier de données si nécessaire:
   ```powershell
   mkdir C:\data\db
   ```
3. Démarrez MongoDB:
   ```powershell
   mongod --dbpath C:\data\db
   ```
4. Laissez ce terminal ouvert
5. Dans un autre terminal, lancez l'application:
   ```powershell
   .\DEMARRER_SANS_ADMIN.bat
   ```

### Solution 4: Utiliser MongoDB Atlas (Cloud - Gratuit)

Si vous ne pouvez pas démarrer MongoDB localement:

1. Créez un compte sur https://www.mongodb.com/cloud/atlas
2. Créez un cluster gratuit (M0)
3. Obtenez la connection string
4. Modifiez `backend/.env`:
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/erp-tp?retryWrites=true&w=majority
   ```
5. Lancez l'application normalement

## 📋 Scripts Disponibles

### 1. `DEMARRER.bat` (Modifié)
- Vérifie si MongoDB est en cours d'exécution
- Ne tente plus de démarrer le service (évite l'erreur)
- Vous demande si vous voulez continuer

### 2. `DEMARRER_SANS_ADMIN.bat` (Nouveau - Recommandé)
- **Fonctionne sans privilèges administrateur**
- Vérifie si MongoDB est déjà démarré
- Continue même si MongoDB n'est pas démarré (vous pouvez le démarrer manuellement)

### 3. `TEST_COMPLET.bat` (Nouveau)
- Teste tous les composants du système
- Vérifie MongoDB, configuration, données
- Teste le backend

### 4. `start-mongodb.bat` (Modifié)
- Vérifie d'abord si MongoDB est déjà en cours d'exécution
- Affiche un message clair si accès refusé
- Propose des alternatives

## 🎯 Démarrage Rapide (Sans Admin)

1. **Démarrez MongoDB** (choisissez une méthode):
   - Option A: Terminal admin → `net start MongoDB`
   - Option B: Terminal normal → `mongod --dbpath C:\data\db` (laissez ouvert)
   - Option C: MongoDB Atlas (cloud)

2. **Lancez l'application**:
   ```powershell
   .\DEMARRER_SANS_ADMIN.bat
   ```

3. **Ouvrez votre navigateur**:
   ```
   http://localhost:5173
   ```

4. **Connectez-vous**:
   - Email: `admin@tp.com`
   - Mot de passe: `admin123`

## ✅ Vérification

Pour vérifier que MongoDB fonctionne:

```powershell
# Vérifier si MongoDB est en cours d'exécution
tasklist | findstr mongod

# Ou tester la connexion
cd backend
node setup-database.js
```

## 🐛 Résolution de Problèmes

### MongoDB ne démarre pas
- Vérifiez que MongoDB est installé: `mongod --version`
- Vérifiez que le port 27017 n'est pas utilisé
- Utilisez MongoDB Atlas si problème persiste

### L'application ne se connecte pas à MongoDB
- Vérifiez que MongoDB est en cours d'exécution
- Vérifiez `MONGO_URI` dans `backend/.env`
- Testez avec: `cd backend && node setup-database.js`

### Erreur "Accès refusé" persiste
- Utilisez `DEMARRER_SANS_ADMIN.bat` au lieu de `DEMARRER.bat`
- Ou démarrez MongoDB manuellement dans un terminal séparé

---

**Astuce:** Si vous utilisez souvent l'application, démarrez MongoDB une fois en admin, puis utilisez `DEMARRER_SANS_ADMIN.bat` pour lancer l'application.



