const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  city: { type: String },
  postalCode: { type: String },
  country: { type: String, default: 'Canada' },
  province: { type: String, default: 'Québec' },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  statut: { type: String, enum: ['actif', 'inactif', 'suspendu'], default: 'actif' },
  ordersCount: { type: Number, default: 0 },
  notes: { type: String },
  productsSupplied: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, { timestamps: true });

module.exports = mongoose.model('Supplier', supplierSchema);
