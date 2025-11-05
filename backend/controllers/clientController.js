const Client = require('../models/Client');

// Récupérer tous les clients
const getClients = async (req, res) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Erreur récupération clients', error: error.message });
  }
};

// Ajouter un client
const addClient = async (req, res) => {
  try {
    const client = await Client.create(req.body);
    res.status(201).json(client);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Cet email existe déjà' });
    }
    res.status(500).json({ message: 'Erreur ajout client', error: error.message });
  }
};

// Modifier un client
const updateClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!client) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }
    
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: 'Erreur mise à jour client', error: error.message });
  }
};

// Supprimer un client
const deleteClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    
    if (!client) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }
    
    res.json({ message: 'Client supprimé' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur suppression client', error: error.message });
  }
};

module.exports = { getClients, addClient, updateClient, deleteClient };

