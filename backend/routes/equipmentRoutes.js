const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const { addEquipment, getEquipments, updateEquipment, deleteEquipment } = require('../controllers/equipmentController');

router.use(authMiddleware);

// Gestion équipements / machines
router.post('/', roleMiddleware(['technicien','admin']), addEquipment);
router.get('/', roleMiddleware(['technicien','admin']), getEquipments);
router.put('/:id', roleMiddleware(['technicien','admin']), updateEquipment);
router.delete('/:id', roleMiddleware(['technicien','admin']), deleteEquipment);

module.exports = router;
