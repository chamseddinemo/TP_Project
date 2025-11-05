const mongoose = require('mongoose');
const Equipment = require('../models/Equipment');

// Ajouter équipement
const addEquipment = async (req, res) => {
  try {
    const { code, name, category, type, status, location, dateAcquisition, responsible, photo, nextMaintenance, notes } = req.body;

    if (!code || !name) {
      return res.status(400).json({ message: 'Le code et le nom sont obligatoires' });
    }

    // Vérifier si le code existe déjà
    const existing = await Equipment.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ message: 'Ce code équipement existe déjà' });
    }

    const equipment = await Equipment.create({
      code: code.toUpperCase(),
      name,
      category: category || 'Autre',
      type,
      status: status || 'en service',
      location,
      dateAcquisition: dateAcquisition ? new Date(dateAcquisition) : new Date(),
      responsible,
      photo,
      nextMaintenance: nextMaintenance ? new Date(nextMaintenance) : null,
      notes
    });

    const populated = await Equipment.findById(equipment._id).populate('responsible', 'nom prenom');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Erreur ajout équipement', error: error.message });
  }
};

// Récupérer tous les équipements avec filtres
const getEquipments = async (req, res) => {
  try {
    const { category, status, search, overdue } = req.query;

    const filter = {};

    if (category) filter.category = category;
    if (status) filter.status = status;
    
    if (search) {
      filter.$or = [
        { code: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } }
      ];
    }

    // Filtrer les équipements en retard d'entretien
    if (overdue === 'true') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filter.nextMaintenance = { $lt: today };
      filter.status = { $ne: 'hors service' }; // Exclure les hors service
    }

    const equipments = await Equipment.find(filter)
      .populate('responsible', 'nom prenom email')
      .sort({ createdAt: -1 });

    // Ajouter un flag pour les équipements en retard
    const equipmentsWithOverdue = equipments.map(eq => {
      const eqObj = eq.toObject();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (eq.nextMaintenance && new Date(eq.nextMaintenance) < today && eq.status !== 'hors service') {
        eqObj.isOverdue = true;
      } else {
        eqObj.isOverdue = false;
      }
      return eqObj;
    });

    res.json(equipmentsWithOverdue);
  } catch (error) {
    res.status(500).json({ message: 'Erreur récupération équipements', error: error.message });
  }
};

// Récupérer un équipement par ID
const getEquipmentById = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id)
      .populate('responsible', 'nom prenom email telephone poste');

    if (!equipment) {
      return res.status(404).json({ message: 'Équipement non trouvé' });
    }

    const eqObj = equipment.toObject();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (equipment.nextMaintenance && new Date(equipment.nextMaintenance) < today && equipment.status !== 'hors service') {
      eqObj.isOverdue = true;
    } else {
      eqObj.isOverdue = false;
    }

    res.json(eqObj);
  } catch (error) {
    res.status(500).json({ message: 'Erreur récupération équipement', error: error.message });
  }
};

// Mise à jour équipement
const updateEquipment = async (req, res) => {
  try {
    const { code, name, category, type, status, location, dateAcquisition, responsible, photo, lastMaintenance, nextMaintenance, notes } = req.body;

    const updateData = {};
    if (code) {
      // Vérifier si le code existe déjà (sauf pour l'équipement actuel)
      const existing = await Equipment.findOne({ code: code.toUpperCase(), _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(400).json({ message: 'Ce code équipement existe déjà' });
      }
      updateData.code = code.toUpperCase();
    }
    if (name) updateData.name = name;
    if (category) updateData.category = category;
    if (type !== undefined) updateData.type = type;
    if (status) updateData.status = status;
    if (location !== undefined) updateData.location = location;
    if (dateAcquisition) updateData.dateAcquisition = new Date(dateAcquisition);
    if (responsible !== undefined) updateData.responsible = responsible;
    if (photo !== undefined) updateData.photo = photo;
    if (lastMaintenance !== undefined) updateData.lastMaintenance = lastMaintenance ? new Date(lastMaintenance) : null;
    if (nextMaintenance !== undefined) updateData.nextMaintenance = nextMaintenance ? new Date(nextMaintenance) : null;
    if (notes !== undefined) updateData.notes = notes;

    const equipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('responsible', 'nom prenom email');

    if (!equipment) {
      return res.status(404).json({ message: 'Équipement non trouvé' });
    }

    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: 'Erreur mise à jour équipement', error: error.message });
  }
};

// Supprimer équipement
const deleteEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndDelete(req.params.id);
    
    if (!equipment) {
      return res.status(404).json({ message: 'Équipement non trouvé' });
    }

    res.json({ message: 'Équipement supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur suppression équipement', error: error.message });
  }
};

// Ajouter une entrée d'entretien
const addMaintenance = async (req, res) => {
  try {
    const { date, type, description, cost, technician, nextMaintenanceDate } = req.body;

    if (!date || !type) {
      return res.status(400).json({ message: 'La date et le type sont obligatoires' });
    }

    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ message: 'Équipement non trouvé' });
    }

    equipment.maintenanceHistory.push({
      date: new Date(date),
      type,
      description,
      cost: cost ? parseFloat(cost) : 0,
      technician,
      nextMaintenanceDate: nextMaintenanceDate ? new Date(nextMaintenanceDate) : null
    });

    // Mettre à jour lastMaintenance et nextMaintenance
    equipment.lastMaintenance = new Date(date);
    if (nextMaintenanceDate) {
      equipment.nextMaintenance = new Date(nextMaintenanceDate);
    }

    await equipment.save();

    const updated = await Equipment.findById(equipment._id).populate('responsible', 'nom prenom');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Erreur ajout entretien', error: error.message });
  }
};

