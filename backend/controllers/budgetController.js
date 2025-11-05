const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

// Créer un budget
const createBudget = async (req, res) => {
  try {
    const { category, budgetedAmount, periodType, year, month, quarter, dateFrom, dateTo, description } = req.body;

    if (!category || !budgetedAmount || !year) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' });
    }

    if (budgetedAmount <= 0) {
      return res.status(400).json({ message: 'Le montant budgété doit être supérieur à 0' });
    }

    // Calculer dateFrom et dateTo si nécessaire
    let startDate, endDate;
    if (periodType === 'annuel') {
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31, 23, 59, 59, 999);
    } else if (periodType === 'mensuel' && month) {
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0, 23, 59, 59, 999);
    } else if (periodType === 'trimestriel' && quarter) {
      const startMonth = (quarter - 1) * 3;
      startDate = new Date(year, startMonth, 1);
      endDate = new Date(year, startMonth + 3, 0, 23, 59, 59, 999);
    } else {
      startDate = dateFrom ? new Date(dateFrom) : new Date(year, 0, 1);
      endDate = dateTo ? new Date(dateTo) : new Date(year, 11, 31, 23, 59, 59, 999);
    }

    const budget = await Budget.create({
      category,
      budgetedAmount,
      periodType: periodType || 'annuel',
      year,
      month,
      quarter,
      dateFrom: startDate,
      dateTo: endDate,
      description,
      createdBy: req.user.id
    });

    res.status(201).json(budget);
  } catch (error) {
    res.status(500).json({ message: 'Erreur création budget', error: error.message });
  }
};

// Récupérer tous les budgets avec calcul des réalisés et écarts
const getBudgets = async (req, res) => {
  try {
    const { year, category, periodType } = req.query;

    const filter = {};
    if (year) filter.year = parseInt(year);
    if (category) filter.category = category;
    if (periodType) filter.periodType = periodType;

    const budgets = await Budget.find(filter)
      .populate('createdBy', 'name email')
      .sort({ year: -1, category: 1 });

    // Calculer les montants réels et écarts pour chaque budget
    const budgetsWithActuals = await Promise.all(
      budgets.map(async (budget) => {
        const actualAmount = await calculateActualAmount(budget);
        const variance = budget.budgetedAmount - actualAmount;
        const variancePercent = budget.budgetedAmount > 0 
          ? ((variance / budget.budgetedAmount) * 100).toFixed(2)
          : 0;

        return {
          ...budget.toObject(),
          actualAmount,
          variance,
          variancePercent: parseFloat(variancePercent)
        };
      })
    );

    res.json(budgetsWithActuals);
  } catch (error) {
    res.status(500).json({ message: 'Erreur récupération budgets', error: error.message });
  }
};

// Calculer le montant réel pour un budget
const calculateActualAmount = async (budget) => {
  try {
    const filter = {
      category: budget.category,
      status: 'validée'
    };

    // Filtrer par période
    if (budget.dateFrom && budget.dateTo) {
      filter.date = {
        $gte: budget.dateFrom,
        $lte: budget.dateTo
      };
    } else if (budget.periodType === 'annuel') {
      filter.date = {
        $gte: new Date(budget.year, 0, 1),
        $lte: new Date(budget.year, 11, 31, 23, 59, 59, 999)
      };
    } else if (budget.periodType === 'mensuel' && budget.month) {
      filter.date = {
        $gte: new Date(budget.year, budget.month - 1, 1),
        $lte: new Date(budget.year, budget.month, 0, 23, 59, 59, 999)
      };
    } else if (budget.periodType === 'trimestriel' && budget.quarter) {
      const startMonth = (budget.quarter - 1) * 3;
      filter.date = {
        $gte: new Date(budget.year, startMonth, 1),
        $lte: new Date(budget.year, startMonth + 3, 0, 23, 59, 59, 999)
      };
    }

    // Pour les budgets, on prend uniquement les sorties (dépenses)
    // Pour les catégories comme "Vente", on prend les entrées (revenus)
    const transactions = await Transaction.find(filter);
    
    let total = 0;
    transactions.forEach(t => {
      if (budget.category === 'Vente' && t.type === 'entrée') {
        total += t.amount;
      } else if (budget.category !== 'Vente' && t.type === 'sortie') {
        total += t.amount;
      }
    });

    return total;
  } catch (error) {
    console.error('Erreur calcul montant réel:', error);
    return 0;
  }
};

