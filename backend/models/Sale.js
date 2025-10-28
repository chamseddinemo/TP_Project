const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  products: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['proposition', 'devis', 'facture', 'payé'], default: 'proposition' },
}, { timestamps: true });

module.exports = mongoose.model('Sale', saleSchema);
