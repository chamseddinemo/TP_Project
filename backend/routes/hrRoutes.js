const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");
const JobOffer = require("../models/JobOffer");
const Application = require("../models/Application");
const Timesheet = require("../models/Timesheet");
const Payslip = require("../models/Payslip");
const Contract = require("../models/Contract");
const Leave = require("../models/Leave");

// ============= EMPLOYÉS =============

// GET tous les employés
router.get("/employees", async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET un employé par ID
router.get("/employees/:id", async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employé non trouvé" });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST créer un employé
router.post("/employees", async (req, res) => {
  try {
    const employee = new Employee(req.body);
    const newEmployee = await employee.save();
    res.status(201).json(newEmployee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT modifier un employé
router.put("/employees/:id", async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!employee) {
      return res.status(404).json({ message: "Employé non trouvé" });
    }
    res.json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE supprimer un employé
router.delete("/employees/:id", async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employé non trouvé" });
    }
    res.json({ message: "Employé supprimé" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============= OFFRES D'EMPLOI =============

// GET toutes les offres
router.get("/job-offers", async (req, res) => {
  try {
    const offers = await JobOffer.find();
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST créer une offre
router.post("/job-offers", async (req, res) => {
  try {
    const offer = new JobOffer(req.body);
    const newOffer = await offer.save();
    res.status(201).json(newOffer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT modifier une offre
router.put("/job-offers/:id", async (req, res) => {
  try {
    const offer = await JobOffer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!offer) {
      return res.status(404).json({ message: "Offre non trouvée" });
    }
    res.json(offer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE supprimer une offre
router.delete("/job-offers/:id", async (req, res) => {
  try {
    const offer = await JobOffer.findByIdAndDelete(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: "Offre non trouvée" });
    }
    res.json({ message: "Offre supprimée" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============= CANDIDATURES =============

// GET toutes les candidatures (optionnel: filtrer par offre)
router.get("/applications", async (req, res) => {
  try {
    const filter = req.query.offerId ? { offreId: req.query.offerId } : {};
    const applications = await Application.find(filter).populate("offreId");
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST créer une candidature
router.post("/applications", async (req, res) => {
  try {
    const application = new Application(req.body);
    const newApplication = await application.save();
    res.status(201).json(newApplication);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT modifier le statut/note d'une candidature
router.put("/applications/:id", async (req, res) => {
  try {
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!application) {
      return res.status(404).json({ message: "Candidature non trouvée" });
    }
    res.json(application);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST envoyer invitation à un entretien
router.post("/applications/:id/invite", async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: "Candidature non trouvée" });
    }
    
    // Ici, vous pouvez implémenter l'envoi d'email
    // Par exemple, avec nodemailer
    
    res.json({ message: "Invitation envoyée", application });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============= FEUILLES DE TEMPS =============

// GET feuilles de temps (par employé, mois, année)
router.get("/timesheets", async (req, res) => {
  try {
    const { employeeId, month, year } = req.query;
    const filter = {};
    
    if (employeeId) filter.employeId = employeeId;
    if (month) filter.mois = parseInt(month);
    if (year) filter.annee = parseInt(year);
    
    const timesheets = await Timesheet.find(filter).populate("employeId");
    res.json(timesheets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST créer une feuille de temps
router.post("/timesheets", async (req, res) => {
  try {
    // Vérifier si une feuille existe déjà pour cet employé ce mois
    const existing = await Timesheet.findOne({
      employeId: req.body.employeId,
      mois: req.body.mois,
      annee: req.body.annee
    });

    if (existing) {
      // Mettre à jour
      existing.jours = req.body.jours;
      const updated = await existing.save();
      return res.json(updated);
    }

    // Créer nouvelle
    const timesheet = new Timesheet(req.body);
    const newTimesheet = await timesheet.save();
    res.status(201).json(newTimesheet);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT modifier une feuille de temps
router.put("/timesheets/:id", async (req, res) => {
  try {
    const timesheet = await Timesheet.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!timesheet) {
      return res.status(404).json({ message: "Feuille de temps non trouvée" });
    }
    res.json(timesheet);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET export PDF (simulation)
router.get("/timesheets/export/pdf", async (req, res) => {
  try {
    // Ici, implémentez la génération de PDF avec une librairie comme pdfkit ou puppeteer
    res.json({ message: "Export PDF en développement" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET export Excel (simulation)
router.get("/timesheets/export/excel", async (req, res) => {
  try {
    // Ici, implémentez la génération Excel avec une librairie comme exceljs
    res.json({ message: "Export Excel en développement" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============= FICHES DE PAIE =============

// GET fiches de paie (filtrer par employé, année)
router.get("/payslips", async (req, res) => {
  try {
    const { employeeId, year } = req.query;
    const filter = {};
    
    if (employeeId) filter.employeId = employeeId;
    if (year) filter.annee = parseInt(year);
    
    const payslips = await Payslip.find(filter).populate("employeId");
    res.json(payslips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST générer une fiche de paie
router.post("/payslips/generate", async (req, res) => {
  try {
    const { employeeId, month, year } = req.body;
    
    // Validation des paramètres
    if (!employeeId) {
      return res.status(400).json({ message: "employeeId est requis" });
    }
    if (!month || month < 1 || month > 12) {
      return res.status(400).json({ message: "mois invalide (doit être entre 1 et 12)" });
    }
    if (!year) {
      return res.status(400).json({ message: "année est requise" });
    }
    
    // Utiliser employeId pour la cohérence avec le modèle
    const employeId = employeeId;
    
    // Récupérer l'employé
    const employee = await Employee.findById(employeId);
    if (!employee) {
      return res.status(404).json({ message: "Employé non trouvé" });
    }

    // Récupérer la feuille de temps du mois
    const timesheet = await Timesheet.findOne({
      employeId,
      mois: parseInt(month),
      annee: parseInt(year)
    });

    let heuresNormales = 0;
    let heuresSupplementaires = 0;

    if (timesheet) {
      timesheet.jours.forEach(jour => {
        heuresNormales += jour.heuresNormales || 0;
        heuresSupplementaires += jour.heuresSupplementaires || 0;
      });
    }

    // Calculer le salaire selon les cotisations québécoises
    const salaireBrut = employee.salaire || 0;
    const cotisations = {
      qpp: salaireBrut * 0.0545,      // Régime de rentes du Québec (QPP) - 5.45%
      rqap: salaireBrut * 0.00494,   // Régime québécois d'assurance parentale - 0.494%
      ae: salaireBrut * 0.0158,      // Assurance-emploi (EI) - 1.58%
      rqdc: salaireBrut * 0.00275,   // Régime québécois d'assurance parentale (RQDC) - 0.275%
      impots: salaireBrut * 0.15      // Impôts (estimé) - 15%
    };
    const totalCotisations = Object.values(cotisations).reduce((a, b) => a + b, 0);
    const salaireNet = salaireBrut - totalCotisations;

    // Vérifier si une fiche existe déjà
    const existing = await Payslip.findOne({ 
      employeId, 
      mois: parseInt(month), 
      annee: parseInt(year) 
    });
    if (existing) {
      return res.json(existing);
    }

    // Créer la fiche de paie
    const payslip = new Payslip({
      employeId,
      mois: parseInt(month),
      annee: parseInt(year),
      salaireBrut,
      cotisations,
      salaireNet,
      heuresNormales,
      heuresSupplementaires
    });

    const newPayslip = await payslip.save();
    res.status(201).json(newPayslip);
  } catch (error) {
    console.error("Erreur génération fiche de paie:", error);
    res.status(400).json({ message: error.message });
  }
});

// ============= CONTRATS =============

// GET tous les contrats (optionnel: filtrer par employé)
router.get("/contracts", async (req, res) => {
  try {
    const filter = req.query.employeeId ? { employeId: req.query.employeeId } : {};
    const contracts = await Contract.find(filter).populate("employeId");
    res.json(contracts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST créer un contrat
router.post("/contracts", async (req, res) => {
  try {
    const contract = new Contract(req.body);
    const newContract = await contract.save();
    res.status(201).json(newContract);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT modifier un contrat
router.put("/contracts/:id", async (req, res) => {
  try {
    const contract = await Contract.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!contract) {
      return res.status(404).json({ message: "Contrat non trouvé" });
    }
    res.json(contract);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ============= STATISTIQUES RH =============

// GET statistiques RH pour le dashboard
router.get("/stats", async (req, res) => {
  try {
    // Nombre total d'employés
    const totalEmployees = await Employee.countDocuments({ statut: "Actif" });
    
    // Nombre d'employés présents aujourd'hui (basé sur les feuilles de temps du mois courant)
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    const currentDay = String(today.getDate()).padStart(2, '0');
    const currentMonthStr = String(currentMonth).padStart(2, '0');
    const todayDateStr = `${currentYear}-${currentMonthStr}-${currentDay}`;
    
    const todayTimesheets = await Timesheet.find({
      mois: currentMonth,
      annee: currentYear
    }).populate("employeId");
    
    // Compter les employés qui ont une entrée pour aujourd'hui avec du travail
    const presentEmployeesSet = new Set();
    todayTimesheets.forEach(timesheet => {
      const dayEntry = timesheet.jours.find(j => {
        // Comparer les dates (format YYYY-MM-DD)
        const entryDate = j.date ? j.date.split('T')[0] : null;
        return entryDate === todayDateStr;
      });
      
      if (dayEntry && (dayEntry.heuresNormales > 0 || dayEntry.heuresSupplementaires > 0 || dayEntry.type === "Travail")) {
        if (timesheet.employeId && timesheet.employeId._id) {
          presentEmployeesSet.add(String(timesheet.employeId._id));
        }
      }
    });
    
    const presentEmployees = presentEmployeesSet.size;
    
    // Nombre total de congés (en attente + approuvés)
    const totalLeaves = await Leave.countDocuments({
      statut: { $in: ["En attente", "Approuvé"] }
    });
    
    // Nombre de congés en attente
    const pendingLeaves = await Leave.countDocuments({ statut: "En attente" });
    
    // Nombre d'offres d'emploi actives
    const activeJobOffers = await JobOffer.countDocuments({ statut: "Actif" });
    
    // Nombre total de candidatures
    const totalApplications = await Application.countDocuments();
    
    // Candidatures récentes (dernières 7 jours)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentApplications = await Application.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });
    
    // Derniers employés ajoutés
    const recentEmployees = await Employee.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("nom prenom poste dateEmbauche photo");
    
    // Dernières candidatures
    const latestApplications = await Application.find()
      .populate("offreId", "titre")
      .sort({ createdAt: -1 })
      .limit(5)
      .select("nom prenom email offreId statut datePostulation");
    
    // Congés en attente
    const pendingLeavesList = await Leave.find({ statut: "En attente" })
      .populate("employeId", "nom prenom")
      .sort({ createdAt: -1 })
      .limit(5)
      .select("employeId type dateDebut dateFin motif");
    
    // Répartition des employés par service
    const employeesByService = await Employee.aggregate([
      { $match: { statut: "Actif" } },
      { $group: { _id: "$service", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Répartition des congés par type
    const leavesByType = await Leave.aggregate([
      { $match: { statut: { $in: ["En attente", "Approuvé"] } } },
      { $group: { _id: "$type", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      totalEmployees,
      presentEmployees,
      totalLeaves,
      pendingLeaves,
      activeJobOffers,
      totalApplications,
      recentApplications,
      recentEmployees,
      latestApplications,
      pendingLeavesList,
      employeesByService,
      leavesByType
    });
  } catch (error) {
    console.error("Erreur récupération stats RH:", error);
    res.status(500).json({ message: error.message });
  }
});

// ============= CONGÉS =============

// GET tous les congés (optionnel: filtrer par employé)
router.get("/leaves", async (req, res) => {
  try {
    const filter = req.query.employeeId ? { employeId: req.query.employeeId } : {};
    const leaves = await Leave.find(filter).populate("employeId");
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST demander un congé
router.post("/leaves", async (req, res) => {
  try {
    const leave = new Leave(req.body);
    const newLeave = await leave.save();
    res.status(201).json(newLeave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT modifier le statut d'un congé
router.put("/leaves/:id", async (req, res) => {
  try {
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!leave) {
      return res.status(404).json({ message: "Congé non trouvé" });
    }
    res.json(leave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
