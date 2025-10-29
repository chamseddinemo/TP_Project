# Module Ressources Humaines (RH)

## Vue d'ensemble

Module professionnel de gestion des ressources humaines pour ERP de travaux publics, comprenant 4 sections principales.

## 🎯 Fonctionnalités

### 1️⃣ Gestion des Employés (`EmployeesPage.jsx`)

**Fonctionnalités principales:**
- ✅ Tableau interactif avec toutes les informations des employés
- ✅ Recherche en temps réel (nom, prénom, poste, email)
- ✅ Filtres avancés (poste, service, ancienneté)
- ✅ CRUD complet (Créer, Lire, Modifier, Supprimer)
- ✅ Export CSV des données
- ✅ Photos de profil avec fallback initiales
- ✅ Boutons d'accès rapide aux documents et historique
- ✅ Design responsive et moderne

**Champs gérés:**
- Informations personnelles: nom, prénom, email, téléphone, CIN, adresse
- Situation familiale: statut, nombre d'enfants
- Informations professionnelles: poste, service, salaire, date d'embauche
- Sécurité sociale: numéro SS
- Photo de profil (URL)

### 2️⃣ Recrutement (`RecruitmentPage.jsx`)

**Fonctionnalités principales:**
- ✅ Gestion des offres d'emploi (création, modification, suppression)
- ✅ Affichage des offres actives sous forme de cartes
- ✅ Gestion des candidatures reçues
- ✅ Système de notation des candidats (1-5 étoiles)
- ✅ Mise à jour du statut (Nouveau, En cours, Accepté, Refusé)
- ✅ Envoi d'invitations aux entretiens par email
- ✅ Vue tabulaire des candidatures avec filtres
- ✅ Accès aux CV et lettres de motivation

**Champs offres d'emploi:**
- Titre du poste
- Département
- Type de contrat (CDI, CDD, Stage, Freelance)
- Salaire proposé
- Date limite de candidature
- Description détaillée
- Compétences requises
- Statut (Actif, Fermé, Brouillon)

### 3️⃣ Feuilles de temps (`TimesheetsPage.jsx`)

**Fonctionnalités principales:**
- ✅ Saisie des heures par jour pour chaque employé
- ✅ Distinction heures normales / heures supplémentaires
- ✅ Gestion des types de jours (Travail, Congé, RTT, Absence, Maladie)
- ✅ Calcul automatique des totaux mensuels
- ✅ Statistiques en temps réel (heures normales, heures supp, congés, absences)
- ✅ Sélection employé, mois et année
- ✅ Notes par jour
- ✅ Export PDF et Excel (intégration prévue)
- ✅ Mise en évidence des weekends
- ✅ Désactivation automatique des champs selon le type de jour

**Statistiques affichées:**
- Total heures normales du mois
- Total heures supplémentaires du mois
- Nombre de jours de congé
- Nombre de jours d'absence

### 4️⃣ Paie & Contrats (`PayrollPage.jsx`)

**Fonctionnalités principales:**
- ✅ Génération automatique des fiches de paie
- ✅ Calcul des cotisations sociales (CNSS, Retraite, CNAM)
- ✅ Calcul du salaire net après déductions
- ✅ Vue détaillée des cotisations par employé
- ✅ Gestion des contrats de travail
- ✅ Types de contrats (CDI, CDD, Stage, Freelance)
- ✅ Suivi des dates de début et fin de contrat
- ✅ Statut des contrats (Actif, Terminé, Suspendu)
- ✅ Export des fiches de paie (prévu)

**Calculs de paie:**
- Salaire brut de base
- Cotisations CNSS (9.4%)
- Cotisations retraite (2%)
- Cotisations CNAM (1%)
- Salaire net = Brut - Total cotisations

## 🎨 Design & UX

### Caractéristiques du design

- **Style moderne et professionnel**: Couleurs sobres (bleu, gris, blanc)
- **Glassmorphism**: Effets de verre sur les cartes
- **Mode sombre/clair**: Synchronisé avec les préférences de l'application
- **Responsive**: Compatible ordinateur et tablette
- **Animations**: Hover effects, transitions fluides
- **Icônes intuitives**: React Icons (Font Awesome)
- **Gradients**: Textes et cartes avec dégradés modernes
- **Accessibilité**: Navigation clavier, ARIA labels

### Palette de couleurs

