const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  reference: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String },
  quantity: { type: Number, default: 0 },
  minQuantity: { type: Number, default: 10 },
  pricePurchase: { type: Number, default: 0 },
  priceSale: { type: Number, default: 0 },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  barcode: { type: String },
  unit: { type: String, default: 'unité' }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
