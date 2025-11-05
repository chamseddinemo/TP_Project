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

    // Créer les utilisateurs avec différents rôles
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
    }

    // Créer un client test
    const client = new Client({
      name: 'Client Test',
      email: 'client@test.com',
      phone: '123456789'
    });
    await client.save();

    // Créer un fournisseur test
    const supplier = await Supplier.create({
      name: 'Fournisseur Test',
      email: 'supplier@test.com',
      phone: '987654321'
    });

    // Créer quelques produits
    const products = [
      { 
        name: 'Produit A', 
        reference: 'PROD-A',
        pricePurchase: 8,
        priceSale: 10,
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
