const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

const User = require('../models/User');
const Product = require('../models/Product');     // Stocks
const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');
const Employee = require('../models/Employee');   // RH
const Equipment = require('../models/Equipment'); // Équipements

// ✅ Route protégée pour stats admin
router.get('/stats', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    // --- Comptages principaux ---
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();     // Produits en stock
    const totalVentes = await Sale.countDocuments();          // Nombre de ventes
    const totalAchats = await Purchase.countDocuments();      // Nombre d'achats
    const totalRH = await Employee.countDocuments();          // Nombre d'employés
    const totalFinance = await User.countDocuments({ role: 'comptable' }); // Comptables
    const totalEquipments = await Equipment.countDocuments(); // Équipements

    // --- Liste utilisateurs ---
    const usersList = await User.find({}, 'name email role createdAt').sort({ createdAt: -1 });

    // ✅ Réponse cohérente avec le frontend
    res.json({
      totalUsers,
      totalProducts,
      totalVentes,
      totalAchats,
      totalRH,
      totalFinance,
      totalEquipments,
      usersList,
    });

  } catch (error) {
    console.error("Erreur dans /admin/stats :", error);
    res.status(500).json({ message: 'Erreur récupération stats', error: error.message });
  }
});

module.exports = router;
