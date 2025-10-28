const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const { createPurchase, getPurchases, updatePurchase } = require('../controllers/purchaseController');

router.use(authMiddleware);

// Créer une commande fournisseur
router.post('/', roleMiddleware(['achat','admin']), createPurchase);

// Récupérer toutes les commandes
router.get('/', roleMiddleware(['achat','admin','comptable']), getPurchases);

// Mise à jour (ex: réception de commande → mise à jour stock)
router.put('/:id', roleMiddleware(['achat','admin']), updatePurchase);

module.exports = router;