- Primaire: Bleu (#3b82f6)
- Secondaire: Violet (#a855f7)
- Succès: Vert (#10b981)
- Danger: Rouge (#ef4444)
- Avertissement: Jaune/Orange (#f59e0b)
- Neutre: Gris (multiples nuances)

## 📡 API Backend

### Routes disponibles

#### Employés
- `GET /api/rh/employees` - Liste tous les employés
- `GET /api/rh/employees/:id` - Détails d'un employé
- `POST /api/rh/employees` - Créer un employé
- `PUT /api/rh/employees/:id` - Modifier un employé
- `DELETE /api/rh/employees/:id` - Supprimer un employé

#### Offres d'emploi
- `GET /api/rh/job-offers` - Liste toutes les offres
- `POST /api/rh/job-offers` - Créer une offre
- `PUT /api/rh/job-offers/:id` - Modifier une offre
- `DELETE /api/rh/job-offers/:id` - Supprimer une offre

#### Candidatures
- `GET /api/rh/applications` - Liste les candidatures
- `POST /api/rh/applications` - Créer une candidature
- `PUT /api/rh/applications/:id` - Mettre à jour statut/note
- `POST /api/rh/applications/:id/invite` - Envoyer invitation entretien

#### Feuilles de temps
- `GET /api/rh/timesheets` - Récupérer les feuilles (filtres: employeeId, month, year)
- `POST /api/rh/timesheets` - Créer/mettre à jour une feuille
- `PUT /api/rh/timesheets/:id` - Modifier une feuille
- `GET /api/rh/timesheets/export/pdf` - Export PDF (à implémenter)
- `GET /api/rh/timesheets/export/excel` - Export Excel (à implémenter)

#### Fiches de paie
- `GET /api/rh/payslips` - Liste les fiches de paie
- `POST /api/rh/payslips/generate` - Générer une fiche de paie

#### Contrats
- `GET /api/rh/contracts` - Liste les contrats
- `POST /api/rh/contracts` - Créer un contrat
- `PUT /api/rh/contracts/:id` - Modifier un contrat

#### Congés
- `GET /api/rh/leaves` - Liste les demandes de congé
- `POST /api/rh/leaves` - Demander un congé
- `PUT /api/rh/leaves/:id` - Approuver/refuser un congé

## 🗄️ Modèles de données

### Employee
```javascript
{
  nom: String (requis),
  prenom: String (requis),
  email: String (requis, unique),
  telephone: String,
  poste: String (requis),
  service: String,
  salaire: Number,
  dateEmbauche: Date,
  photo: String (URL),
  adresse: String,
  cin: String,
  numeroSecuriteSociale: String,
  situationFamiliale: Enum,
  nombreEnfants: Number,
  statut: Enum
}
```

### JobOffer
```javascript
{
  titre: String (requis),
  departement: String,
  typeContrat: Enum (CDI, CDD, Stage, Freelance),
  salaire: Number,
  dateLimite: Date,
  description: String,
  competences: String,
  statut: Enum (Actif, Fermé, Brouillon)
}
```

### Timesheet
```javascript
{
  employeId: ObjectId (ref: Employee),
  mois: Number (1-12),
  annee: Number,
  jours: [{
    date: String,
    heuresNormales: Number,
    heuresSupplementaires: Number,
    type: Enum (Travail, Congé, RTT, Absence, Maladie),
    note: String
  }]
}
```

### Contract
```javascript
{
  employeId: ObjectId (ref: Employee),
  typeContrat: Enum (CDI, CDD, Stage, Freelance),
  dateDebut: Date,
  dateFin: Date,
  salaire: Number,
  poste: String,
  statut: Enum (Actif, Terminé, Suspendu),
  document: String (URL)
}
```

## 🚀 Utilisation

### Installation

```bash
# Frontend
cd frontend
npm install

# Backend
cd backend
npm install
```

### Lancement

```bash
# Backend (port 5000)
cd backend
npm run dev

# Frontend (port 3000)
cd frontend
npm start
```

### Accès au module RH

Les routes suivantes sont disponibles :
- `/rh/employes` - Gestion des employés
- `/rh/recrutement` - Recrutement
- `/rh/temps` - Feuilles de temps
- `/rh/paie` - Paie & Contrats

**Rôles autorisés**: `rh`, `admin`

## 🔒 Sécurité

- Routes protégées par authentification JWT
- Accès limité aux rôles RH et Admin
- Validation des données côté backend
- Protection contre les injections

## 📋 To-Do / Améliorations futures

- [ ] Implémentation complète de l'export PDF (pdfkit ou puppeteer)
- [ ] Implémentation complète de l'export Excel (exceljs)
- [ ] Envoi d'emails automatiques (nodemailer)
- [ ] Upload de fichiers (CV, documents, photos)
- [ ] Système de permissions granulaires
- [ ] Tableau de bord RH avec statistiques avancées
- [ ] Gestion des formations et certifications
- [ ] Évaluation des performances
- [ ] Planning des équipes
- [ ] Historique complet des modifications

## 📝 Notes techniques

- Framework: React 18
- Styling: Tailwind CSS + CSS custom
- Icons: React Icons (Font Awesome)
- Notifications: React Toastify
- Routing: React Router DOM v6
- HTTP Client: Axios
- Backend: Node.js + Express + MongoDB

## 👥 Contributeurs

Module développé pour l'ERP-TP (Travaux Publics)

---

**Version**: 1.0.0  
**Dernière mise à jour**: Octobre 2025

