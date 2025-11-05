// Script pour générer des employés de test pour le Québec - Secteur Construction
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Employee = require('./models/Employee');
const connectDB = require('./config/db');

connectDB();

const seedEmployees = async () => {
  try {
    console.log('🔄 Suppression des anciens employés de test...');
    await Employee.deleteMany({});

    console.log('👷 Création des employés de test pour le Québec...');

    const employees = [
      {
        nom: 'Tremblay',
        prenom: 'Marc',
        email: 'marc.tremblay@construction-qc.ca',
        telephone: '514-555-1234',
        poste: 'Chef de chantier',
        service: 'Production',
        salaire: 65000, // Salaire annuel
        dateEmbauche: new Date('2020-03-15'),
        photo: '',
        adresse: '123 Rue Principale, Montréal, QC H2X 1Y4',
        cin: '',
        numeroSecuriteSociale: '123-456-789',
        situationFamiliale: 'Marié(e)',
        nombreEnfants: 2
      },
      {
        nom: 'Gagnon',
        prenom: 'Sophie',
        email: 'sophie.gagnon@construction-qc.ca',
        telephone: '438-555-5678',
        poste: 'Ingénieur',
        service: 'Technique',
        salaire: 75000,
        dateEmbauche: new Date('2019-06-01'),
        photo: '',
        adresse: '456 Avenue du Parc, Québec, QC G1R 2L3',
        cin: '',
        numeroSecuriteSociale: '234-567-890',
        situationFamiliale: 'Célibataire',
        nombreEnfants: 0
      },
      {
        nom: 'Bouchard',
        prenom: 'François',
        email: 'francois.bouchard@construction-qc.ca',
        telephone: '450-555-9012',
        poste: 'Ouvrier qualifié',
        service: 'Production',
        salaire: 55000,
        dateEmbauche: new Date('2021-09-10'),
        photo: '',
        adresse: '789 Boul. René-Lévesque, Laval, QC H7T 2R8',
        cin: '',
        numeroSecuriteSociale: '345-678-901',
        situationFamiliale: 'Marié(e)',
        nombreEnfants: 1
      },
      {
        nom: 'Côté',
        prenom: 'Marie',
        email: 'marie.cote@construction-qc.ca',
        telephone: '581-555-3456',
        poste: 'RH',
        service: 'RH',
        salaire: 60000,
        dateEmbauche: new Date('2018-04-20'),
        photo: '',
        adresse: '321 Rue Saint-Jean, Québec, QC G1R 1P8',
        cin: '',
        numeroSecuriteSociale: '456-789-012',
        situationFamiliale: 'Divorcé(e)',
        nombreEnfants: 1
      },
      {
        nom: 'Roy',
        prenom: 'Jean',
        email: 'jean.roy@construction-qc.ca',
        telephone: '418-555-7890',
        poste: 'Conducteur de travaux',
        service: 'Production',
        salaire: 70000,
        dateEmbauche: new Date('2017-11-12'),
        photo: '',
        adresse: '654 Chemin Sainte-Foy, Québec, QC G1S 2J5',
        cin: '',
        numeroSecuriteSociale: '567-890-123',
        situationFamiliale: 'Marié(e)',
        nombreEnfants: 3
      },
      {
        nom: 'Bergeron',
        prenom: 'Julie',
        email: 'julie.bergeron@construction-qc.ca',
        telephone: '514-555-2468',
        poste: 'Comptable',
        service: 'Finance',
        salaire: 58000,
        dateEmbauche: new Date('2022-01-05'),
        photo: '',
        adresse: '987 Rue Sherbrooke, Montréal, QC H3A 1G1',
        cin: '',
        numeroSecuriteSociale: '678-901-234',
        situationFamiliale: 'Célibataire',
        nombreEnfants: 0
      }
    ];

    for (const empData of employees) {
      const employee = await Employee.create(empData);
      console.log(`✅ Employé créé: ${employee.prenom} ${employee.nom} - ${employee.poste} (${employee.salaire}$ CAD)`);
    }

    console.log('\n🎉 Seed terminé avec succès !');
    console.log(`📊 ${employees.length} employés créés pour le test`);
    console.log('\n📝 Vous pouvez maintenant:');
    console.log('   1. Aller sur /rh/employes pour voir tous les employés');
    console.log('   2. Aller sur /rh/paie pour générer leurs fiches de paie');
    console.log('   3. Cliquer sur "Générer tout" pour créer toutes les fiches automatiquement');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
    process.exit(1);
  }
};

seedEmployees();

