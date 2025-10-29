const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema({
  employeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  type: {
    type: String,
    enum: ["Congé annuel", "Congé maladie", "RTT", "Congé sans solde", "Autre"],
    required: true
  },
  dateDebut: { type: Date, required: true },
  dateFin: { type: Date, required: true },
  motif: String,
  statut: {
    type: String,
    enum: ["En attente", "Approuvé", "Refusé"],
    default: "En attente"
  }
}, { timestamps: true });

module.exports = mongoose.model("Leave", leaveSchema);

