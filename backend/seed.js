// backend/seed.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Product = require('./models/Product');
const Client = require('./models/Client');
const Supplier = require('./models/Supplier');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');

connectDB();

const seedData = async () => {
  try {
    // Nettoyer les collections
    await User.deleteMany();
    await Product.deleteMany();
    await Client.deleteMany();
    await Supplier.deleteMany();

    // Créer un admin
    const admin = new User({
      name: 'Admin TP',
      email: 'admin@tp.com',
      password: await bcrypt.hash('admin123', 10),
      role: 'admin'
    });
    await admin.save();

    // Créer un client test
    const client = new Client({
      name: 'Client Test',
      email: 'client@test.com',
      phone: '123456789'
    });
    await client.save();

    // Créer un fournisseur test
    const supplier = new Supplier({
      name: 'Fournisseur Test',
      email: 'supplier@test.com',
      phone: '987654321'
    });
    await supplier.save();

    // Créer quelques produits
    // Créer quelques produits
const products = [
  { 
    name: 'Produit A', 
    reference: 'PROD-A',         // <-- obligatoire
    pricePurchase: 8,            // <-- obligatoire
    priceSale: 10,               // <-- obligatoire
    quantity: 100, 
    supplier: supplier._id 
  },
  { 
    name: 'Produit B', 
    reference: 'PROD-B', 
    pricePurchase: 15, 
    priceSale: 20, 
    quantity: 50, 
    supplier: supplier._id 
  },
  { 
    name: 'Produit C', 
    reference: 'PROD-C', 
    pricePurchase: 12, 
    priceSale: 15, 
    quantity: 75, 
    supplier: supplier._id 
  }
];


    for (const p of products) {
      await Product.create(p);
    }

    console.log('Seed terminé ✅');
    process.exit();
  } catch (error) {
    console.error('Erreur seed:', error);
    process.exit(1);
  }
};

seedData();
