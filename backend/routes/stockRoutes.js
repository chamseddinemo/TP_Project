const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const { getProducts, addProduct, updateProduct, deleteProduct } = require('../controllers/stockController');

// Toutes les routes protégées par auth
router.use(authMiddleware);

// Routes CRUD pour le stock
router.get('/', getProducts); // tous les produits
router.post('/', roleMiddleware(['admin','stock']), addProduct); // ajout produit
router.put('/:id', roleMiddleware(['admin','stock']), updateProduct); // modification produit
router.delete('/:id', roleMiddleware(['admin','stock']), deleteProduct); // suppression produit

module.exports = router;
