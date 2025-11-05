const Transaction = require('../models/Transaction');

// Créer une transaction
const createTransaction = async (req, res) => {
  try {
    const { type, description, amount, date, category, status, reference, notes } = req.body;

    if (!type || !description || !amount || !date || !category) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: 'Le montant doit être supérieur à 0' });
    }

    const transaction = await Transaction.create({
      type,
      description,
      amount,
      date,
      category,
      status: status || 'validée',
      reference,
      notes,
      createdBy: req.user.id
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Erreur création transaction', error: error.message });
  }
};

// Récupérer toutes les transactions avec filtres
const getTransactions = async (req, res) => {
  try {
    const { type, category, status, dateFrom, dateTo } = req.query;

    const filter = {};

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (status) filter.status = status;

    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        filter.date.$lte = endDate;
      }
    }

    const transactions = await Transaction.find(filter)
      .populate('createdBy', 'name email')
      .sort({ date: -1, createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Erreur récupération transactions', error: error.message });
  }
};

// Récupérer une transaction par ID
const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction non trouvée' });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Erreur récupération transaction', error: error.message });
  }
};

// Mettre à jour une transaction
const updateTransaction = async (req, res) => {
  try {
    const { type, description, amount, date, category, status, reference, notes } = req.body;

    if (amount !== undefined && amount <= 0) {
      return res.status(400).json({ message: 'Le montant doit être supérieur à 0' });
    }

    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      {
        ...(type && { type }),
        ...(description && { description }),
        ...(amount !== undefined && { amount }),
        ...(date && { date }),
        ...(category && { category }),
        ...(status !== undefined && { status }),
        ...(reference !== undefined && { reference }),
        ...(notes !== undefined && { notes })
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction non trouvée' });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Erreur mise à jour transaction', error: error.message });
  }
};

// Supprimer une transaction
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction non trouvée' });
    }

    res.json({ message: 'Transaction supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur suppression transaction', error: error.message });
  }
};

// Récupérer les statistiques
const getStats = async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;

    const filter = {};
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        filter.date.$lte = endDate;
      }
    }

    const transactions = await Transaction.find(filter);

    const totalIncome = transactions
      .filter(t => t.type === 'entrée')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter(t => t.type === 'sortie')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpense;

    // Statistiques par catégorie
    const categoryStats = transactions.reduce((acc, t) => {
      const key = t.category;
      if (!acc[key]) {
        acc[key] = { income: 0, expense: 0 };
      }
      if (t.type === 'entrée') {
        acc[key].income += t.amount;
      } else {
        acc[key].expense += t.amount;
      }
      return acc;
    }, {});

    res.json({
      totalIncome,
      totalExpense,
      balance,
      count: transactions.length,
      categoryStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur récupération statistiques', error: error.message });
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getStats
};