// Récupérer un budget par ID
const getBudgetById = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!budget) {
      return res.status(404).json({ message: 'Budget non trouvé' });
    }

    const actualAmount = await calculateActualAmount(budget);
    const variance = budget.budgetedAmount - actualAmount;
    const variancePercent = budget.budgetedAmount > 0 
      ? ((variance / budget.budgetedAmount) * 100).toFixed(2)
      : 0;

    res.json({
      ...budget.toObject(),
      actualAmount,
      variance,
      variancePercent: parseFloat(variancePercent)
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur récupération budget', error: error.message });
  }
};

// Mettre à jour un budget
const updateBudget = async (req, res) => {
  try {
    const { category, budgetedAmount, periodType, year, month, quarter, dateFrom, dateTo, description } = req.body;

    if (budgetedAmount !== undefined && budgetedAmount <= 0) {
      return res.status(400).json({ message: 'Le montant budgété doit être supérieur à 0' });
    }

    // Calculer dateFrom et dateTo si nécessaire
    let startDate, endDate;
    if (periodType === 'annuel' && year) {
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31, 23, 59, 59, 999);
    } else if (periodType === 'mensuel' && year && month) {
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0, 23, 59, 59, 999);
    } else if (periodType === 'trimestriel' && year && quarter) {
      const startMonth = (quarter - 1) * 3;
      startDate = new Date(year, startMonth, 1);
      endDate = new Date(year, startMonth + 3, 0, 23, 59, 59, 999);
    }

    const updateData = {
      ...(category && { category }),
      ...(budgetedAmount !== undefined && { budgetedAmount }),
      ...(periodType && { periodType }),
      ...(year && { year }),
      ...(month !== undefined && { month }),
      ...(quarter !== undefined && { quarter }),
      ...(startDate && { dateFrom: startDate }),
      ...(endDate && { dateTo: endDate }),
      ...(description !== undefined && { description })
    };

    const budget = await Budget.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!budget) {
      return res.status(404).json({ message: 'Budget non trouvé' });
    }

    const actualAmount = await calculateActualAmount(budget);
    const variance = budget.budgetedAmount - actualAmount;
    const variancePercent = budget.budgetedAmount > 0 
      ? ((variance / budget.budgetedAmount) * 100).toFixed(2)
      : 0;

    res.json({
      ...budget.toObject(),
      actualAmount,
      variance,
      variancePercent: parseFloat(variancePercent)
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur mise à jour budget', error: error.message });
  }
};

// Supprimer un budget
const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findByIdAndDelete(req.params.id);

    if (!budget) {
      return res.status(404).json({ message: 'Budget non trouvé' });
    }

    res.json({ message: 'Budget supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur suppression budget', error: error.message });
  }
};

// Statistiques des budgets
const getBudgetStats = async (req, res) => {
  try {
    const { year } = req.query;
    const filter = year ? { year: parseInt(year) } : {};

    const budgets = await Budget.find(filter);
    
    let totalBudgeted = 0;
    let totalActual = 0;
    const byCategory = {};

    for (const budget of budgets) {
      totalBudgeted += budget.budgetedAmount;
      const actual = await calculateActualAmount(budget);
      totalActual += actual;

      if (!byCategory[budget.category]) {
        byCategory[budget.category] = {
          budgeted: 0,
          actual: 0
        };
      }
      byCategory[budget.category].budgeted += budget.budgetedAmount;
      byCategory[budget.category].actual += actual;
    }

    const totalVariance = totalBudgeted - totalActual;
    const totalVariancePercent = totalBudgeted > 0 
      ? ((totalVariance / totalBudgeted) * 100).toFixed(2)
      : 0;

    res.json({
      totalBudgeted,
      totalActual,
      totalVariance,
      totalVariancePercent: parseFloat(totalVariancePercent),
      byCategory,
      count: budgets.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur récupération statistiques', error: error.message });
  }
};

module.exports = {
  createBudget,
  getBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
  getBudgetStats
};
