const mongoose = require("mongoose");
const Employee = require("../models/Employee");
const JobOffer = require("../models/JobOffer");
const Application = require("../models/Application");
const Contract = require("../models/Contract");

const sampleEmployees = [
  {
    nom: "Ben Ahmed",
    prenom: "Mohamed",
    email: "mohamed.benahmed@erp-tp.com",
    telephone: "+216 20 123 456",
    poste: "Ingénieur",
    service: "Technique",
    salaire: 3500,
    dateEmbauche: new Date("2020-01-15"),
    cin: "12345678",
    numeroSecuriteSociale: "SS-2020-001",
    situationFamiliale: "Marié(e)",
    nombreEnfants: 2,
    statut: "Actif"
  },
  {
    nom: "Trabelsi",
    prenom: "Fatma",
    email: "fatma.trabelsi@erp-tp.com",
    telephone: "+216 22 456 789",
    poste: "Chef de chantier",
    service: "Production",
    salaire: 4200,
    dateEmbauche: new Date("2018-03-10"),
    cin: "87654321",
    numeroSecuriteSociale: "SS-2018-005",
    situationFamiliale: "Célibataire",
    nombreEnfants: 0,
    statut: "Actif"
  },
  {
    nom: "Hammami",
    prenom: "Karim",
    email: "karim.hammami@erp-tp.com",
    telephone: "+216 25 789 123",
    poste: "Comptable",
    service: "Finance",
    salaire: 2800,
    dateEmbauche: new Date("2021-06-01"),
    cin: "11223344",
    numeroSecuriteSociale: "SS-2021-012",
    situationFamiliale: "Marié(e)",
    nombreEnfants: 1,
    statut: "Actif"
  },
  {
    nom: "Gharbi",
    prenom: "Sonia",
    email: "sonia.gharbi@erp-tp.com",
    telephone: "+216 28 345 678",
    poste: "RH",
    service: "RH",
    salaire: 3000,
    dateEmbauche: new Date("2019-09-15"),
    cin: "55667788",
    numeroSecuriteSociale: "SS-2019-008",
    situationFamiliale: "Divorcé(e)",
    nombreEnfants: 1,
    statut: "Actif"
  },
  {
    nom: "Mansour",
    prenom: "Youssef",
    email: "youssef.mansour@erp-tp.com",
    telephone: "+216 21 654 321",
    poste: "Conducteur de travaux",
    service: "Production",
    salaire: 3800,
    dateEmbauche: new Date("2017-11-20"),
    cin: "99887766",
    numeroSecuriteSociale: "SS-2017-003",
    situationFamiliale: "Marié(e)",
    nombreEnfants: 3,
    statut: "Actif"
  },
  {
    nom: "Jebali",
    prenom: "Rim",
    email: "rim.jebali@erp-tp.com",
    telephone: "+216 29 987 654",
    poste: "Commercial",
    service: "Commercial",
    salaire: 2600,
    dateEmbauche: new Date("2022-02-01"),
    cin: "44556677",
    numeroSecuriteSociale: "SS-2022-015",
    situationFamiliale: "Célibataire",
    nombreEnfants: 0,
    statut: "Actif"
  },
  {
    nom: "Saidi",
    prenom: "Ahmed",
    email: "ahmed.saidi@erp-tp.com",
    telephone: "+216 23 111 222",
    poste: "Ouvrier qualifié",
    service: "Production",
    salaire: 1800,
    dateEmbauche: new Date("2020-07-10"),
    cin: "33221100",
    numeroSecuriteSociale: "SS-2020-009",
    situationFamiliale: "Marié(e)",
    nombreEnfants: 2,
    statut: "Actif"
  },
  {
    nom: "Bouazizi",
    prenom: "Leila",
    email: "leila.bouazizi@erp-tp.com",
    telephone: "+216 24 333 444",
    poste: "Secrétaire",
    service: "Direction",
    salaire: 1500,
    dateEmbauche: new Date("2021-01-15"),
    cin: "66778899",
    numeroSecuriteSociale: "SS-2021-010",
    situationFamiliale: "Célibataire",
    nombreEnfants: 0,
    statut: "Actif"
  }
];

