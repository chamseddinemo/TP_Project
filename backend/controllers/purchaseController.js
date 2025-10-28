const Purchase = require('../models/Purchase');
const Product = require('../models/Product');

// Créer commande fournisseur
const createPurchase = async (req, res) => {
  try {
    const { supplierId, products } = req.body;

    let totalAmount = 0;

    for (const item of products) {
      totalAmount += item.quantity * item.price;
    }

    const purchase = await Purchase.create({ supplierId, products, totalAmount });
    res.status(201).json(purchase);

  } catch (error) {
    res.status(500).json({ message: 'Erreur création achat', error });
  }
};

// Récupérer toutes les commandes
const getPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find().populate('supplierId').populate('products.productId');
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: 'Erreur récupération achats', error });
  }
};

// Mettre à jour une commande (ex: réception)
const updatePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id).populate('products.productId');
    if (!purchase) return res.status(404).json({ message: 'Commande non trouvée' });

    const { received } = req.body;

    if (received && !purchase.received) {
      for (const item of purchase.products) {
        const product = await Product.findById(item.productId._id);
        product.stock += item.quantity;
        await product.save();
      }
      purchase.received = true;
      await purchase.save();
    }

    res.json(purchase);

  } catch (error) {
    res.status(500).json({ message: 'Erreur mise à jour achat', error });
  }
};

module.exports = { createPurchase, getPurchases, updatePurchase };
