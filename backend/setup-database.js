// Script de configuration et initialisation de la base de données
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');

const setupDatabase = async () => {
  try {
    console.log('\n🔧 Configuration de la base de données...\n');
    
    // Tentative de connexion
    console.log('📡 Tentative de connexion à MongoDB...');
    console.log(`   URI: ${process.env.MONGO_URI}`);
    
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });
    
    console.log('✅ MongoDB connecté avec succès!\n');
    
    // Vérifier si des utilisateurs existent
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    
    if (userCount === 0) {
      console.log('⚠️  Aucun utilisateur trouvé dans la base de données.');
      console.log('💡 Exécutez: node seedAll.js pour créer les utilisateurs de test\n');
    } else {
      console.log(`✅ ${userCount} utilisateur(s) trouvé(s) dans la base de données.\n`);
    }
    
    mongoose.connection.close();
    console.log('✅ Configuration terminée avec succès!\n');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Erreur de connexion MongoDB:', error.message);
    console.log('\n📋 SOLUTIONS:\n');
    console.log('1️⃣  Démarrer MongoDB localement:');
    console.log('   - Ouvrir un terminal administrateur');
    console.log('   - Exécuter: mongod');
    console.log('   - Ou démarrer le service: net start MongoDB\n');
    
    console.log('2️⃣  Utiliser MongoDB Atlas (Cloud - Gratuit):');
    console.log('   - Allez sur https://www.mongodb.com/cloud/atlas');
    console.log('   - Créez un compte gratuit');
    console.log('   - Créez un cluster gratuit');
    console.log('   - Copiez la connection string');
    console.log('   - Modifiez backend/.env avec: MONGO_URI="votre_connection_string"\n');
    
    console.log('3️⃣  Installer MongoDB:');
    console.log('   - Téléchargez depuis https://www.mongodb.com/try/download/community');
    console.log('   - Installez et démarrez le service\n');
    
    process.exit(1);
  }
};

setupDatabase();

