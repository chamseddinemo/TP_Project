const Notification = require('../models/Notification');

// Créer une notification
const createNotification = async (req, res) => {
  try {
    const { action, type, title, message, author, authorId, department } = req.body;
    
    const notification = await Notification.create({
      action,
      type,
      title,
      message,
      author: author || 'Système',
      authorId,
      department
    });

    // Émettre via Socket.io si disponible
    if (req.io) {
      req.io.emit('notification', notification);
    }

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Erreur création notification', error: error.message });
  }
};

// Récupérer toutes les notifications
const getNotifications = async (req, res) => {
  try {
    const { read, limit = 50 } = req.query;
    const filter = {};
    
    if (read !== undefined) {
      filter.read = read === 'true';
    }

    const notifications = await Notification.find(filter)
      .populate('authorId', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Erreur récupération notifications', error: error.message });
  }
};

// Marquer comme lu
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      id,
      { read: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification non trouvée' });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Erreur mise à jour notification', error: error.message });
  }
};

// Marquer toutes comme lues
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { read: false },
      { read: true, readAt: new Date() }
    );

    res.json({ message: 'Toutes les notifications ont été marquées comme lues' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur mise à jour notifications', error: error.message });
  }
};

// Supprimer une notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndDelete(id);
    res.json({ message: 'Notification supprimée' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur suppression notification', error: error.message });
  }
};

// Compter les notifications non lues
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ read: false });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Erreur comptage notifications', error: error.message });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount
};

