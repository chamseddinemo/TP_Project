const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const { 
  addEquipment, 
  getEquipments, 
  getEquipmentById,
  updateEquipment, 
  deleteEquipment,
  addMaintenance,
  getMaintenanceHistory,
  deleteMaintenanceHistory,
  updateMaintenanceHistory
} = require('../controllers/equipmentController');
const {
  createPlannedMaintenance,
  getPlannedMaintenances,
  getPlannedMaintenanceById,
  updatePlannedMaintenance,
  deletePlannedMaintenance,
  completeMaintenance,
  getMaintenancesNeedingNotification
} = require('../controllers/maintenanceController');
const Equipment = require('../models/Equipment');
const PlannedMaintenance = require('../models/PlannedMaintenance');

router.use(authMiddleware);

// Route de test pour vérifier que le modèle fonctionne
router.get('/test-planned-maintenances', async (req, res) => {
  try {
    console.log('🔍 [TEST] Route de test appelée');
    const PlannedMaintenance = require('../models/PlannedMaintenance');
    console.log('✅ Modèle PlannedMaintenance importé:', typeof PlannedMaintenance);
    console.log('✅ PlannedMaintenance.find:', typeof PlannedMaintenance?.find);
    
    const count = await PlannedMaintenance.countDocuments();
    console.log(`✅ Nombre de documents: ${count}`);
    
    const maintenances = await PlannedMaintenance.find({}).lean().limit(10).exec();
    console.log(`✅ ${maintenances.length} maintenances récupérées`);
    
    res.status(200).json({ success: true, count, maintenances });
  } catch (error) {
    console.error('❌ ERREUR dans la route de test:', error.message);
    console.error('Stack:', error.stack);
    res.status(200).json({ success: false, error: error.message, maintenances: [] });
  }
});

// ============= STATISTIQUES ÉQUIPEMENTS =============

