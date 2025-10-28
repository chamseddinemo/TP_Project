const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authController');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

// Routes publiques
router.post('/signup', authMiddleware, roleMiddleware(['admin']), signup);
router.post('/login', login);   // connexion

module.exports = router;
