// Script de test complet de toutes les fonctionnalités ERP-TP
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const axios = require('axios');
const bcrypt = require('bcryptjs');

dotenv.config();

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  test: (msg) => console.log(`${colors.cyan}🧪 ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.magenta}${'='.repeat(70)}\n${msg}\n${'='.repeat(70)}${colors.reset}\n`)
};

// Statistiques
const stats = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

// Base URL
const BASE_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

// Token d'authentification (sera récupéré après login)
let authToken = '';
let adminToken = '';

// Fonction de test
async function runTest(name, testFn) {
  stats.total++;
  try {
    log.test(`Test: ${name}`);
    await testFn();
    stats.passed++;
    log.success(`${name} - PASSÉ`);
    return true;
  } catch (error) {
    stats.failed++;
    stats.errors.push({ test: name, error: error.message });
    log.error(`${name} - ÉCHEC: ${error.message}`);
    return false;
  }
}

// ==================== TESTS DE CONNEXION ====================

async function testDatabaseConnection() {
  await runTest('Connexion MongoDB', async () => {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });
    if (mongoose.connection.readyState !== 1) {
      throw new Error('MongoDB non connecté');
    }
  });
}

async function testBackendServer() {
  await runTest('Serveur Backend accessible', async () => {
    const response = await axios.get(BASE_URL, { timeout: 5000 });
    if (response.status !== 200) {
      throw new Error(`Statut ${response.status}`);
    }
  });
}

// ==================== TESTS D'AUTHENTIFICATION ====================

async function testAuthSignup() {
  await runTest('Inscription utilisateur', async () => {
    const testUser = {
      name: 'Test User',
      email: `test${Date.now()}@test.com`,
      password: 'test123456',
      role: 'vente'
    };
    const response = await axios.post(`${API_URL}/auth/signup`, testUser);
    if (!response.data.token) {
      throw new Error('Token non reçu');
    }
  });
}

async function testAuthLogin() {
  await runTest('Connexion utilisateur', async () => {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@tp.com',
      password: 'admin123'
    });
    if (!response.data.token) {
      throw new Error('Token non reçu');
    }
    adminToken = response.data.token;
    authToken = response.data.token;
  });
}

async function testAuthInvalidLogin() {
  await runTest('Connexion invalide (doit échouer)', async () => {
    try {
      await axios.post(`${API_URL}/auth/login`, {
        email: 'invalid@test.com',
        password: 'wrongpassword'
      });
      throw new Error('La connexion aurait dû échouer');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        return; // C'est attendu
      }
      throw error;
    }
  });
}

// ==================== TESTS DES MODÈLES ====================

async function testUserModel() {
  await runTest('Modèle User - Création', async () => {
    const User = require('./models/User');
    const user = new User({
      name: 'Test Model User',
      email: `model${Date.now()}@test.com`,
      password: 'test123',
      role: 'stock'
    });
    await user.save();
    if (!user._id) {
      throw new Error('User non créé');
    }
    await User.findByIdAndDelete(user._id);
  });
}

async function testEmployeeModel() {
  await runTest('Modèle Employee - Création', async () => {
    const Employee = require('./models/Employee');
    const employee = new Employee({
      nom: 'Test',
      prenom: 'Employee',
      email: `emp${Date.now()}@test.com`,
      telephone: '514-555-0000',
      poste: 'Testeur',
      service: 'Test',
      salaire: 50000,
      dateEmbauche: new Date(),
      statut: 'Actif'
    });
    await employee.save();
    if (!employee._id) {
      throw new Error('Employee non créé');
    }
    await Employee.findByIdAndDelete(employee._id);
  });
}

async function testProductModel() {
  await runTest('Modèle Product - Création', async () => {
    const Product = require('./models/Product');
    const Supplier = require('./models/Supplier');
    
    // Créer un fournisseur temporaire
    const supplier = new Supplier({
      name: 'Test Supplier',
      email: `sup${Date.now()}@test.com`,
      phone: '514-555-0000'
    });
    await supplier.save();
    
    const product = new Product({
      name: 'Test Product',
      reference: `TEST-${Date.now()}`,
      pricePurchase: 10,
      priceSale: 15,
      quantity: 100,
      supplier: supplier._id
    });
    await product.save();
    if (!product._id) {
      throw new Error('Product non créé');
    }
    
    await Product.findByIdAndDelete(product._id);
    await Supplier.findByIdAndDelete(supplier._id);
  });
}

// ==================== TESTS DES ROUTES API ====================

