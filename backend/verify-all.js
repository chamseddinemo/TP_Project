// Script de vérification complète du système ERP-TP
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.cyan}${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}${colors.reset}\n`)
};

let errors = [];
let warnings = [];

// Vérifier le fichier .env
function checkEnv() {
  log.section('1. VÉRIFICATION DU FICHIER .ENV');
  
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    errors.push('Fichier .env manquant');
    log.error('Fichier .env manquant');
    log.info('Exécutez: node create-env.js pour le créer');
    return false;
  }
  log.success('Fichier .env trouvé');

  // Vérifier les variables requises
  const requiredVars = ['MONGO_URI', 'JWT_SECRET', 'PORT'];
  const missing = requiredVars.filter(v => !process.env[v]);
  
  if (missing.length > 0) {
    errors.push(`Variables manquantes dans .env: ${missing.join(', ')}`);
    log.error(`Variables manquantes: ${missing.join(', ')}`);
    return false;
  }
  
  log.success('Toutes les variables d\'environnement sont définies');
  log.info(`MONGO_URI: ${process.env.MONGO_URI ? 'Défini' : 'Manquant'}`);
  log.info(`JWT_SECRET: ${process.env.JWT_SECRET ? 'Défini' : 'Manquant'}`);
  log.info(`PORT: ${process.env.PORT || 5000}`);
  
  return true;
}

// Vérifier la connexion MongoDB
async function checkMongoDB() {
  log.section('2. VÉRIFICATION DE MONGODB');
  
  try {
    log.info('Tentative de connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });
    log.success('MongoDB connecté avec succès');
    
    // Vérifier les collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    log.info(`Collections trouvées: ${collections.length}`);
    collections.forEach(col => {
      log.info(`  - ${col.name}`);
    });
    
    return true;
  } catch (error) {
    errors.push(`Erreur MongoDB: ${error.message}`);
    log.error(`Erreur de connexion: ${error.message}`);
    log.warning('Vérifiez que MongoDB est démarré');
    return false;
  }
}

// Vérifier tous les modèles
function checkModels() {
  log.section('3. VÉRIFICATION DES MODÈLES');
  
  const modelsDir = path.join(__dirname, 'models');
  const modelFiles = fs.readdirSync(modelsDir).filter(f => f.endsWith('.js'));
  
  log.info(`Modèles trouvés: ${modelFiles.length}`);
  
  const models = [];
  modelFiles.forEach(file => {
    try {
      const modelPath = path.join(modelsDir, file);
      const model = require(modelPath);
      const modelName = path.basename(file, '.js');
      models.push(modelName);
      log.success(`${modelName} - OK`);
    } catch (error) {
      errors.push(`Erreur chargement modèle ${file}: ${error.message}`);
      log.error(`${file} - ERREUR: ${error.message}`);
    }
  });
  
  const expectedModels = [
    'User', 'Employee', 'Product', 'Sale', 'Purchase', 
    'Client', 'Supplier', 'Contract', 'Equipment', 
    'Transaction', 'Budget', 'Notification', 'Payslip',
    'Timesheet', 'JobOffer', 'Application', 'Leave', 'PlannedMaintenance'
  ];
  
  const missing = expectedModels.filter(m => !models.includes(m));
  if (missing.length > 0) {
    warnings.push(`Modèles manquants: ${missing.join(', ')}`);
    log.warning(`Modèles manquants: ${missing.join(', ')}`);
  }
  
  return models.length > 0;
}

// Vérifier tous les contrôleurs
function checkControllers() {
  log.section('4. VÉRIFICATION DES CONTRÔLEURS');
  
  const controllersDir = path.join(__dirname, 'controllers');
  const controllerFiles = fs.readdirSync(controllersDir).filter(f => f.endsWith('.js'));
  
  log.info(`Contrôleurs trouvés: ${controllerFiles.length}`);
  
  const controllers = [];
  controllerFiles.forEach(file => {
    try {
      const controllerPath = path.join(controllersDir, file);
      const controller = require(controllerPath);
      const controllerName = path.basename(file, '.js');
      controllers.push(controllerName);
      
      // Vérifier que le contrôleur exporte des fonctions
      const exports = Object.keys(controller);
      if (exports.length === 0) {
        warnings.push(`Contrôleur ${controllerName} n'exporte aucune fonction`);
        log.warning(`${controllerName} - Aucune fonction exportée`);
      } else {
        log.success(`${controllerName} - ${exports.length} fonction(s) exportée(s)`);
      }
    } catch (error) {
      errors.push(`Erreur chargement contrôleur ${file}: ${error.message}`);
      log.error(`${file} - ERREUR: ${error.message}`);
    }
  });
  
  return controllers.length > 0;
}

