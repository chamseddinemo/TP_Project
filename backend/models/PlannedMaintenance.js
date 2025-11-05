const mongoose = require('mongoose');

const plannedMaintenanceSchema = new mongoose.Schema({
  equipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment',
    required: true
  },
  type: {
    type: String,
    enum: ['entretien', 'réparation', 'inspection', 'vérification'],
    required: true
  },
  datePrevue: {
    type: Date,
    required: true
  },
  responsible: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  status: {
    type: String,
    enum: ['planifiée', 'en cours', 'terminée', 'annulée'],
    default: 'planifiée'
  },
  periodicity: {
    type: String,
    enum: ['ponctuelle', 'hebdomadaire', 'mensuelle', 'trimestrielle', 'annuelle'],
    default: 'ponctuelle'
  },
  description: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  dateRealisation: {
    type: Date
  },
  cost: {
    type: Number,
    min: 0,
    default: 0
  },
  technician: {
    type: String
  },
  notificationSent: {
    type: Boolean,
    default: false
  },
  notificationDate: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Index pour optimiser les recherches
plannedMaintenanceSchema.index({ equipment: 1 });
plannedMaintenanceSchema.index({ datePrevue: 1 });
plannedMaintenanceSchema.index({ status: 1 });
plannedMaintenanceSchema.index({ responsible: 1 });
plannedMaintenanceSchema.index({ type: 1 });

module.exports = mongoose.model('PlannedMaintenance', plannedMaintenanceSchema);
