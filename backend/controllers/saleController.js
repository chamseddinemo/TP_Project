const Sale = require('../models/Sale');
const Product = require('../models/Product');

// Créer une vente / proposition
const createSale = async (req, res) => {
  try {
    const { clientId, products } = req.body;

    let totalAmount = 0;

    // Calcul total et mise à jour stock si status facturé
    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ message: 'Produit non trouvé' });

      totalAmount += item.quantity * item.price;

      // Si vente immédiate, on réduit le stock
      if (req.body.status === 'facture' || req.body.status === 'payé') {
        if (product.stock < item.quantity) return res.status(400).json({ message: `Stock insuffisant pour ${product.name}` });
        product.stock -= item.quantity;
        await product.save();
      }
    }

    const sale = await Sale.create({ clientId, products, totalAmount, status: req.body.status || 'proposition' });
    res.status(201).json(sale);

  } catch (error) {
    res.status(500).json({ message: 'Erreur création vente', error });
  }
};

// Récupérer toutes les ventes
const getSales = async (req, res) => {
  try {
    const sales = await Sale.find().populate('clientId').populate('products.productId');
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: 'Erreur récupération ventes', error });
  }
};

// Détails d’une vente
const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id).populate('clientId').populate('products.productId');
    if (!sale) return res.status(404).json({ message: 'Vente non trouvée' });
    res.json(sale);
  } catch (error) {
    res.status(500).json({ message: 'Erreur récupération vente', error });
  }
};

// Mise à jour vente
const updateSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id).populate('products.productId');
    if (!sale) return res.status(404).json({ message: 'Vente non trouvée' });

    const { status } = req.body;

    // Si on transforme en facture ou payé, mettre à jour le stock
    if ((status === 'facture' || status === 'payé') && sale.status === 'proposition') {
      for (const item of sale.products) {
        const product = await Product.findById(item.productId._id);
        if (product.stock < item.quantity) return res.status(400).json({ message: `Stock insuffisant pour ${product.name}` });
        product.stock -= item.quantity;
        await product.save();
      }
    }

    sale.status = status || sale.status;
    await sale.save();
    res.json(sale);

  } catch (error) {
    res.status(500).json({ message: 'Erreur mise à jour vente', error });
  }
};

// Supprimer une vente
const deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findByIdAndDelete(req.params.id);

    if (!sale) {
      return res.status(404).json({ message: 'Vente non trouvée' });
    }

    res.json({ message: 'Vente supprimée avec succès' });

  } catch (error) {
    res.status(500).json({ message: 'Erreur suppression vente', error: error.message });
  }
};

module.exports = { createSale, getSales, getSaleById, updateSale, deleteSale };