// Vérifier toutes les routes
function checkRoutes() {
  log.section('5. VÉRIFICATION DES ROUTES');
  
  const routesDir = path.join(__dirname, 'routes');
  const routeFiles = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));
  
  log.info(`Routes trouvées: ${routeFiles.length}`);
  
  const routes = [];
  routeFiles.forEach(file => {
    try {
      const routePath = path.join(routesDir, file);
      const route = require(routePath);
      const routeName = path.basename(file, '.js');
      routes.push(routeName);
      log.success(`${routeName} - OK`);
    } catch (error) {
      errors.push(`Erreur chargement route ${file}: ${error.message}`);
      log.error(`${file} - ERREUR: ${error.message}`);
    }
  });
  
  return routes.length > 0;
}

// Vérifier les données dans la base
async function checkData() {
  log.section('6. VÉRIFICATION DES DONNÉES');
  
  try {
    const User = require('./models/User');
    const Employee = require('./models/Employee');
    const Product = require('./models/Product');
    const Client = require('./models/Client');
    const Supplier = require('./models/Supplier');
    
    const userCount = await User.countDocuments();
    const employeeCount = await Employee.countDocuments();
    const productCount = await Product.countDocuments();
    const clientCount = await Client.countDocuments();
    const supplierCount = await Supplier.countDocuments();
    
    log.info(`Utilisateurs: ${userCount}`);
    log.info(`Employés: ${employeeCount}`);
    log.info(`Produits: ${productCount}`);
    log.info(`Clients: ${clientCount}`);
    log.info(`Fournisseurs: ${supplierCount}`);
    
    if (userCount === 0) {
      warnings.push('Aucun utilisateur dans la base de données');
      log.warning('Aucun utilisateur trouvé - Exécutez: node seedAll.js');
    } else {
      log.success(`${userCount} utilisateur(s) trouvé(s)`);
    }
    
    if (employeeCount === 0) {
      warnings.push('Aucun employé dans la base de données');
      log.warning('Aucun employé trouvé - Exécutez: node seedAll.js');
    } else {
      log.success(`${employeeCount} employé(s) trouvé(s)`);
    }
    
    return true;
  } catch (error) {
    errors.push(`Erreur vérification données: ${error.message}`);
    log.error(`Erreur: ${error.message}`);
    return false;
  }
}

// Vérifier les dépendances
function checkDependencies() {
  log.section('7. VÉRIFICATION DES DÉPENDANCES');
  
  const packagePath = path.join(__dirname, 'package.json');
  if (!fs.existsSync(packagePath)) {
    errors.push('package.json manquant');
    log.error('package.json manquant');
    return false;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const dependencies = Object.keys(packageJson.dependencies || {});
  
  log.info(`Dépendances requises: ${dependencies.length}`);
  
  const criticalDeps = ['express', 'mongoose', 'bcryptjs', 'jsonwebtoken', 'cors', 'dotenv'];
  const missing = criticalDeps.filter(dep => !dependencies.includes(dep));
  
  if (missing.length > 0) {
    errors.push(`Dépendances critiques manquantes: ${missing.join(', ')}`);
    log.error(`Dépendances manquantes: ${missing.join(', ')}`);
    return false;
  }
  
  log.success('Toutes les dépendances critiques sont présentes');
  return true;
}

// Fonction principale
async function verifyAll() {
  console.log('\n');
  log.section('🔍 VÉRIFICATION COMPLÈTE DU SYSTÈME ERP-TP');
  
  const results = {
    env: checkEnv(),
    dependencies: checkDependencies(),
    models: checkModels(),
    controllers: checkControllers(),
    routes: checkRoutes(),
    mongodb: false,
    data: false
  };
  
  if (results.env) {
    results.mongodb = await checkMongoDB();
    if (results.mongodb) {
      results.data = await checkData();
    }
  }
  
  // Résumé final
  log.section('📊 RÉSUMÉ DE LA VÉRIFICATION');
  
  const allChecks = Object.entries(results);
  allChecks.forEach(([name, result]) => {
    if (result) {
      log.success(`${name}: OK`);
    } else {
      log.error(`${name}: ÉCHEC`);
    }
  });
  
  console.log('\n');
  
  if (errors.length > 0) {
    log.section('❌ ERREURS TROUVÉES');
    errors.forEach(err => log.error(err));
  }
  
  if (warnings.length > 0) {
    log.section('⚠️  AVERTISSEMENTS');
    warnings.forEach(warn => log.warning(warn));
  }
  
  if (errors.length === 0 && warnings.length === 0) {
    log.section('✅ TOUT EST OK !');
    log.success('Le système est prêt à être utilisé');
    log.info('Démarrez avec: npm run dev');
  } else if (errors.length === 0) {
    log.section('✅ SYSTÈME FONCTIONNEL');
    log.success('Le système fonctionne mais il y a des avertissements');
  } else {
    log.section('❌ CORRIGEZ LES ERREURS');
    log.error('Le système ne peut pas fonctionner correctement');
  }
  
  // Fermer la connexion MongoDB
  if (results.mongodb) {
    await mongoose.connection.close();
    log.info('Connexion MongoDB fermée');
  }
  
  process.exit(errors.length > 0 ? 1 : 0);
}

// Exécuter la vérification
verifyAll().catch(error => {
  log.error(`Erreur fatale: ${error.message}`);
  console.error(error);
  process.exit(1);
});



