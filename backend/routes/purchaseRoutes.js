const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const { createPurchase, getPurchases, updatePurchase } = require('../controllers/purchaseController');
const { getSuppliers, addSupplier, updateSupplier, deleteSupplier } = require('../controllers/supplierController');
const Purchase = require('../models/Purchase');
const Supplier = require('../models/Supplier');

router.use(authMiddleware);

// ============= STATISTIQUES ACHATS =============

// GET statistiques achats pour le dashboard
router.get('/stats', roleMiddleware(['achat','admin','comptable']), async (req, res) => {
  try {
    // Nombre total de commandes
    const totalPurchases = await Purchase.countDocuments();
    
    // Commandes en attente
    const pendingPurchases = await Purchase.countDocuments({
      status: { $in: ['pending', 'en attente', 'en cours'] }
    });
    
    // Commandes reçues
    const receivedPurchases = await Purchase.countDocuments({
      status: { $in: ['received', 'livrée'] }
    });
    
    // Nombre total de fournisseurs
    const totalSuppliers = await Supplier.countDocuments({ statut: 'actif' });
    
    // Dépenses totales (commandes reçues)
    const totalExpensesResult = await Purchase.aggregate([
      { $match: { status: { $in: ['received', 'livrée'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalExpenses = totalExpensesResult.length > 0 ? totalExpensesResult[0].total : 0;
    
    // Dépenses du mois en cours
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const monthlyExpensesResult = await Purchase.aggregate([
      {
        $match: {
          status: { $in: ['received', 'livrée'] },
          date: {
            $gte: new Date(currentYear, currentMonth - 1, 1),
            $lt: new Date(currentYear, currentMonth, 1)
          }
        }
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const monthlyExpenses = monthlyExpensesResult.length > 0 ? monthlyExpensesResult[0].total : 0;
    
    // Dernières commandes
    const recentPurchases = await Purchase.find()
      .populate('supplierId', 'name email')
      .populate('products.productId', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('reference supplierId totalAmount status date createdAt');
    
    // Meilleurs fournisseurs (par montant total)
    const topSuppliers = await Purchase.aggregate([
      { $match: { status: { $in: ['received', 'livrée'] } } },
      { $group: { _id: '$supplierId', total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: 5 }
    ]);
    
    // Populate les noms des fournisseurs
    const topSuppliersWithNames = await Promise.all(
      topSuppliers.map(async (item) => {
        const supplier = await Supplier.findById(item._id).select('name email');
        return {
          ...item,
          supplier: supplier || { name: 'Fournisseur supprimé', email: '' }
        };
      })
    );
    
    // Achats par statut
    const purchasesByStatus = await Purchase.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Achats par mois (6 derniers mois)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const purchasesByMonth = await Purchase.aggregate([
      {
        $match: {
          date: { $gte: sixMonthsAgo },
          status: { $in: ['received', 'livrée'] }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    // Produits les plus achetés
    const Product = require('../models/Product');
    const topProducts = await Purchase.aggregate([
      { $match: { status: { $in: ['received', 'livrée'] } } },
      { $unwind: '$products' },
      {
        $group: {
          _id: '$products.productId',
          totalQuantity: { $sum: '$products.quantity' },
          totalCost: { $sum: { $multiply: ['$products.quantity', '$products.price'] } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 }
    ]);
    
    // Populate les noms des produits
    const topProductsWithNames = await Promise.all(
      topProducts.map(async (item) => {
        const product = await Product.findById(item._id).select('name');
        return {
          ...item,
          product: product || { name: 'Produit supprimé' }
        };
      })
    );
    
    res.json({
      totalPurchases,
      pendingPurchases,
      receivedPurchases,
      totalSuppliers,
      totalExpenses,
      monthlyExpenses,
      recentPurchases,
      topSuppliers: topSuppliersWithNames,
      purchasesByStatus,
      purchasesByMonth,
      topProducts: topProductsWithNames
    });
  } catch (error) {
    console.error("Erreur récupération stats achats:", error);
    res.status(500).json({ message: error.message });
  }
});

// Routes pour les commandes fournisseurs (alias /purchases pour compatibilité frontend)
router.post('/purchases', roleMiddleware(['achat','admin']), createPurchase);
router.get('/purchases', roleMiddleware(['achat','admin','comptable']), getPurchases);
router.put('/purchases/:id', roleMiddleware(['achat','admin']), updatePurchase);
router.delete('/purchases/:id', roleMiddleware(['achat','admin']), async (req, res) => {
  try {
    const Purchase = require('../models/Purchase');
    const purchase = await Purchase.findByIdAndDelete(req.params.id);
    if (!purchase) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }
    res.json({ message: 'Commande supprimée' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur suppression commande', error: error.message });
  }
});

// Routes pour les commandes fournisseurs (anciennes routes)
router.post('/', roleMiddleware(['achat','admin']), createPurchase);
router.get('/', roleMiddleware(['achat','admin','comptable']), getPurchases);
router.put('/:id', roleMiddleware(['achat','admin']), updatePurchase);

// Routes CRUD pour les fournisseurs
router.get('/suppliers', getSuppliers);
router.post('/suppliers', roleMiddleware(['achat','admin','stock']), addSupplier);
router.put('/suppliers/:id', roleMiddleware(['achat','admin','stock']), updateSupplier);
router.delete('/suppliers/:id', roleMiddleware(['achat','admin','stock']), deleteSupplier);

module.exports = router;
