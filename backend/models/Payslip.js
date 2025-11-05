const mongoose = require("mongoose");

const payslipSchema = new mongoose.Schema({
  employeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  mois: { type: Number, required: true, min: 1, max: 12 },
  annee: { type: Number, required: true },
  salaireBrut: { type: Number, required: true },
  cotisations: {
    qpp: Number,        // Régime de rentes du Québec (QPP)
    rqap: Number,       // Régime québécois d'assurance parentale
    ae: Number,         // Assurance-emploi (EI)
    rqdc: Number,       // Régime québécois d'assurance parentale (RQDC)
    impots: Number      // Impôts provinciaux et fédéraux
  },
  salaireNet: { type: Number, required: true },
  heuresNormales: Number,
  heuresSupplementaires: Number,
  primes: Number,
  deductions: Number
}, { timestamps: true });

module.exports = mongoose.model("Payslip", payslipSchema);

