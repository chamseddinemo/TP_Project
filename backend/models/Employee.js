const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  telephone: String,
  poste: { type: String, required: true },
  service: String,
  salaire: Number,
  dateEmbauche: { type: Date, default: Date.now },
  photo: String,
  adresse: String,
  cin: String,
  numeroSecuriteSociale: String,
  situationFamiliale: {
    type: String,
    enum: ["Célibataire", "Marié(e)", "Divorcé(e)", "Veuf(ve)"],
    default: "Célibataire"
  },
  nombreEnfants: { type: Number, default: 0 },
  statut: {
    type: String,
    enum: ["Actif", "Inactif", "Congé", "Démission"],
    default: "Actif"
  }
}, { timestamps: true });

module.exports = mongoose.model("Employee", employeeSchema);
