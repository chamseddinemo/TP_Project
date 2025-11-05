const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const { createSale, getSales, getSaleById, updateSale, deleteSale } = require('../controllers/saleController');
const { getClients, addClient, updateClient, deleteClient } = require('../controllers/clientController');
const Sale = require('../models/Sale');
const Client = require('../models/Client');

router.use(authMiddleware);

// ============= STATISTIQUES VENTES =============

// GET statistiques ventes pour le dashboard
router.get('/stats', roleMiddleware(['vente','admin','comptable']), async (req, res) => {
  try {
    // Nombre total de ventes
    const totalSales = await Sale.countDocuments();
    
    // Ventes en attente (proposition, devis)
    const pendingSales = await Sale.countDocuments({
      status: { $in: ['proposition', 'devis'] }
    });
    
    // Ventes validées (facture, payé)
    const completedSales = await Sale.countDocuments({
      status: { $in: ['facture', 'payé'] }
    });
    
    // Nombre total de clients
    const totalClients = await Client.countDocuments();
    
    // Revenus totaux (ventes payées)
    const revenueResult = await Sale.aggregate([
      { $match: { status: 'payé' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
    
    // Revenus du mois en cours
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const monthlyRevenueResult = await Sale.aggregate([
      {
        $match: {
          status: 'payé',
          createdAt: {
            $gte: new Date(currentYear, currentMonth - 1, 1),
            $lt: new Date(currentYear, currentMonth, 1)
          }
        }
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const monthlyRevenue = monthlyRevenueResult.length > 0 ? monthlyRevenueResult[0].total : 0;
    
    // Dernières ventes
    const recentSales = await Sale.find()
      .populate('clientId', 'name email')
      .populate('products.productId', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('numeroCommande clientId totalAmount status dateCommande createdAt');
    
    // Meilleurs clients (par montant total)
    const topClients = await Sale.aggregate([
      { $match: { status: 'payé' } },
      { $group: { _id: '$clientId', total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: 5 }
    ]);
    
    // Populate les noms des clients
    const topClientsWithNames = await Promise.all(
      topClients.map(async (item) => {
        const client = await Client.findById(item._id).select('name email');
        return {
          ...item,
          client: client || { name: 'Client supprimé', email: '' }
        };
      })
    );
    
    // Ventes par statut
    const salesByStatus = await Sale.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Ventes par mois (6 derniers mois)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const salesByMonth = await Sale.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          status: 'payé'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    // Produits les plus vendus
    const topProducts = await Sale.aggregate([
      { $match: { status: { $in: ['facture', 'payé'] } } },
      { $unwind: '$products' },
      {
        $group: {
          _id: '$products.productId',
          totalQuantity: { $sum: '$products.quantity' },
          totalRevenue: { $sum: { $multiply: ['$products.quantity', '$products.price'] } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 }
    ]);
    
    // Populate les noms des produits
    const Product = require('../models/Product');
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
      totalSales,
      pendingSales,
      completedSales,
      totalClients,
      totalRevenue,
      monthlyRevenue,
      recentSales,
      topClients: topClientsWithNames,
      salesByStatus,
      salesByMonth,
      topProducts: topProductsWithNames
    });
  } catch (error) {
    console.error("Erreur récupération stats ventes:", error);
    res.status(500).json({ message: error.message });
  }
});

// Routes CRUD pour les clients
router.get('/clients', getClients);
router.post('/clients', roleMiddleware(['vente','admin']), addClient);
router.put('/clients/:id', roleMiddleware(['vente','admin']), updateClient);
router.delete('/clients/:id', roleMiddleware(['vente','admin']), deleteClient);

// Créer une vente / proposition
router.post('/', roleMiddleware(['vente','admin']), createSale);

// Récupérer toutes les ventes
router.get('/', roleMiddleware(['vente','admin','comptable']), getSales);

// Détails d'une vente
router.get('/:id', roleMiddleware(['vente','admin','comptable']), getSaleById);

// Mise à jour vente (ex: transformer proposition en facture)
router.put('/:id', roleMiddleware(['vente','admin']), updateSale);

// Supprimer une vente
router.delete('/:id', roleMiddleware(['vente','admin']), deleteSale);

module.exports = router;