// GET statistiques équipements pour le dashboard
router.get('/stats', roleMiddleware(['technicien','admin','rh']), async (req, res) => {
  try {
    // Nombre total d'équipements
    const totalEquipments = await Equipment.countDocuments();
    
    // Équipements par statut
    const operationalEquipments = await Equipment.countDocuments({ status: 'en service' });
    const maintenanceEquipments = await Equipment.countDocuments({ status: 'en maintenance' });
    const outOfServiceEquipments = await Equipment.countDocuments({ status: 'hors service' });
    
    // Équipements par catégorie
    const equipmentsByCategory = await Equipment.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          operational: {
            $sum: { $cond: [{ $eq: ['$status', 'en service'] }, 1, 0] }
          },
          maintenance: {
            $sum: { $cond: [{ $eq: ['$status', 'en maintenance'] }, 1, 0] }
          },
          outOfService: {
            $sum: { $cond: [{ $eq: ['$status', 'hors service'] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Équipements nécessitant une maintenance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const equipmentsNeedingMaintenance = await Equipment.find({
      $or: [
        { nextMaintenance: { $lt: today } },
        { nextMaintenance: null, status: { $ne: 'hors service' } }
      ],
      status: { $ne: 'hors service' }
    })
    .populate('responsible', 'nom prenom email')
    .sort({ nextMaintenance: 1 })
    .limit(10)
    .select('code name category status nextMaintenance lastMaintenance responsible');
    
    // Maintenances planifiées
    const plannedMaintenances = await PlannedMaintenance.countDocuments({
      status: { $in: ['planifiée', 'en cours'] }
    });
    
    const upcomingMaintenances = await PlannedMaintenance.find({
      status: { $in: ['planifiée', 'en cours'] },
      datePrevue: { $gte: today }
    })
    .populate('equipment', 'code name category photo')
    .populate('responsible', 'nom prenom email')
    .sort({ datePrevue: 1 })
    .limit(5)
    .select('equipment type datePrevue responsible status');
    
    const overdueMaintenances = await PlannedMaintenance.countDocuments({
      status: { $in: ['planifiée', 'en cours'] },
      datePrevue: { $lt: today }
    });
    
    // Derniers équipements ajoutés
    const recentEquipments = await Equipment.find()
      .populate('responsible', 'nom prenom')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('code name category status dateAcquisition responsible createdAt');
    
    // Statistiques de maintenance
    const totalMaintenanceHistory = await Equipment.aggregate([
      {
        $project: {
          maintenanceCount: { $size: { $ifNull: ['$maintenanceHistory', []] } }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$maintenanceCount' }
        }
      }
    ]);
    const totalMaintenanceEntries = totalMaintenanceHistory.length > 0 ? totalMaintenanceHistory[0].total : 0;
    
    // Coût total des maintenances
    const totalMaintenanceCostResult = await Equipment.aggregate([
      {
        $project: {
          totalCost: {
            $sum: {
              $map: {
                input: { $ifNull: ['$maintenanceHistory', []] },
                as: 'maint',
                in: { $ifNull: ['$$maint.cost', 0] }
              }
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalCost' }
        }
      }
    ]);
    const totalMaintenanceCost = totalMaintenanceCostResult.length > 0 ? totalMaintenanceCostResult[0].total : 0;
    
    // Maintenances par type
    const maintenancesByType = await PlannedMaintenance.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          planned: {
            $sum: { $cond: [{ $eq: ['$status', 'planifiée'] }, 1, 0] }
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$status', 'en cours'] }, 1, 0] }
          },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'terminée'] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      totalEquipments,
      operationalEquipments,
      maintenanceEquipments,
      outOfServiceEquipments,
      equipmentsByCategory,
      equipmentsNeedingMaintenance,
      plannedMaintenances,
      upcomingMaintenances,
      overdueMaintenances,
      recentEquipments,
      totalMaintenanceEntries,
      totalMaintenanceCost,
      maintenancesByType
    });
  } catch (error) {
    console.error("Erreur récupération stats équipements:", error);
    res.status(500).json({ message: error.message });
  }
});

// Gestion équipements / machines (alias /equipments pour compatibilité frontend)
router.post('/equipments', roleMiddleware(['technicien','admin']), addEquipment);
router.get('/equipments', roleMiddleware(['technicien','admin','rh']), getEquipments);
router.get('/equipments/:id', roleMiddleware(['technicien','admin','rh']), getEquipmentById);
router.put('/equipments/:id', roleMiddleware(['technicien','admin']), updateEquipment);
router.delete('/equipments/:id', roleMiddleware(['technicien','admin']), deleteEquipment);
router.post('/equipments/:id/maintenance', roleMiddleware(['technicien','admin']), addMaintenance);

// Gestion équipements / machines (anciennes routes)
router.post('/', roleMiddleware(['technicien','admin']), addEquipment);
router.get('/', roleMiddleware(['technicien','admin','rh']), getEquipments);
router.get('/:id', roleMiddleware(['technicien','admin','rh']), getEquipmentById);
router.put('/:id', roleMiddleware(['technicien','admin']), updateEquipment);
router.delete('/:id', roleMiddleware(['technicien','admin']), deleteEquipment);
router.post('/:id/maintenance', roleMiddleware(['technicien','admin']), addMaintenance);

// Routes pour les maintenances planifiées
router.post('/planned-maintenances', roleMiddleware(['technicien','admin']), createPlannedMaintenance);

// Route pour récupérer les maintenances planifiées
// La fonction getPlannedMaintenances gère déjà toutes les erreurs et retourne toujours un statut 200
router.get('/planned-maintenances', roleMiddleware(['technicien','admin','rh']), getPlannedMaintenances);
router.get('/planned-maintenances/notifications', roleMiddleware(['technicien','admin']), getMaintenancesNeedingNotification);
router.get('/planned-maintenances/:id', roleMiddleware(['technicien','admin','rh']), getPlannedMaintenanceById);
router.put('/planned-maintenances/:id', roleMiddleware(['technicien','admin']), updatePlannedMaintenance);
router.delete('/planned-maintenances/:id', roleMiddleware(['technicien','admin']), deletePlannedMaintenance);
router.post('/planned-maintenances/:id/complete', roleMiddleware(['technicien','admin']), completeMaintenance);

// Routes pour l'historique des réparations
router.get('/maintenance-history', roleMiddleware(['technicien','admin','rh']), getMaintenanceHistory);
router.put('/maintenance-history/:equipmentId/:maintenanceId', roleMiddleware(['technicien','admin']), updateMaintenanceHistory);
router.delete('/maintenance-history/:equipmentId/:maintenanceId', roleMiddleware(['technicien','admin']), deleteMaintenanceHistory);

module.exports = router;
