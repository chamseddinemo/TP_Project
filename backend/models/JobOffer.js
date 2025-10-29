const mongoose = require("mongoose");

const jobOfferSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  departement: String,
  typeContrat: {
    type: String,
    enum: ["CDI", "CDD", "Stage", "Freelance"],
    default: "CDI"
  },
  salaire: Number,
  dateLimite: Date,
  description: String,
  competences: String,
  statut: {
    type: String,
    enum: ["Actif", "Fermé", "Brouillon"],
    default: "Actif"
  }
}, { timestamps: true });

module.exports = mongoose.model("JobOffer", jobOfferSchema);

