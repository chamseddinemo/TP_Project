const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const { createSale, getSales, getSaleById, updateSale } = require('../controllers/saleController');

router.use(authMiddleware);

// Créer une vente / proposition
router.post('/', roleMiddleware(['vente','admin']), createSale);

// Récupérer toutes les ventes
router.get('/', roleMiddleware(['vente','admin','comptable']), getSales);

// Détails d’une vente
router.get('/:id', roleMiddleware(['vente','admin','comptable']), getSaleById);

// Mise à jour vente (ex: transformer proposition en facture)
router.put('/:id', roleMiddleware(['vente','admin']), updateSale);

module.exports = router;
