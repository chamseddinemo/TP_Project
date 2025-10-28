const Product = require('../models/Product');

// Récupérer tous les produits
const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Erreur récupération produits', error });
  }
};

// Ajouter un produit
const addProduct = async (req, res) => {
  try {
    const { reference, name, stock, pricePurchase, priceSale } = req.body;
    const product = await Product.create({ reference, name, stock, pricePurchase, priceSale });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Erreur ajout produit', error });
  }
};

// Modifier un produit
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Erreur mise à jour produit', error });
  }
};

// Supprimer un produit
const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Produit supprimé' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur suppression produit', error });
  }
};

module.exports = { getProducts, addProduct, updateProduct, deleteProduct };
