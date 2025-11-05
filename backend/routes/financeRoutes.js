const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getStats
} = require('../controllers/transactionController');
const {
  createBudget,
  getBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
  getBudgetStats
} = require('../controllers/budgetController');
const Transaction = require('../models/Transaction');
const Sale = require('../models/Sale');

router.use(authMiddleware);

// ============= STATISTIQUES DASHBOARD FINANCE =============

// GET statistiques complètes pour le dashboard finance
router.get('/dashboard-stats', roleMiddleware(['comptable', 'admin']), async (req, res) => {
  try {
    // Statistiques des transactions
    const transactions = await Transaction.find({ status: 'validée' });
    
    const totalIncome = transactions
      .filter(t => t.type === 'entrée')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = transactions
      .filter(t => t.type === 'sortie')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpense;
    
    // Revenus du mois en cours
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const monthlyIncomeResult = await Transaction.aggregate([
      {
        $match: {
          type: 'entrée',
          status: 'validée',
          date: {
            $gte: new Date(currentYear, currentMonth - 1, 1),
            $lt: new Date(currentYear, currentMonth, 1)
          }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const monthlyIncome = monthlyIncomeResult.length > 0 ? monthlyIncomeResult[0].total : 0;
    
    // Dépenses du mois en cours
    const monthlyExpenseResult = await Transaction.aggregate([
      {
        $match: {
          type: 'sortie',
          status: 'validée',
          date: {
            $gte: new Date(currentYear, currentMonth - 1, 1),
            $lt: new Date(currentYear, currentMonth, 1)
          }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const monthlyExpense = monthlyExpenseResult.length > 0 ? monthlyExpenseResult[0].total : 0;
    
    // Nombre de factures payées (ventes avec statut 'payé')
    const paidInvoices = await Sale.countDocuments({ status: 'payé' });
    
    // Montant total des factures payées
    const paidInvoicesAmountResult = await Sale.aggregate([
      { $match: { status: 'payé' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const paidInvoicesAmount = paidInvoicesAmountResult.length > 0 ? paidInvoicesAmountResult[0].total : 0;
    
    // Factures en attente (facture mais pas payé)
    const pendingInvoices = await Sale.countDocuments({ status: 'facture' });
    
    // Montant des factures en attente
    const pendingInvoicesAmountResult = await Sale.aggregate([
      { $match: { status: 'facture' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const pendingInvoicesAmount = pendingInvoicesAmountResult.length > 0 ? pendingInvoicesAmountResult[0].total : 0;
    
    // Dernières transactions
    const recentTransactions = await Transaction.find({ status: 'validée' })
      .populate('createdBy', 'name email')
      .sort({ date: -1, createdAt: -1 })
      .limit(5)
      .select('type description amount date category status');
    
    // Dernières factures payées
    const recentPaidInvoices = await Sale.find({ status: 'payé' })
      .populate('clientId', 'name email')
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('numeroCommande clientId totalAmount dateCommande updatedAt');
    
    // Transactions par catégorie
    const transactionsByCategory = await Transaction.aggregate([
      { $match: { status: 'validée' } },
      {
        $group: {
          _id: '$category',
          income: {
            $sum: { $cond: [{ $eq: ['$type', 'entrée'] }, '$amount', 0] }
          },
          expense: {
            $sum: { $cond: [{ $eq: ['$type', 'sortie'] }, '$amount', 0] }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Transactions par mois (6 derniers mois)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const transactionsByMonth = await Transaction.aggregate([
      {
        $match: {
          status: 'validée',
          date: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          income: {
            $sum: { $cond: [{ $eq: ['$type', 'entrée'] }, '$amount', 0] }
          },
          expense: {
            $sum: { $cond: [{ $eq: ['$type', 'sortie'] }, '$amount', 0] }
          },
          balance: {
            $sum: {
              $cond: [
                { $eq: ['$type', 'entrée'] },
                '$amount',
                { $multiply: ['$amount', -1] }
              ]
            }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    // Top 5 catégories de dépenses
    const topExpenseCategories = await Transaction.aggregate([
      {
        $match: {
          type: 'sortie',
          status: 'validée'
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 5 }
    ]);
    
    // Top 5 catégories de revenus
    const topIncomeCategories = await Transaction.aggregate([
      {
        $match: {
          type: 'entrée',
          status: 'validée'
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 5 }
    ]);
    
    res.json({
      totalIncome,
      totalExpense,
      balance,
      monthlyIncome,
      monthlyExpense,
      monthlyBalance: monthlyIncome - monthlyExpense,
      paidInvoices,
      paidInvoicesAmount,
      pendingInvoices,
      pendingInvoicesAmount,
      recentTransactions,
      recentPaidInvoices,
      transactionsByCategory,
      transactionsByMonth,
      topExpenseCategories,
      topIncomeCategories,
      totalTransactions: transactions.length
    });
  } catch (error) {
    console.error("Erreur récupération stats dashboard finance:", error);
    res.status(500).json({ message: error.message });
  }
});

// Statistiques
router.get('/stats', roleMiddleware(['comptable', 'admin']), getStats);

// Récupérer toutes les transactions
router.get('/transactions', roleMiddleware(['comptable', 'admin', 'rh']), getTransactions);

// Récupérer une transaction par ID
router.get('/transactions/:id', roleMiddleware(['comptable', 'admin']), getTransactionById);

// Créer une transaction
router.post('/transactions', roleMiddleware(['comptable', 'admin']), createTransaction);

// Mettre à jour une transaction
router.put('/transactions/:id', roleMiddleware(['comptable', 'admin']), updateTransaction);

// Supprimer une transaction
router.delete('/transactions/:id', roleMiddleware(['comptable', 'admin']), deleteTransaction);

// Routes Budgets
// Statistiques des budgets
router.get('/budgets/stats', roleMiddleware(['comptable', 'admin']), getBudgetStats);

// Récupérer tous les budgets
router.get('/budgets', roleMiddleware(['comptable', 'admin', 'rh']), getBudgets);

// Récupérer un budget par ID
router.get('/budgets/:id', roleMiddleware(['comptable', 'admin']), getBudgetById);

// Créer un budget
router.post('/budgets', roleMiddleware(['comptable', 'admin']), createBudget);

// Mettre à jour un budget
router.put('/budgets/:id', roleMiddleware(['comptable', 'admin']), updateBudget);

// Supprimer un budget
router.delete('/budgets/:id', roleMiddleware(['comptable', 'admin']), deleteBudget);

module.exports = router;
