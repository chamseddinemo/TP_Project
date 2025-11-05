// Script pour générer des contrats de test pour les employés
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Employee = require('./models/Employee');
const Contract = require('./models/Contract');
const connectDB = require('./config/db');

connectDB();

const seedContracts = async () => {
  try {
    console.log('🔄 Suppression des anciens contrats...');
    await Contract.deleteMany({});

    console.log('📋 Récupération des employés...');
    const employees = await Employee.find({});
    
    if (employees.length === 0) {
      console.log('❌ Aucun employé trouvé. Exécutez d\'abord: node seedEmployees.js');
      process.exit(1);
    }

    console.log(`📝 Création des contrats pour ${employees.length} employés...`);

    const contractTypes = ['CDI', 'CDD', 'CDI', 'CDI', 'CDD', 'CDI']; // Mix de types

    for (let i = 0; i < employees.length; i++) {
      const emp = employees[i];
      const typeContrat = contractTypes[i] || 'CDI';
      
      const contractData = {
        employeId: emp._id,
        typeContrat: typeContrat,
        dateDebut: emp.dateEmbauche,
        dateFin: typeContrat === 'CDD' ? new Date(new Date(emp.dateEmbauche).setFullYear(new Date(emp.dateEmbauche).getFullYear() + 1)) : null,
        salaire: emp.salaire,
        poste: emp.poste,
        statut: 'Actif',
        description: `Contrat ${typeContrat} pour le poste de ${emp.poste} au sein du service ${emp.service}`
      };

      const contract = await Contract.create(contractData);
      console.log(`✅ Contrat créé: ${emp.prenom} ${emp.nom} - ${typeContrat} - ${emp.poste}`);
    }

    console.log('\n🎉 Seed des contrats terminé !');
    console.log(`📊 ${employees.length} contrats créés`);
    console.log('\n📝 Vous pouvez maintenant voir les contrats sur /rh/paie (onglet Contrats)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
    process.exit(1);
  }
};

seedContracts();

