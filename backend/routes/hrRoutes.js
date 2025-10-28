const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const { addEmployee, getEmployees, updateEmployee, deleteEmployee } = require('../controllers/hrController');

router.use(authMiddleware);

// Gestion des employés
router.post('/', roleMiddleware(['rh','admin']), addEmployee);
router.get('/', roleMiddleware(['rh','admin']), getEmployees);
router.put('/:id', roleMiddleware(['rh','admin']), updateEmployee);
router.delete('/:id', roleMiddleware(['rh','admin']), deleteEmployee);

module.exports = router;
