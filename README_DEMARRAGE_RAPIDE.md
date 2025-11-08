# 🚀 Démarrage Rapide - ERP-TP

## ⚡ Démarrage en 3 Étapes

### 1️⃣ Démarrer MongoDB

**Option A - Service Windows (Recommandé si vous avez les droits admin):**
```powershell
# Dans un terminal administrateur
net start MongoDB
```

**Option B - Manuellement (Si pas de droits admin):**
```powershell
# Dans un terminal normal
mongod --dbpath C:\data\db
# ⚠️ Laissez ce terminal ouvert
```

**Option C - MongoDB Atlas (Cloud - Gratuit):**
- Allez sur https://www.mongodb.com/cloud/atlas
- Créez un compte et un cluster gratuit
- Modifiez `backend/.env` avec votre connection string

### 2️⃣ Lancer l'Application

```powershell
.\DEMARRER_SANS_ADMIN.bat
```

Ce script:
- ✅ Vérifie MongoDB (sans erreur)
- ✅ Crée le `.env` si nécessaire
- ✅ Initialise la base de données
- ✅ Lance backend + frontend

### 3️⃣ Ouvrir le Navigateur

```
http://localhost:5173
```

**Connectez-vous avec:**
- Email: `admin@tp.com`
- Mot de passe: `admin123`

## ✅ Vérification Rapide

**MongoDB fonctionne?**
```powershell
tasklist | findstr mongod
```

**Backend fonctionne?**
Ouvrez: http://localhost:5000
Vous devriez voir: `🚀 Backend connecté !`

**Frontend fonctionne?**
Ouvrez: http://localhost:5173
Vous devriez voir la page d'accueil

## 🐛 Problèmes Courants

### "MongoDB n'est pas démarré"
→ Démarrez MongoDB (voir étape 1)

### "Erreur accès refusé"
→ Utilisez `DEMARRER_SANS_ADMIN.bat` (déjà corrigé)

### "Port 5000 déjà utilisé"
→ Arrêtez l'application qui utilise le port 5000

### "Port 5173 déjà utilisé"
→ Vite utilisera automatiquement le port 5174

## 📚 Plus d'Informations

- Guide complet: `CONFIGURATION.md`
- Guide MongoDB: `GUIDE_DEMARRAGE_MONGODB.md`
- Vérification système: `cd backend && npm run verify`

---

**C'est tout! 🎉**