const sampleJobOffers = [
  {
    titre: "Ingénieur Civil Junior",
    departement: "Technique",
    typeContrat: "CDI",
    salaire: 2500,
    dateLimite: new Date("2025-12-31"),
    description: "Nous recherchons un ingénieur civil junior pour rejoindre notre équipe technique. Vous serez en charge du suivi de chantier et de la coordination avec les équipes.",
    competences: "Diplôme d'ingénieur civil, AutoCAD, MS Project",
    statut: "Actif"
  },
  {
    titre: "Chef de Chantier Expérimenté",
    departement: "Production",
    typeContrat: "CDI",
    salaire: 4000,
    dateLimite: new Date("2025-11-30"),
    description: "Recherche chef de chantier avec minimum 5 ans d'expérience dans les travaux publics. Gestion d'équipe et coordination de travaux.",
    competences: "5 ans d'expérience TP, management d'équipe, lecture de plans",
    statut: "Actif"
  },
  {
    titre: "Stage Comptabilité",
    departement: "Finance",
    typeContrat: "Stage",
    salaire: 800,
    dateLimite: new Date("2025-12-15"),
    description: "Stage de 6 mois en comptabilité. Vous assisterez l'équipe comptable dans les tâches quotidiennes.",
    competences: "Étudiant en comptabilité, maîtrise Excel",
    statut: "Actif"
  }
];

const seedHR = async () => {
  try {
    console.log("🌱 Début du seeding RH...");

    // Supprimer les données existantes
    await Employee.deleteMany({});
    await JobOffer.deleteMany({});
    await Application.deleteMany({});
    await Contract.deleteMany({});

    // Créer les employés
    const employees = await Employee.insertMany(sampleEmployees);
    console.log(`✅ ${employees.length} employés créés`);

    // Créer les offres d'emploi
    const jobOffers = await JobOffer.insertMany(sampleJobOffers);
    console.log(`✅ ${jobOffers.length} offres d'emploi créées`);

    // Créer des candidatures d'exemple
    const sampleApplications = [
      {
        offreId: jobOffers[0]._id,
        nom: "Dali",
        prenom: "Salma",
        email: "salma.dali@example.com",
        telephone: "+216 20 555 666",
        cv: "https://example.com/cv-salma.pdf",
        lettreMotivation: "Très motivée...",
        statut: "Nouveau",
        note: 0
      },
      {
        offreId: jobOffers[1]._id,
        nom: "Mejri",
        prenom: "Hichem",
        email: "hichem.mejri@example.com",
        telephone: "+216 22 777 888",
        cv: "https://example.com/cv-hichem.pdf",
        lettreMotivation: "Expérience de 7 ans...",
        statut: "En cours",
        note: 4
      }
    ];

    const applications = await Application.insertMany(sampleApplications);
    console.log(`✅ ${applications.length} candidatures créées`);

    // Créer des contrats pour les employés
    const sampleContracts = employees.slice(0, 5).map(emp => ({
      employeId: emp._id,
      typeContrat: "CDI",
      dateDebut: emp.dateEmbauche,
      salaire: emp.salaire,
      poste: emp.poste,
      statut: "Actif"
    }));

    const contracts = await Contract.insertMany(sampleContracts);
    console.log(`✅ ${contracts.length} contrats créés`);

    console.log("✅ Seeding RH terminé avec succès !");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur lors du seeding:", error);
    process.exit(1);
  }
};

// Exécuter si appelé directement
if (require.main === module) {
  require("dotenv").config();
  const connectDB = require("../config/db");
  
  connectDB().then(() => {
    seedHR();
  });
}

module.exports = seedHR;

