const mongoose = require("mongoose");

const contractSchema = new mongoose.Schema({
  employeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  typeContrat: {
    type: String,
    enum: ["CDI", "CDD", "Stage", "Freelance"],
    required: true
  },
  dateDebut: { type: Date, required: true },
  dateFin: Date,
  salaire: Number,
  poste: String,
  statut: {
    type: String,
    enum: ["Actif", "Terminé", "Suspendu"],
    default: "Actif"
  },
  document: String
}, { timestamps: true });

module.exports = mongoose.model("Contract", contractSchema);

