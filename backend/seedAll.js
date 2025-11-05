// Script MASTER - Génère toutes les données de test
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Employee = require('./models/Employee');
const Contract = require('./models/Contract');
const Product = require('./models/Product');
const Client = require('./models/Client');
const Supplier = require('./models/Supplier');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');

connectDB();

const seedAll = async () => {
  try {
    console.log('\n🚀 SEED COMPLET - Initialisation de la base de données\n');
    console.log('=' .repeat(60));

    // 1. UTILISATEURS
    console.log('\n👥 1. UTILISATEURS...');
    await User.deleteMany();
    const users = [
      { name: 'Admin TP', email: 'admin@tp.com', password: 'admin123', role: 'admin' },
      { name: 'Gestionnaire Stock', email: 'stock@tp.com', password: '123456', role: 'stock' },
      { name: 'Responsable Ventes', email: 'vente@tp.com', password: '123456', role: 'vente' },
      { name: 'Responsable Achats', email: 'achat@tp.com', password: '123456', role: 'achat' },
      { name: 'Manager RH', email: 'rh@tp.com', password: '123456', role: 'rh' },
      { name: 'Comptable', email: 'comptable@tp.com', password: '123456', role: 'comptable' },
      { name: 'Technicien', email: 'technicien@tp.com', password: '123456', role: 'technicien' }
    ];

    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      console.log(`   ✅ ${user.name} (${user.role})`);
    }

    // 2. CLIENTS
    console.log('\n👤 2. CLIENTS...');
    await Client.deleteMany();
    const client = await Client.create({
      name: 'Construction ABC Inc.',
      email: 'contact@abc-construction.ca',
      phone: '514-555-0001'
    });
    console.log(`   ✅ ${client.name}`);

    // 3. FOURNISSEURS
    console.log('\n🏢 3. FOURNISSEURS...');
    await Supplier.deleteMany();
    const supplier = await Supplier.create({
      name: 'Matériaux Construction Pro',
      email: 'ventes@materiaux-pro.ca',
      phone: '450-555-0002'
    });
    console.log(`   ✅ ${supplier.name}`);

    // 4. PRODUITS
    console.log('\n📦 4. PRODUITS...');
    await Product.deleteMany();
    const products = [
      { name: 'Ciment Portland', reference: 'CIM-001', pricePurchase: 12.50, priceSale: 18.00, quantity: 200, supplier: supplier._id },
      { name: 'Brique rouge', reference: 'BRQ-001', pricePurchase: 0.80, priceSale: 1.20, quantity: 5000, supplier: supplier._id },
      { name: 'Sable construction', reference: 'SAB-001', pricePurchase: 25.00, priceSale: 35.00, quantity: 100, supplier: supplier._id },
      { name: 'Gravier concassé', reference: 'GRA-001', pricePurchase: 30.00, priceSale: 45.00, quantity: 150, supplier: supplier._id }
    ];

    for (const p of products) {
      await Product.create(p);
      console.log(`   ✅ ${p.name} (${p.quantity} unités)`);
    }

    // 5. EMPLOYÉS
    console.log('\n👷 5. EMPLOYÉS QUÉBÉCOIS...');
    await Employee.deleteMany();
    const employees = [
      {
        nom: 'Tremblay', prenom: 'Marc', email: 'marc.tremblay@construction-qc.ca',
        telephone: '514-555-1234', poste: 'Chef de chantier', service: 'Production',
        salaire: 65000, dateEmbauche: new Date('2020-03-15'),
        adresse: '123 Rue Principale, Montréal, QC H2X 1Y4',
        numeroSecuriteSociale: '123-456-789', situationFamiliale: 'Marié(e)', nombreEnfants: 2
      },
      {
        nom: 'Gagnon', prenom: 'Sophie', email: 'sophie.gagnon@construction-qc.ca',
        telephone: '438-555-5678', poste: 'Ingénieur', service: 'Technique',
        salaire: 75000, dateEmbauche: new Date('2019-06-01'),
        adresse: '456 Avenue du Parc, Québec, QC G1R 2L3',
        numeroSecuriteSociale: '234-567-890', situationFamiliale: 'Célibataire', nombreEnfants: 0
      },
      {
        nom: 'Bouchard', prenom: 'François', email: 'francois.bouchard@construction-qc.ca',
        telephone: '450-555-9012', poste: 'Ouvrier qualifié', service: 'Production',
        salaire: 55000, dateEmbauche: new Date('2021-09-10'),
        adresse: '789 Boul. René-Lévesque, Laval, QC H7T 2R8',
        numeroSecuriteSociale: '345-678-901', situationFamiliale: 'Marié(e)', nombreEnfants: 1
      },
      {
        nom: 'Côté', prenom: 'Marie', email: 'marie.cote@construction-qc.ca',
        telephone: '581-555-3456', poste: 'RH', service: 'RH',
        salaire: 60000, dateEmbauche: new Date('2018-04-20'),
        adresse: '321 Rue Saint-Jean, Québec, QC G1R 1P8',
        numeroSecuriteSociale: '456-789-012', situationFamiliale: 'Divorcé(e)', nombreEnfants: 1
      },
      {
        nom: 'Roy', prenom: 'Jean', email: 'jean.roy@construction-qc.ca',
        telephone: '418-555-7890', poste: 'Conducteur de travaux', service: 'Production',
        salaire: 70000, dateEmbauche: new Date('2017-11-12'),
        adresse: '654 Chemin Sainte-Foy, Québec, QC G1S 2J5',
        numeroSecuriteSociale: '567-890-123', situationFamiliale: 'Marié(e)', nombreEnfants: 3
      },
      {
        nom: 'Bergeron', prenom: 'Julie', email: 'julie.bergeron@construction-qc.ca',
        telephone: '514-555-2468', poste: 'Comptable', service: 'Finance',
        salaire: 58000, dateEmbauche: new Date('2022-01-05'),
        adresse: '987 Rue Sherbrooke, Montréal, QC H3A 1G1',
        numeroSecuriteSociale: '678-901-234', situationFamiliale: 'Célibataire', nombreEnfants: 0
      }
    ];

    const createdEmployees = [];
    for (const empData of employees) {
      const emp = await Employee.create(empData);
      createdEmployees.push(emp);
      console.log(`   ✅ ${emp.prenom} ${emp.nom} - ${emp.poste} (${emp.salaire}$ CAD)`);
    }

    // 6. CONTRATS
    console.log('\n📋 6. CONTRATS...');
    await Contract.deleteMany();
    const contractTypes = ['CDI', 'CDD', 'CDI', 'CDI', 'CDD', 'CDI'];

    for (let i = 0; i < createdEmployees.length; i++) {
      const emp = createdEmployees[i];
      const typeContrat = contractTypes[i];
      
      await Contract.create({
        employeId: emp._id,
        typeContrat: typeContrat,
        dateDebut: emp.dateEmbauche,
        dateFin: typeContrat === 'CDD' ? new Date(new Date(emp.dateEmbauche).setFullYear(new Date(emp.dateEmbauche).getFullYear() + 1)) : null,
        salaire: emp.salaire,
        poste: emp.poste,
        statut: 'Actif',
        description: `Contrat ${typeContrat} pour le poste de ${emp.poste}`
      });
      console.log(`   ✅ ${emp.prenom} ${emp.nom} - ${typeContrat}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n🎉 SEED COMPLET TERMINÉ AVEC SUCCÈS!\n');
    console.log('📊 RÉSUMÉ:');
    console.log(`   • ${users.length} utilisateurs`);
    console.log(`   • ${createdEmployees.length} employés`);
    console.log(`   • ${createdEmployees.length} contrats`);
    console.log(`   • ${products.length} produits`);
    console.log(`   • 1 client`);
    console.log(`   • 1 fournisseur`);
    
    console.log('\n🔐 COMPTES UTILISATEURS:');
    console.log('   Admin:      admin@tp.com / admin123');
    console.log('   Stock:      stock@tp.com / 123456');
    console.log('   Ventes:     vente@tp.com / 123456');
    console.log('   Achats:     achat@tp.com / 123456');
    console.log('   RH:         rh@tp.com / 123456');
    console.log('   Comptable:  comptable@tp.com / 123456');
    console.log('   Technicien: technicien@tp.com / 123456');
    
    console.log('\n🌐 ACCÈS APPLICATION:');
    console.log('   Frontend: http://localhost:5173');
    console.log('   Backend:  http://localhost:5000');
    
    console.log('\n📍 PAGES À TESTER:');
    console.log('   • /rh/employes      - Voir les employés');
    console.log('   • /rh/paie          - Générer les fiches de paie');
    console.log('   • /dashboard/admin  - Dashboard administrateur');
    console.log('   • /stock/produits   - Gestion des produits\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERREUR:', error);
    process.exit(1);
  }
};

seedAll();

