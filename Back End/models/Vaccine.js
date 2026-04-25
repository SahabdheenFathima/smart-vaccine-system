const mongoose = require("mongoose");

const vaccineSchema = new mongoose.Schema({
  babyName: String,
  email: String,
  vaccineName: String,
  scheduleDate: Date,
  sent: { type: Boolean, default: false },
  babyId: { type: mongoose.Schema.Types.ObjectId, ref: "Baby" }, // Optional, for reference
});

module.exports = mongoose.model("Vaccine", vaccineSchema);
