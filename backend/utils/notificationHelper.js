// Helper pour créer des notifications dans le système
const Notification = require('../models/Notification');

const createNotification = async (io, data) => {
  try {
    const { action, type, title, message, author, authorId, department } = data;

    const notification = await Notification.create({
      action,
      type,
      title: title || `${action === 'create' ? 'Ajout' : action === 'update' ? 'Modification' : 'Suppression'} de ${type}`,
      message: message || `${action === 'create' ? 'Nouveau' : action === 'update' ? 'Modifié' : 'Supprimé'}: ${title}`,
      author: author || 'Système',
      authorId,
      department
    });

    // Émettre via Socket.io si disponible
    if (io) {
      io.emit('notification', notification);
    }

    return notification;
  } catch (error) {
    console.error('Erreur création notification:', error);
    return null;
  }
};

module.exports = { createNotification };

