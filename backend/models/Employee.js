const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, enum: ['technicien','magasinier','rh','comptable','gestionnaire'], required: true },
  salary: { type: Number, required: true },
  presence: { type: Boolean, default: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);
