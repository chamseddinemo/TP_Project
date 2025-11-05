const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  reference: { type: String },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' }, // Alias pour compatibilité
  date: { type: Date, default: Date.now },
  products: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  items: [{ type: mongoose.Schema.Types.Mixed }], // Alias pour compatibilité
  totalAmount: { type: Number, required: true },
  total: { type: Number }, // Alias pour compatibilité
  amount: { type: Number }, // Alias pour compatibilité
  status: { type: String, enum: ['pending', 'en attente', 'en cours', 'received', 'livrée', 'cancelled', 'annulée'], default: 'pending' },
  received: { type: Boolean, default: false },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Middleware pour synchroniser supplierId et supplier
purchaseSchema.pre('save', function(next) {
  if (this.supplier && !this.supplierId) {
    this.supplierId = this.supplier;
  }
  if (this.supplierId && !this.supplier) {
    this.supplier = this.supplierId;
  }
  if (this.totalAmount && !this.total) {
    this.total = this.totalAmount;
    this.amount = this.totalAmount;
  }
  if (this.total && !this.totalAmount) {
    this.totalAmount = this.total;
  }
  if (!this.reference) {
    // Générer une référence unique
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    this.reference = `CMD-${new Date().getFullYear()}-${String(timestamp).slice(-6)}${String(random).padStart(3, '0')}`;
  }
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Purchase', purchaseSchema);
