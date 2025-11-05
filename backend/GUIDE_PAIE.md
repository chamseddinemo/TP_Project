# 🇨🇦 Guide - Système de Paie Québécois

## 🚀 Démarrage Rapide

### 1. Créer des employés de test

Dans le dossier backend, exécutez:

```powershell
cd C:\Users\Acer\ERP-TP\backend
node seedEmployees.js
```

Cela va créer **6 employés de test** avec:
- Noms québécois authentiques
- Salaires réalistes (55 000$ - 75 000$ CAD)
- Postes variés (Chef de chantier, Ingénieur, Ouvrier, RH, Comptable)
- Numéros d'assurance sociale
- Adresses au Québec

### 2. Tester la génération de paie

1. Allez sur **http://localhost:5173/rh/paie**
2. Vous verrez tous les employés avec leurs calculs de salaire
3. Cliquez sur **"Générer tout"** en haut
4. Confirmez → Les fiches de paie sont créées pour tous les employés!

### 3. Télécharger une fiche de paie

Pour chaque employé, cliquez sur le bouton **📥 Download** pour télécharger sa fiche de paie en format texte.

## 💰 Calculs de Salaire - Québec Construction

### Déductions appliquées:

| Déduction | Taux | Description |
|-----------|------|-------------|
| **RRQ** | 6.4% | Régime de rentes du Québec |
| **AE** | 1.58% | Assurance-emploi (fédéral) |
| **RQAP** | 0.494% | Assurance parentale Québec |
| **CCQ** | 2% | Commission construction Québec |
| **CNESST** | 1.5% | Santé-sécurité au travail |
| **Impôt provincial** | 15% | Impôt Québec |
| **Impôt fédéral** | 12% | Impôt Canada |
| **TOTAL** | ~38.97% | Total des déductions |

### Exemple pour 3000$ CAD brut:

```
Salaire brut:     3000.00 $ CAD
Déductions:      -1169.22 $ CAD
Salaire net:      1830.78 $ CAD
```

## 🔍 Vérification

Pour vérifier que les employés sont bien créés:

```javascript
// Dans la console MongoDB
use erp_tp
db.employees.find().pretty()
```

Ou simplement allez sur **/rh/employes** dans l'application.

## ✅ Fonctionnalités

- ✅ Calculs automatiques selon les normes du Québec
- ✅ Génération individuelle ou en masse
- ✅ Téléchargement de fiches de paie
- ✅ Détails complets des déductions
- ✅ Support des salaires annuels
- ✅ Interface adaptée secteur construction

## 📞 Support

Pour toute question ou problème, vérifiez:
1. Que MongoDB est démarré
2. Que le backend est en cours (port 5000)
3. Que le frontend est en cours (port 5173)

