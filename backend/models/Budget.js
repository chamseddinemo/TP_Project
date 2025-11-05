const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: [
      'Vente',
      'Achat',
      'Salaire',
      'Fournisseur',
      'Frais généraux',
      'Impôt',
      'Intérêt',
      'Location',
      'Marketing',
      'Autre'
    ]
  },
  budgetedAmount: {
    type: Number,
    required: true,
    min: 0
  },
  periodType: {
    type: String,
    enum: ['annuel', 'mensuel', 'trimestriel'],
    default: 'annuel'
  },
  year: {
    type: Number,
    required: true
  },
  month: {
    type: Number,
    min: 1,
    max: 12,
    validate: {
      validator: function(value) {
        if (this.periodType === 'mensuel' || this.periodType === 'trimestriel') {
          return value !== undefined && value !== null;
        }
        return true;
      },
      message: 'Le mois est requis pour les budgets mensuels et trimestriels'
    }
  },
  quarter: {
    type: Number,
    min: 1,
    max: 4,
    validate: {
      validator: function(value) {
        if (this.periodType === 'trimestriel') {
          return value !== undefined && value !== null;
        }
        return true;
      },
      message: 'Le trimestre est requis pour les budgets trimestriels'
    }
  },
  dateFrom: {
    type: Date
  },
  dateTo: {
    type: Date
  },
  description: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Index pour optimiser les recherches
budgetSchema.index({ category: 1, year: 1, month: 1, quarter: 1 });
budgetSchema.index({ year: 1 });

module.exports = mongoose.model('Budget', budgetSchema);
