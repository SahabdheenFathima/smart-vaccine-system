const mongoose = require("mongoose");

const vaccineSchema = new mongoose.Schema({
  babyName: String,
  email: String,
  vaccineName: String,
  scheduleDate: Date,
  softReminderSent: { type: Boolean, default: false },
  urgentReminderSent: { type: Boolean, default: false },
  missedReminderSent: { type: Boolean, default: false },
  got: { type: Boolean, default: false }, // Track if vaccine is administered
  babyId: { type: mongoose.Schema.Types.ObjectId, ref: "Baby" }, // Optional, for reference
});

module.exports = mongoose.model("Vaccine", vaccineSchema);
