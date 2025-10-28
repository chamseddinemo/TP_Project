const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String },
  status: { type: String, enum: ['en service','en maintenance','hors service'], default: 'en service' },
  location: { type: String },
  lastMaintenance: { type: Date },
  nextMaintenance: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Equipment', equipmentSchema);
