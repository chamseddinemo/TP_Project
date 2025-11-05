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

// Mettre à jour un utilisateur (admin seulement)
router.put('/users/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { name, email, role, password } = req.body;
    const updateData = { name, role };
    
    // Si l'email change, vérifier qu'il n'existe pas déjà
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      }
      updateData.email = email;
    }
    
    // Si un nouveau mot de passe est fourni, l'ajouter
    if (password && password.length >= 6) {
      updateData.password = password;
    }
    
    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erreur mise à jour utilisateur', error: error.message });
  }
});

// Supprimer un utilisateur (admin seulement)
router.delete('/users/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json({ message: 'Utilisateur supprimé' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur suppression utilisateur', error: error.message });
  }
});

module.exports = router;
