const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const { getProducts, addProduct, updateProduct, deleteProduct } = require('../controllers/stockController');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');

// Toutes les routes protégées par auth
router.use(authMiddleware);

// ============= STATISTIQUES STOCK =============

// GET statistiques stock pour le dashboard
router.get('/stats', roleMiddleware(['admin','stock']), async (req, res) => {
  try {
    // Nombre total de produits
    const totalProducts = await Product.countDocuments();
    
    // Produits en stock (quantité >= minQuantity)
    const inStockProducts = await Product.countDocuments({
      $expr: { $gte: ['$quantity', '$minQuantity'] }
    });
    
    // Produits en stock faible (0 < quantité < minQuantity)
    const lowStockProducts = await Product.countDocuments({
      $expr: { 
        $and: [
          { $gt: ['$quantity', 0] },
          { $lt: ['$quantity', '$minQuantity'] }
        ]
      }
    });
    
    // Produits en rupture (quantité = 0)
    const outOfStockProducts = await Product.countDocuments({ quantity: 0 });
    
    // Valeur totale du stock (quantité × prix d'achat)
    const totalStockValueResult = await Product.aggregate([
      {
        $project: {
          value: { $multiply: ['$quantity', '$pricePurchase'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$value' }
        }
      }
    ]);
    const totalStockValue = totalStockValueResult.length > 0 ? totalStockValueResult[0].total : 0;
    
    // Valeur des produits en stock faible
    const lowStockValueResult = await Product.aggregate([
      {
        $match: {
          $expr: { 
            $and: [
              { $gt: ['$quantity', 0] },
              { $lt: ['$quantity', '$minQuantity'] }
            ]
          }
        }
      },
      {
        $project: {
          value: { $multiply: ['$quantity', '$pricePurchase'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$value' }
        }
      }
    ]);
    const lowStockValue = lowStockValueResult.length > 0 ? lowStockValueResult[0].total : 0;
    
    // Produits à réapprovisionner (stock faible ou rupture)
    const productsToReorder = await Product.find({
      $or: [
        { quantity: 0 },
        { $expr: { $lt: ['$quantity', '$minQuantity'] } }
      ]
    })
    .populate('supplier', 'name email')
    .sort({ quantity: 1 })
    .limit(10)
    .select('reference name category quantity minQuantity pricePurchase supplier');
    
    // Répartition par catégorie
    const productsByCategory = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: { $multiply: ['$quantity', '$pricePurchase'] } }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Produits les plus récents
    const recentProducts = await Product.find()
      .populate('supplier', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('reference name category quantity minQuantity pricePurchase priceSale supplier createdAt');
    
    // Statistiques par fournisseur
    const statsBySupplier = await Product.aggregate([
      {
        $match: { supplier: { $ne: null } }
      },
      {
        $group: {
          _id: '$supplier',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: { $multiply: ['$quantity', '$pricePurchase'] } }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    // Populate les noms des fournisseurs
    const statsBySupplierWithNames = await Promise.all(
      statsBySupplier.map(async (item) => {
        const supplier = await Supplier.findById(item._id).select('name email');
        return {
          ...item,
          supplier: supplier || { name: 'Fournisseur supprimé', email: '' }
        };
      })
    );
    
    // Catégories avec stock faible
    const lowStockCategories = await Product.aggregate([
      {
        $match: {
          $or: [
            { quantity: 0 },
            { $expr: { $lt: ['$quantity', '$minQuantity'] } }
          ]
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Tendances de stock (variations de quantité sur les 30 derniers jours)
    // Note: Pour une implémentation complète, il faudrait un historique des mouvements de stock
    // Pour l'instant, on retourne les produits qui ont changé récemment
    const recentlyUpdatedProducts = await Product.find()
      .populate('supplier', 'name')
      .sort({ updatedAt: -1 })
      .limit(10)
      .select('reference name category quantity minQuantity updatedAt');
    
    res.json({
      totalProducts,
      inStockProducts,
      lowStockProducts,
      outOfStockProducts,
      totalStockValue,
      lowStockValue,
      productsToReorder,
      productsByCategory,
      recentProducts,
      statsBySupplier: statsBySupplierWithNames,
      lowStockCategories,
      recentlyUpdatedProducts
    });
  } catch (error) {
    console.error("Erreur récupération stats stock:", error);
    res.status(500).json({ message: error.message });
  }
});

// Routes CRUD pour les produits
router.get('/products', getProducts); // tous les produits
router.post('/products', roleMiddleware(['admin','stock']), addProduct); // ajout produit
router.put('/products/:id', roleMiddleware(['admin','stock']), updateProduct); // modification produit
router.delete('/products/:id', roleMiddleware(['admin','stock']), deleteProduct); // suppression produit

module.exports = router;
