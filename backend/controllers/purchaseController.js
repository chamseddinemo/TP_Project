const Purchase = require('../models/Purchase');
const Product = require('../models/Product');

// Créer commande fournisseur
const createPurchase = async (req, res) => {
  try {
    const { 
      supplier, 
      supplierId, 
      reference, 
      date, 
      items, 
      products, 
      total, 
      totalAmount, 
      amount,
      status,
      notes
    } = req.body;

    // Utiliser supplierId ou supplier
    const finalSupplierId = supplierId || supplier;
    if (!finalSupplierId) {
      return res.status(400).json({ message: 'Fournisseur requis' });
    }

    // Utiliser products ou items
    const finalProducts = products || items || [];
    
    // Calculer le total si non fourni
    let finalTotal = totalAmount || total || amount || 0;
    if (finalTotal === 0 && finalProducts.length > 0) {
      finalTotal = finalProducts.reduce((sum, item) => {
        return sum + ((item.quantity || 0) * (item.price || 0));
      }, 0);
    }

    const purchaseData = {
      supplierId: finalSupplierId,
      supplier: finalSupplierId,
      reference: reference || `CMD-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      date: date ? new Date(date) : new Date(),
      products: finalProducts,
      items: finalProducts,
      totalAmount: finalTotal,
      total: finalTotal,
      amount: finalTotal,
      status: status || 'pending',
      notes: notes || ''
    };

    const purchase = await Purchase.create(purchaseData);
    await purchase.populate('supplierId');
    
    // Formater la réponse
    const formattedPurchase = {
      _id: purchase._id,
      reference: purchase.reference,
      number: purchase.reference,
      supplier: purchase.supplierId ? {
        _id: purchase.supplierId._id,
        name: purchase.supplierId.name,
        email: purchase.supplierId.email,
        phone: purchase.supplierId.phone
      } : null,
      date: purchase.date,
      items: purchase.products,
      total: purchase.totalAmount,
      amount: purchase.totalAmount,
      status: purchase.status,
      received: purchase.received,
      notes: purchase.notes
    };
    
    res.status(201).json(formattedPurchase);

  } catch (error) {
    res.status(500).json({ message: 'Erreur création achat', error: error.message });
  }
};

// Récupérer toutes les commandes
const getPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .populate('supplierId')
      .populate('products.productId')
      .sort({ createdAt: -1 });
    
    // Adapter le format pour le frontend
    const formattedPurchases = purchases.map(p => ({
      _id: p._id,
      reference: p.reference || `CMD-${p.createdAt.getFullYear()}-${String(p._id).slice(-6)}`,
      number: p.reference || `CMD-${p.createdAt.getFullYear()}-${String(p._id).slice(-6)}`,
      supplier: p.supplierId ? {
        _id: p.supplierId._id,
        name: p.supplierId.name,
        email: p.supplierId.email,
        phone: p.supplierId.phone
      } : null,
      date: p.date || p.createdAt,
      items: p.products || [],
      total: p.totalAmount || p.total || 0,
      amount: p.totalAmount || p.total || 0,
      status: p.received ? "received" : (p.status || "pending"),
      received: p.received || false,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    }));
    
    res.json(formattedPurchases);
  } catch (error) {
    res.status(500).json({ message: 'Erreur récupération achats', error: error.message });
  }
};

// Mettre à jour une commande (ex: réception)
const updatePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id).populate('supplierId').populate('products.productId');
    if (!purchase) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    const { 
      received, 
      status, 
      supplier, 
      supplierId, 
      reference, 
      date, 
      total, 
      totalAmount, 
      notes 
    } = req.body;

    // Mettre à jour les champs
    if (supplier !== undefined || supplierId !== undefined) {
      purchase.supplierId = supplierId || supplier || purchase.supplierId;
      purchase.supplier = purchase.supplierId;
    }
    if (reference !== undefined) purchase.reference = reference;
    if (date !== undefined) purchase.date = new Date(date);
    if (total !== undefined || totalAmount !== undefined) {
      purchase.totalAmount = totalAmount || total || purchase.totalAmount;
      purchase.total = purchase.totalAmount;
      purchase.amount = purchase.totalAmount;
    }
    if (status !== undefined) purchase.status = status;
    if (notes !== undefined) purchase.notes = notes;

    // Gérer la réception
    if (received !== undefined || status === "received" || status === "livrée") {
      if ((received || status === "received" || status === "livrée") && !purchase.received) {
        // Mettre à jour le stock des produits (si products existe)
        if (purchase.products && purchase.products.length > 0) {
          for (const item of purchase.products) {
            if (item.productId && item.productId._id) {
              const product = await Product.findById(item.productId._id);
              if (product) {
                product.quantity = (product.quantity || 0) + (item.quantity || 0);
                await product.save();
              }
            }
          }
        }
        purchase.received = true;
        purchase.status = "received";
      } else if (!received && (status !== "received" && status !== "livrée")) {
        purchase.received = false;
      }
    }

    await purchase.save();

    // Formater la réponse
    const formattedPurchase = {
      _id: purchase._id,
      reference: purchase.reference || `CMD-${purchase.createdAt.getFullYear()}-${String(purchase._id).slice(-6)}`,
      number: purchase.reference || `CMD-${purchase.createdAt.getFullYear()}-${String(purchase._id).slice(-6)}`,
      supplier: purchase.supplierId ? {
        _id: purchase.supplierId._id,
        name: purchase.supplierId.name,
        email: purchase.supplierId.email,
        phone: purchase.supplierId.phone
      } : null,
      date: purchase.date || purchase.createdAt,
      items: purchase.products || [],
      total: purchase.totalAmount || purchase.total || 0,
      amount: purchase.totalAmount || purchase.total || 0,
      status: purchase.status || (purchase.received ? "received" : "pending"),
      received: purchase.received || false,
      notes: purchase.notes,
      createdAt: purchase.createdAt,
      updatedAt: purchase.updatedAt
    };

    res.json(formattedPurchase);

  } catch (error) {
    res.status(500).json({ message: 'Erreur mise à jour achat', error: error.message });
  }
};

module.exports = { createPurchase, getPurchases, updatePurchase };
