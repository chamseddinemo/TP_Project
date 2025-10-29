const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  offreId: { type: mongoose.Schema.Types.ObjectId, ref: "JobOffer" },
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { type: String, required: true },
  telephone: String,
  cv: String,
  lettreMotivation: String,
  datePostulation: { type: Date, default: Date.now },
  statut: {
    type: String,
    enum: ["Nouveau", "En cours", "Accepté", "Refusé"],
    default: "Nouveau"
  },
  note: { type: Number, min: 0, max: 5 }
}, { timestamps: true });

module.exports = mongoose.model("Application", applicationSchema);

