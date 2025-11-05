require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Supplier = require('./models/Supplier');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connecté');
  } catch (error) {
    console.error('❌ Erreur connexion MongoDB:', error);
    process.exit(1);
  }
};

const seedStockData = async () => {
  try {
    await connectDB();

    // Supprimer les données existantes
    await Supplier.deleteMany({});
    await Product.deleteMany({});
    console.log('🗑️  Anciennes données supprimées');

    // Créer des fournisseurs
    const suppliers = await Supplier.create([
      {
        name: 'Construction Matériaux Inc.',
        email: 'contact@const-materiaux.ca',
        phone: '(514) 555-0100',
        address: '123 Boulevard Industriel',
        city: 'Montréal',
        postalCode: 'H3B 4W8',
        country: 'Canada',
        rating: 5,
        statut: 'actif',
        ordersCount: 45,
        notes: 'Fournisseur principal pour matériaux de construction'
      },
      {
        name: 'Quincaillerie Québec',
        email: 'info@quincaillerie-qc.com',
        phone: '(450) 555-0200',
        address: '456 Rue Principale',
        city: 'Laval',
        postalCode: 'H7L 2X9',
        country: 'Canada',
        rating: 4,
        statut: 'actif',
        ordersCount: 32,
        notes: 'Excellent pour la quincaillerie et outils'
      },
      {
        name: 'Équipements Pro',
        email: 'ventes@equipements-pro.ca',
        phone: '(514) 555-0300',
        address: '789 Avenue Commerce',
        city: 'Montréal',
        postalCode: 'H1V 3T5',
        country: 'Canada',
        rating: 5,
        statut: 'actif',
        ordersCount: 28,
        notes: 'Spécialiste en équipements professionnels'
      },
      {
        name: 'Bois et Matériaux',
        email: 'commandes@bois-materiaux.qc.ca',
        phone: '(418) 555-0400',
        address: '321 Chemin Forestier',
        city: 'Québec',
        postalCode: 'G1K 4A3',
        country: 'Canada',
        rating: 4,
        statut: 'actif',
        ordersCount: 19,
        notes: 'Fournisseur de bois et dérivés'
      }
    ]);

    console.log(`✅ ${suppliers.length} fournisseurs créés`);

    // Créer des produits
    const products = await Product.create([
      {
        reference: 'CIM-PORT-001',
        name: 'Ciment Portland Type 10',
        description: 'Sac de ciment Portland 40kg, idéal pour béton et mortier',
        category: 'Matériaux',
        quantity: 150,
        minQuantity: 50,
        pricePurchase: 8.50,
        priceSale: 12.99,
        supplier: suppliers[0]._id,
        unit: 'sac'
      },
      {
        reference: 'FER-B12-002',
        name: 'Fer à béton Ø12mm',
        description: 'Barre de fer à béton 12mm, longueur 6m',
        category: 'Ferraillage',
        quantity: 25,
        minQuantity: 30,
        pricePurchase: 12.30,
        priceSale: 18.50,
        supplier: suppliers[0]._id,
        unit: 'barre'
      },
      {
        reference: 'GRAV-1525-003',
        name: 'Gravier 15/25',
        description: 'Gravier calibre 15/25mm pour béton',
        category: 'Granulats',
        quantity: 0,
        minQuantity: 100,
        pricePurchase: 45.00,
        priceSale: 65.00,
        supplier: suppliers[0]._id,
        unit: 'tonne'
      },
      {
        reference: 'PELLE-MEC-004',
        name: 'Pelle mécanique',
        description: 'Pelle de chantier professionnelle en acier forgé',
        category: 'Outils',
        quantity: 5,
        minQuantity: 3,
        pricePurchase: 25.00,
        priceSale: 39.99,
        supplier: suppliers[1]._id,
        unit: 'unité'
      },
      {
        reference: 'BRIQ-RGE-005',
        name: 'Brique rouge standard',
        description: 'Brique rouge pour maçonnerie 20x10x5cm',
        category: 'Matériaux',
        quantity: 500,
        minQuantity: 200,
        pricePurchase: 0.65,
        priceSale: 1.20,
        supplier: suppliers[0]._id,
        unit: 'unité'
      },
      {
        reference: 'PLAQ-GYP-006',
        name: 'Plaque de plâtre 4x8',
        description: 'Panneau de gypse standard 1/2 pouce',
        category: 'Matériaux',
        quantity: 75,
        minQuantity: 40,
        pricePurchase: 12.00,
        priceSale: 18.99,
        supplier: suppliers[3]._id,
        unit: 'unité'
      },
      {
        reference: 'VIS-GYP-007',
        name: 'Vis à gypse 1 1/4"',
        description: 'Boîte de 1000 vis à gypse phosphatées',
        category: 'Quincaillerie',
        quantity: 45,
        minQuantity: 20,
        pricePurchase: 8.50,
        priceSale: 13.99,
        supplier: suppliers[1]._id,
        unit: 'boîte'
      },
      {
        reference: 'ISOL-LAINE-008',
        name: 'Laine minérale R20',
        description: 'Isolant laine minérale R20, 16" x 48"',
        category: 'Isolation',
        quantity: 120,
        minQuantity: 50,
        pricePurchase: 18.00,
        priceSale: 28.99,
        supplier: suppliers[3]._id,
        unit: 'unité'
      },
      {
        reference: 'PEINT-LAT-009',
        name: 'Peinture latex blanc mat',
        description: 'Gallon de peinture latex intérieure blanche',
        category: 'Peinture',
        quantity: 8,
        minQuantity: 15,
        pricePurchase: 22.00,
        priceSale: 35.99,
        supplier: suppliers[1]._id,
        unit: 'gallon'
      },
      {
        reference: 'TUYAU-PVC-010',
        name: 'Tuyau PVC 4"',
        description: 'Tuyau PVC drain 4 pouces, longueur 10 pieds',
        category: 'Plomberie',
        quantity: 30,
        minQuantity: 20,
        pricePurchase: 12.50,
        priceSale: 19.99,
        supplier: suppliers[1]._id,
        unit: 'unité'
      },
      {
        reference: 'CABLE-ELEC-011',
        name: 'Câble électrique 14/2',
        description: 'Câble Romex 14/2 avec terre, rouleau 250 pieds',
        category: 'Électricité',
        quantity: 15,
        minQuantity: 10,
        pricePurchase: 85.00,
        priceSale: 129.99,
        supplier: suppliers[2]._id,
        unit: 'rouleau'
      },
      {
        reference: 'BOIS-2X4-012',
        name: '2x4x8 SPF',
        description: 'Bois de charpente 2x4x8 pieds SPF',
        category: 'Bois',
        quantity: 200,
        minQuantity: 100,
        pricePurchase: 4.50,
        priceSale: 7.99,
        supplier: suppliers[3]._id,
        unit: 'unité'
      },
      {
        reference: 'CONT-PL-013',
        name: 'Contreplaqué 3/4"',
        description: 'Feuille de contreplaqué 4x8 épaisseur 3/4 pouce',
        category: 'Bois',
        quantity: 40,
        minQuantity: 25,
        pricePurchase: 35.00,
        priceSale: 54.99,
        supplier: suppliers[3]._id,
        unit: 'feuille'
      },
      {
        reference: 'CLOU-CADRE-014',
        name: 'Clous de charpente 3"',
        description: 'Boîte de clous de charpente 3 pouces, 5 lbs',
        category: 'Quincaillerie',
        quantity: 25,
        minQuantity: 15,
        pricePurchase: 18.00,
        priceSale: 27.99,
        supplier: suppliers[1]._id,
        unit: 'boîte'
      },
      {
        reference: 'ECHEL-ALU-015',
        name: 'Échelle aluminium 16"',
        description: 'Échelle télescopique en aluminium 16 pieds',
        category: 'Équipement',
        quantity: 3,
        minQuantity: 2,
        pricePurchase: 180.00,
        priceSale: 279.99,
        supplier: suppliers[2]._id,
        unit: 'unité'
      }
    ]);

    console.log(`✅ ${products.length} produits créés`);

    console.log('\n🎉 Données de stock initialisées avec succès!');
    console.log('\n📊 Résumé:');
    console.log(`   - ${suppliers.length} fournisseurs`);
    console.log(`   - ${products.length} produits`);
    console.log(`   - ${products.filter(p => p.quantity === 0).length} produits en rupture`);
    console.log(`   - ${products.filter(p => p.quantity > 0 && p.quantity <= p.minQuantity).length} produits en stock bas`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    process.exit(1);
  }
};

seedStockData();

