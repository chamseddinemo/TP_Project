const Equipment = require('../models/Equipment');

// Ajouter équipement
const addEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.create(req.body);
    res.status(201).json(equipment);
  } catch (error) {
    res.status(500).json({ message: 'Erreur ajout équipement', error });
  }
};

// Récupérer tous les équipements
const getEquipments = async (req, res) => {
  try {
    const equipments = await Equipment.find();
    res.json(equipments);
  } catch (error) {
    res.status(500).json({ message: 'Erreur récupération équipements', error });
  }
};

// Mise à jour équipement
const updateEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: 'Erreur mise à jour équipement', error });
  }
};

// Supprimer équipement
const deleteEquipment = async (req, res) => {
  try {
    await Equipment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Équipement supprimé' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur suppression équipement', error });
  }
};

module.exports = { addEquipment, getEquipments, updateEquipment, deleteEquipment };
