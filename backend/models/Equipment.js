const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  type: { type: String, enum: ['entretien', 'réparation', 'inspection'], required: true },
  description: { type: String },
  cost: { type: Number, min: 0 },
  technician: { type: String },
  nextMaintenanceDate: { type: Date }
}, { timestamps: true });

const equipmentSchema = new mongoose.Schema({
  code: { 
    type: String, 
    required: true, 
    trim: true,
    uppercase: true
  },
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['Engin lourd', 'Véhicule', 'Outillage', 'Matériel de sécurité', 'Autre'],
    default: 'Autre'
  },
  type: { 
    type: String,
    trim: true
  },
  status: { 
    type: String, 
    enum: ['en service', 'en maintenance', 'hors service'], 
    default: 'en service' 
  },
  location: { 
    type: String,
    trim: true
  },
  dateAcquisition: {
    type: Date,
    default: Date.now
  },
  responsible: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  photo: {
    type: String // URL ou chemin vers l'image
  },
  lastMaintenance: { 
    type: Date 
  },
  nextMaintenance: { 
    type: Date 
  },
  maintenanceHistory: [maintenanceSchema],
  notes: {
    type: String,
    trim: true
  }
}, { timestamps: true });

// Index pour optimiser les recherches (unique sur code pour éviter les doublons)
equipmentSchema.index({ code: 1 }, { unique: true });
equipmentSchema.index({ category: 1 });
equipmentSchema.index({ status: 1 });
equipmentSchema.index({ responsible: 1 });
equipmentSchema.index({ nextMaintenance: 1 });

module.exports = mongoose.model('Equipment', equipmentSchema);
