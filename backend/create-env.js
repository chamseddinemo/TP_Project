// Script pour créer automatiquement le fichier .env s'il n'existe pas
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

// Contenu par défaut du fichier .env
const defaultEnvContent = `# Configuration Backend ERP-TP
# Ce fichier a été généré automatiquement
# Modifiez les valeurs selon votre configuration

PORT=5000

# MongoDB Configuration
# Option 1: MongoDB Local (décommentez la ligne suivante)
MONGO_URI=mongodb://localhost:27017/erp-tp

# Option 2: MongoDB Atlas (décommentez et modifiez avec votre connection string)
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/erp-tp?retryWrites=true&w=majority

# JWT Secret (changez cette valeur en production!)
JWT_SECRET=votre_secret_jwt_super_securise_2024_12345_changez_moi_en_production

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Environment
NODE_ENV=development
`;

// Vérifier si .env existe déjà
if (fs.existsSync(envPath)) {
  console.log('✅ Le fichier .env existe déjà');
  process.exit(0);
}

// Créer le fichier .env
try {
  fs.writeFileSync(envPath, defaultEnvContent, 'utf8');
  console.log('✅ Fichier .env créé avec succès!');
  console.log('📝 N\'oubliez pas de modifier MONGO_URI selon votre configuration MongoDB');
  console.log('   - MongoDB local: mongodb://localhost:27017/erp-tp');
  console.log('   - MongoDB Atlas: votre connection string');
} catch (error) {
  console.error('❌ Erreur lors de la création du fichier .env:', error.message);
  process.exit(1);
}


