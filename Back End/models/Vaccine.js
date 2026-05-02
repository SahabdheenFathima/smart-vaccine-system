const mongoose = require("mongoose");

const vaccineSchema = new mongoose.Schema({
  babyName: String,
  email: String,
  vaccineName: String,
  ageLabel: { type: String, default: '' },
  description: { type: String, default: '' },
  scheduleRuleId: { type: mongoose.Schema.Types.ObjectId, ref: 'VaccineScheduleRule', default: null },
  scheduleDate: Date,
  status: { type: String, enum: ['Pending', 'Completed', 'Missed'], default: 'Pending' },
  softReminderSent: { type: Boolean, default: false },
  urgentReminderSent: { type: Boolean, default: false },
  missedReminderSent: { type: Boolean, default: false },
  got: { type: Boolean, default: false },
  babyId: { type: mongoose.Schema.Types.ObjectId, ref: "Baby" },
}, { timestamps: true });

module.exports = mongoose.model("Vaccine", vaccineSchema);
