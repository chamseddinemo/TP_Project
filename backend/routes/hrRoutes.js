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
    
    // Récupérer l'employé
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employé non trouvé" });
    }

    // Récupérer la feuille de temps du mois
    const timesheet = await Timesheet.findOne({
      employeId,
      mois: month,
      annee: year
    });

    let heuresNormales = 0;
    let heuresSupplementaires = 0;

    if (timesheet) {
      timesheet.jours.forEach(jour => {
        heuresNormales += jour.heuresNormales || 0;
        heuresSupplementaires += jour.heuresSupplementaires || 0;
      });
    }

    // Calculer le salaire
    const salaireBrut = employee.salaire || 0;
    const cotisations = {
      cnss: salaireBrut * 0.094,
      retraite: salaireBrut * 0.02,
      cnam: salaireBrut * 0.01
    };
    const totalCotisations = Object.values(cotisations).reduce((a, b) => a + b, 0);
    const salaireNet = salaireBrut - totalCotisations;

    // Vérifier si une fiche existe déjà
    const existing = await Payslip.findOne({ employeId, mois: month, annee: year });
    if (existing) {
      return res.json(existing);
    }

    // Créer la fiche de paie
    const payslip = new Payslip({
      employeId,
      mois: month,
      annee: year,
      salaireBrut,
      cotisations,
      salaireNet,
      heuresNormales,
      heuresSupplementaires
    });

    const newPayslip = await payslip.save();
    res.status(201).json(newPayslip);
  } catch (error) {
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