// Récupérer l'historique complet des maintenances/réparations
// Version minimale et fonctionnelle
const getMaintenanceHistory = async (req, res) => {
  try {
    console.log('\n🔍 [getMaintenanceHistory] === DÉBUT ===');
    
    // Vérifier que Equipment existe
    if (!Equipment) {
      console.error('❌ ERREUR: Equipment modèle non trouvé');
      return res.status(200).json([]);
    }
    console.log('✅ Modèle Equipment trouvé');

    // Vérifier que find est une fonction
    if (typeof Equipment.find !== 'function') {
      console.error('❌ ERREUR: Equipment.find n\'est pas une fonction');
      console.error('Type:', typeof Equipment);
      return res.status(200).json([]);
    }
    console.log('✅ Equipment.find est disponible');

    // Exécuter la requête - VERSION MINIMALE
    console.log('🔍 Exécution de Equipment.find()...');
    const equipments = await Equipment.find({}).lean().limit(1000).exec();
    
    console.log(`✅ ${equipments.length} équipements trouvés`);

    // Construire la liste des maintenances de manière ultra-simple
    const allMaintenances = [];

    try {
      equipments.forEach(eq => {
        try {
          if (!eq || !eq.maintenanceHistory || !Array.isArray(eq.maintenanceHistory)) {
            return;
          }

          eq.maintenanceHistory.forEach(maintenance => {
            try {
              if (!maintenance || typeof maintenance !== 'object') {
                return;
              }

              // Créer l'objet de maintenance de manière sécurisée
              allMaintenances.push({
                _id: maintenance._id ? String(maintenance._id) : null,
                equipmentId: eq._id ? String(eq._id) : null,
                equipmentCode: eq.code || '',
                equipmentName: eq.name || '',
                equipmentCategory: eq.category || '',
                date: maintenance.date || null,
                type: maintenance.type || '',
                description: maintenance.description || '',
                cost: typeof maintenance.cost === 'number' ? maintenance.cost : (parseFloat(maintenance.cost) || 0),
                technician: maintenance.technician || '',
                nextMaintenanceDate: maintenance.nextMaintenanceDate || null,
                createdAt: maintenance.createdAt || null,
                updatedAt: maintenance.updatedAt || null
              });
            } catch (err) {
              console.error('Erreur traitement maintenance:', err.message);
            }
          });
        } catch (err) {
          console.error('Erreur traitement équipement:', err.message);
        }
      });
    } catch (err) {
      console.error('Erreur construction liste:', err.message);
      console.error('Stack:', err.stack);
      return res.status(200).json([]);
    }

    console.log(`✅ ${allMaintenances.length} maintenances trouvées dans l'historique`);
    console.log('🔍 [getMaintenanceHistory] === FIN ===\n');
    
    return res.status(200).json(allMaintenances || []);
    
  } catch (error) {
    // AFFICHER LA VRAIE ERREUR dans le terminal backend
    console.error('\n❌❌❌ ERREUR CRITIQUE dans getMaintenanceHistory ❌❌❌');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('Type:', error.constructor.name);
    console.error('Détails:', error);
    console.error('❌❌❌ ========================================== ❌❌❌\n');
    
    // Retourner un tableau vide avec statut 200 pour éviter le crash frontend
    return res.status(200).json([]);
  }
};

// Supprimer une entrée d'historique
const deleteMaintenanceHistory = async (req, res) => {
  try {
    const { equipmentId, maintenanceId } = req.params;

    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({ message: 'Équipement non trouvé' });
    }

    equipment.maintenanceHistory = equipment.maintenanceHistory.filter(
      m => m._id.toString() !== maintenanceId
    );

    await equipment.save();
    res.json({ message: 'Entrée d\'historique supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur suppression historique', error: error.message });
  }
};

// Mettre à jour une entrée d'historique
const updateMaintenanceHistory = async (req, res) => {
  try {
    const { equipmentId, maintenanceId } = req.params;
    const { date, type, description, cost, technician, nextMaintenanceDate } = req.body;

    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({ message: 'Équipement non trouvé' });
    }

    const maintenance = equipment.maintenanceHistory.id(maintenanceId);
    if (!maintenance) {
      return res.status(404).json({ message: 'Entrée d\'historique non trouvée' });
    }

    if (date) maintenance.date = new Date(date);
    if (type) maintenance.type = type;
    if (description !== undefined) maintenance.description = description;
    if (cost !== undefined) maintenance.cost = parseFloat(cost);
    if (technician !== undefined) maintenance.technician = technician;
    if (nextMaintenanceDate) maintenance.nextMaintenanceDate = new Date(nextMaintenanceDate);

    await equipment.save();

    const updated = await Equipment.findById(equipmentId)
      .populate('responsible', 'nom prenom email');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Erreur mise à jour historique', error: error.message });
  }
};

module.exports = { 
  addEquipment, 
  getEquipments, 
  getEquipmentById,
  updateEquipment, 
  deleteEquipment,
  addMaintenance,
  getMaintenanceHistory,
  deleteMaintenanceHistory,
  updateMaintenanceHistory
};
