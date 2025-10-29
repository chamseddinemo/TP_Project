const mongoose = require("mongoose");

const timesheetSchema = new mongoose.Schema({
  employeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  mois: { type: Number, required: true, min: 1, max: 12 },
  annee: { type: Number, required: true },
  jours: [{
    date: { type: String, required: true },
    heuresNormales: { type: Number, default: 0 },
    heuresSupplementaires: { type: Number, default: 0 },
    type: {
      type: String,
      enum: ["Travail", "Congé", "RTT", "Absence", "Maladie"],
      default: "Travail"
    },
    note: String
  }]
}, { timestamps: true });

module.exports = mongoose.model("Timesheet", timesheetSchema);