async function testAdminStats() {
  await runTest('Route Admin - Statistiques', async () => {
    const response = await axios.get(`${API_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (!response.data.totalUsers && response.data.totalUsers !== 0) {
      throw new Error('Statistiques invalides');
    }
  });
}

async function testStockStats() {
  await runTest('Route Stock - Statistiques', async () => {
    const response = await axios.get(`${API_URL}/stock/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (typeof response.data.totalProducts === 'undefined') {
      throw new Error('Statistiques stock invalides');
    }
  });
}

async function testStockProducts() {
  await runTest('Route Stock - Liste produits', async () => {
    const response = await axios.get(`${API_URL}/stock/products`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (!Array.isArray(response.data)) {
      throw new Error('Réponse invalide');
    }
  });
}

async function testStockAddProduct() {
  await runTest('Route Stock - Ajouter produit', async () => {
    const Supplier = require('./models/Supplier');
    const supplier = await Supplier.findOne();
    
    if (!supplier) {
      log.warning('Aucun fournisseur trouvé, création d\'un fournisseur de test');
      const newSupplier = new Supplier({
        name: 'Test Supplier',
        email: `sup${Date.now()}@test.com`,
        phone: '514-555-0000'
      });
      await newSupplier.save();
      supplier = newSupplier;
    }
    
    const product = {
      name: 'Test Product API',
      reference: `API-${Date.now()}`,
      pricePurchase: 10,
      priceSale: 15,
      quantity: 50,
      supplier: supplier._id.toString()
    };
    
    const response = await axios.post(`${API_URL}/stock/products`, product, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (!response.data._id) {
      throw new Error('Produit non créé');
    }
    
    // Nettoyer
    const Product = require('./models/Product');
    await Product.findByIdAndDelete(response.data._id);
  });
}

async function testHREmployees() {
  await runTest('Route RH - Liste employés', async () => {
    const response = await axios.get(`${API_URL}/rh/employees`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (!Array.isArray(response.data)) {
      throw new Error('Réponse invalide');
    }
  });
}

async function testHREmployeeCreate() {
  await runTest('Route RH - Créer employé', async () => {
    const employee = {
      nom: 'Test',
      prenom: 'API',
      email: `api${Date.now()}@test.com`,
      telephone: '514-555-0000',
      poste: 'Testeur',
      service: 'Test',
      salaire: 50000,
      dateEmbauche: new Date().toISOString(),
      statut: 'Actif'
    };
    
    const response = await axios.post(`${API_URL}/rh/employees`, employee, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (!response.data._id) {
      throw new Error('Employé non créé');
    }
    
    // Nettoyer
    const Employee = require('./models/Employee');
    await Employee.findByIdAndDelete(response.data._id);
  });
}

async function testEquipmentStats() {
  await runTest('Route Équipements - Statistiques', async () => {
    const response = await axios.get(`${API_URL}/equipements/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (typeof response.data.totalEquipments === 'undefined') {
      throw new Error('Statistiques équipements invalides');
    }
  });
}

async function testFinanceStats() {
  await runTest('Route Finance - Statistiques', async () => {
    const response = await axios.get(`${API_URL}/finance/dashboard-stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (typeof response.data.totalIncome === 'undefined') {
      throw new Error('Statistiques finance invalides');
    }
  });
}

async function testPurchaseStats() {
  await runTest('Route Achats - Statistiques', async () => {
    const response = await axios.get(`${API_URL}/achat/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (typeof response.data.totalPurchases === 'undefined') {
      throw new Error('Statistiques achats invalides');
    }
  });
}

async function testSaleStats() {
  await runTest('Route Ventes - Statistiques', async () => {
    const response = await axios.get(`${API_URL}/vente/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (typeof response.data.totalSales === 'undefined' && typeof response.data.totalVentes === 'undefined') {
      throw new Error('Statistiques ventes invalides');
    }
  });
}

async function testNotifications() {
  await runTest('Route Notifications - Liste', async () => {
    const response = await axios.get(`${API_URL}/notifications`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (!Array.isArray(response.data)) {
      throw new Error('Réponse invalide');
    }
  });
}

// ==================== TESTS DE SÉCURITÉ ====================

async function testAuthRequired() {
  await runTest('Sécurité - Route protégée sans token', async () => {
    try {
      await axios.get(`${API_URL}/admin/stats`);
      throw new Error('La route devrait être protégée');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        return; // C'est attendu
      }
      throw error;
    }
  });
}

async function testRoleBasedAccess() {
  await runTest('Sécurité - Accès basé sur les rôles', async () => {
    // Tester avec un token non-admin
    const stockResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'stock@tp.com',
      password: '123456'
    });
    const stockToken = stockResponse.data.token;
    
    try {
      // Un utilisateur stock ne devrait pas accéder à /admin/stats
      await axios.get(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${stockToken}` }
      });
      throw new Error('L\'accès admin devrait être refusé');
    } catch (error) {
      if (error.response && error.response.status === 403) {
        return; // C'est attendu
      }
      throw error;
    }
  });
}

// ==================== TESTS DE VALIDATION ====================

async function testPasswordHashing() {
  await runTest('Sécurité - Hashage des mots de passe', async () => {
    const User = require('./models/User');
    const testPassword = 'test123456';
    const user = new User({
      name: 'Test Hash',
      email: `hash${Date.now()}@test.com`,
      password: testPassword,
      role: 'stock'
    });
    await user.save();
    
    if (user.password === testPassword) {
      throw new Error('Le mot de passe n\'est pas hashé');
    }
    
    const isMatch = await user.matchPassword(testPassword);
    if (!isMatch) {
      throw new Error('La vérification du mot de passe échoue');
    }
    
    await User.findByIdAndDelete(user._id);
  });
}

// ==================== TESTS DE PERFORMANCE ====================

async function testDatabaseQueries() {
  await runTest('Performance - Requêtes base de données', async () => {
    const User = require('./models/User');
    const Employee = require('./models/Employee');
    const Product = require('./models/Product');
    
    const start = Date.now();
    
    await Promise.all([
      User.countDocuments(),
      Employee.countDocuments(),
      Product.countDocuments()
    ]);
    
    const duration = Date.now() - start;
    if (duration > 5000) {
      throw new Error(`Requêtes trop lentes: ${duration}ms`);
    }
  });
}

// ==================== FONCTION PRINCIPALE ====================

async function runAllTests() {
  console.log('\n');
  log.section('🧪 TESTS COMPLETS DE TOUTES LES FONCTIONNALITÉS ERP-TP');
  
  try {
    // Tests de connexion
    log.section('1. TESTS DE CONNEXION');
    await testDatabaseConnection();
    await testBackendServer();
    
    // Tests d'authentification
    log.section('2. TESTS D\'AUTHENTIFICATION');
    await testAuthSignup();
    await testAuthLogin();
    await testAuthInvalidLogin();
    await testPasswordHashing();
    
    // Tests des modèles
    log.section('3. TESTS DES MODÈLES');
    await testUserModel();
    await testEmployeeModel();
    await testProductModel();
    
    // Tests de sécurité
    log.section('4. TESTS DE SÉCURITÉ');
    await testAuthRequired();
    await testRoleBasedAccess();
    
    // Tests des routes API
    log.section('5. TESTS DES ROUTES API');
    await testAdminStats();
    await testStockStats();
    await testStockProducts();
    await testStockAddProduct();
    await testHREmployees();
    await testHREmployeeCreate();
    await testEquipmentStats();
    await testFinanceStats();
    await testPurchaseStats();
    await testSaleStats();
    await testNotifications();
    
    // Tests de performance
    log.section('6. TESTS DE PERFORMANCE');
    await testDatabaseQueries();
    
  } catch (error) {
    log.error(`Erreur fatale: ${error.message}`);
  } finally {
    // Fermer la connexion MongoDB
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
  
  // Résumé final
  log.section('📊 RÉSUMÉ DES TESTS');
  log.info(`Total de tests: ${stats.total}`);
  log.success(`Tests réussis: ${stats.passed}`);
  log.error(`Tests échoués: ${stats.failed}`);
  
  const successRate = ((stats.passed / stats.total) * 100).toFixed(2);
  log.info(`Taux de réussite: ${successRate}%`);
  
  if (stats.errors.length > 0) {
    log.section('❌ ERREURS DÉTECTÉES');
    stats.errors.forEach(({ test, error }) => {
      log.error(`${test}: ${error}`);
    });
  }
  
  if (stats.failed === 0) {
    log.section('✅ TOUS LES TESTS SONT RÉUSSIS!');
    log.success('Le système fonctionne à 100%!');
  } else {
    log.section('⚠️  CERTAINS TESTS ONT ÉCHOUÉ');
    log.warning('Vérifiez les erreurs ci-dessus');
  }
  
  process.exit(stats.failed > 0 ? 1 : 0);
}

// Vérifier que le backend est démarré
async function checkBackend() {
  try {
    await axios.get(BASE_URL, { timeout: 3000 });
    return true;
  } catch (error) {
    log.warning('Le backend n\'est pas accessible sur ' + BASE_URL);
    log.info('Démarrez le backend avec: npm run dev');
    return false;
  }
}

// Exécuter les tests
(async () => {
  const backendRunning = await checkBackend();
  if (!backendRunning) {
    log.error('Le backend doit être démarré pour exécuter les tests');
    log.info('Démarrez le backend dans un autre terminal: cd backend && npm run dev');
    process.exit(1);
  }
  
  await runAllTests();
})();



