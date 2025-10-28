const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  reference: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  pricePurchase: { type: Number, required: true },
  priceSale: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
