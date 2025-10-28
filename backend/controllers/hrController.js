const Employee = require('../models/Employee');

// Ajouter employé
const addEmployee = async (req, res) => {
  try {
    const employee = await Employee.create(req.body);
    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Erreur ajout employé', error });
  }
};

// Récupérer tous les employés
const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Erreur récupération employés', error });
  }
};

// Mettre à jour un employé
const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Erreur mise à jour employé', error });
  }
};

// Supprimer un employé
const deleteEmployee = async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: 'Employé supprimé' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur suppression employé', error });
  }
};

module.exports = { addEmployee, getEmployees, updateEmployee, deleteEmployee };
