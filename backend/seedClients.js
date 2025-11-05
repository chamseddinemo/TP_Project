require('dotenv').config();
const mongoose = require('mongoose');
const Client = require('./models/Client');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connecté');
  } catch (error) {
    console.error('❌ Erreur connexion MongoDB:', error);
    process.exit(1);
  }
};

const seedClients = async () => {
  try {
    await connectDB();

    // Supprimer les clients existants
    await Client.deleteMany({});
    console.log('🗑️  Anciens clients supprimés');

    // Créer des clients de test
    const clients = await Client.create([
      {
        name: 'Entreprise ABC',
        email: 'contact@entreprise-abc.ca',
        phone: '(514) 555-1000',
        address: '100 Rue Commerce, Montréal, QC H1A 1A1'
      },
      {
        name: 'Société XYZ',
        email: 'info@societe-xyz.com',
        phone: '(450) 555-2000',
        address: '200 Avenue Principale, Laval, QC H2B 2B2'
      },
      {
        name: 'Client Test',
        email: 'client@test.ca',
        phone: '(418) 555-3000',
        address: '300 Boulevard Industriel, Québec, QC G1C 3C3'
      },
      {
        name: 'Construction Montréal Inc.',
        email: 'contact@const-mtl.ca',
        phone: '(514) 555-4000',
        address: '400 Rue Saint-Laurent, Montréal, QC H2Y 1Y1'
      },
      {
        name: 'Développement Immobilier Québec',
        email: 'info@developpement-qc.ca',
        phone: '(418) 555-5000',
        address: '500 Chemin de la Rive, Québec, QC G1D 5D5'
      }
    ]);

    console.log(`✅ ${clients.length} clients créés`);

    console.log('\n🎉 Données clients initialisées avec succès!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    process.exit(1);
  }
};

seedClients();

