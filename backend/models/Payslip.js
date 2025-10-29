const mongoose = require("mongoose");

const payslipSchema = new mongoose.Schema({
  employeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  mois: { type: Number, required: true, min: 1, max: 12 },
  annee: { type: Number, required: true },
  salaireBrut: { type: Number, required: true },
  cotisations: {
    cnss: Number,
    retraite: Number,
    cnam: Number
  },
  salaireNet: { type: Number, required: true },
  heuresNormales: Number,
  heuresSupplementaires: Number,
  primes: Number,
  deductions: Number
}, { timestamps: true });

module.exports = mongoose.model("Payslip", payslipSchema);

