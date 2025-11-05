const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  action: {
    type: String,
    enum: ['create', 'update', 'delete'],
    required: true
  },
  type: {
    type: String,
    enum: ['user', 'employee', 'product', 'client', 'supplier', 'purchase', 'sale', 'transaction', 'equipment', 'other'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  department: {
    type: String
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index pour les requêtes fréquentes
notificationSchema.index({ read: 1, createdAt: -1 });
notificationSchema.index({ authorId: 1 });

module.exports = mongoose.model('Notification', notificationSchema);

