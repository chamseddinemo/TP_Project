const Supplier = require('../models/Supplier');

// Récupérer tous les fournisseurs
const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: 'Erreur récupération fournisseurs', error: error.message });
  }
};

// Ajouter un fournisseur
const addSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json(supplier);
  } catch (error) {
    res.status(500).json({ message: 'Erreur ajout fournisseur', error: error.message });
  }
};

// Modifier un fournisseur
const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!supplier) {
      return res.status(404).json({ message: 'Fournisseur non trouvé' });
    }
    
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ message: 'Erreur mise à jour fournisseur', error: error.message });
  }
};

// Supprimer un fournisseur
const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    
    if (!supplier) {
      return res.status(404).json({ message: 'Fournisseur non trouvé' });
    }
    
    res.json({ message: 'Fournisseur supprimé' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur suppression fournisseur', error: error.message });
  }
};

module.exports = { getSuppliers, addSupplier, updateSupplier, deleteSupplier };

