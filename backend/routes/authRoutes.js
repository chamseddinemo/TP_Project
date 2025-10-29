const express = require('express');
const router = express.Router();
const { signup, login, getUsers } = require('../controllers/authController');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const User = require('../models/User');

router.post('/signup', signup);
router.post('/login', login);
// Récupérer tous les utilisateurs (admin seulement)
router.get('/users', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const users = await User.find().select('-password'); // on enlève le password
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erreur récupération utilisateurs', error });
  }
});
module.exports = router;
