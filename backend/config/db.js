const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('❌ MONGO_URI n\'est pas défini dans le fichier .env');
      throw new Error('MONGO_URI n\'est pas défini dans le fichier .env');
    }
    
    console.log('📡 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000
    });
    console.log('✅ MongoDB connecté ✅');
  } catch (error) {
    console.error('\n❌ Erreur de connexion MongoDB:', error.message);
    console.error('\n💡 Solutions possibles:');
    console.error('   1. Démarrer MongoDB: net start MongoDB (Windows)');
    console.error('   2. Vérifier que MongoDB est installé et en cours d\'exécution');
    console.error('   3. Utiliser MongoDB Atlas (cloud) - voir DEMARRAGE_RAPIDE.md');
    console.error('   4. Vérifier MONGO_URI dans backend/.env\n');
    
    // Ne pas arrêter le processus en développement pour permettre les tentatives de reconnexion
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
