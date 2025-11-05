const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI n\'est pas défini dans le fichier .env');
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connecté ✅');
  } catch (error) {
    console.error('Erreur de connexion MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
