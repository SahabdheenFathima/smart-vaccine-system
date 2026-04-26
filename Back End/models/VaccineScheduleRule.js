const mongoose = require("mongoose");

/**
 * VaccineScheduleRule — Production schema replacing vaccineSchedule.js
 * Admins manage this collection via the Admin Dashboard.
 * The schedule calculation engine reads ONLY from this collection.
 */
const vaccineScheduleRuleSchema = new mongoose.Schema({
  // Core identity
  vaccineName:   { type: String, required: true, unique: true, trim: true },
  vaccineCode:   { type: String, required: true, unique: true, trim: true, uppercase: true },

  // Scheduling rule — ONE of these must be set (daysAfterBirth is canonical)
  daysAfterBirth:   { type: Number, default: null },
  weeksAfterBirth:  { type: Number, default: null },
  monthsAfterBirth: { type: Number, default: null },
  yearsAfterBirth:  { type: Number, default: null },

  // Metadata
  doseOrder:          { type: Number, default: 1 },             // 1st, 2nd, booster…
  recommendedAgeLabel: { type: String, default: '' },           // "2 months", "5 years"
  priorityLevel:      { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  status:             { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  notes:              { type: String, default: '' },
}, { timestamps: true });

/**
 * Virtual helper: canonical days derived from whichever field is set.
 * Priority: daysAfterBirth → weeksAfterBirth → monthsAfterBirth → yearsAfterBirth
 */
vaccineScheduleRuleSchema.virtual('canonicalDays').get(function () {
  if (this.daysAfterBirth   != null) return this.daysAfterBirth;
  if (this.weeksAfterBirth  != null) return Math.round(this.weeksAfterBirth * 7);
  if (this.monthsAfterBirth != null) return Math.round(this.monthsAfterBirth * 30.4375);
  if (this.yearsAfterBirth  != null) return Math.round(this.yearsAfterBirth * 365.25);
  return 0;
});

vaccineScheduleRuleSchema.set('toJSON', { virtuals: true });
vaccineScheduleRuleSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("VaccineScheduleRule", vaccineScheduleRuleSchema);
