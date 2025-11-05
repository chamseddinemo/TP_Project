const Product = require('../models/Product');
const Supplier = require('../models/Supplier');

// Récupérer tous les produits
const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('supplier');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Erreur récupération produits', error: error.message });
  }
};

// Ajouter un produit
const addProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    await product.populate('supplier');
    res.status(201).json(product);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Cette référence existe déjà' });
    }
    res.status(500).json({ message: 'Erreur ajout produit', error: error.message });
  }
};

// Modifier un produit
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    ).populate('supplier');
    
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Erreur mise à jour produit', error: error.message });
  }
};

// Supprimer un produit
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }
    
    res.json({ message: 'Produit supprimé' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur suppression produit', error: error.message });
  }
};

module.exports = { getProducts, addProduct, updateProduct, deleteProduct };
