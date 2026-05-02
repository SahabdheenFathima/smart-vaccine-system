/**
 * vaccineGenerator.js  —  DYNAMIC VERSION
 * Replaces the old static vaccineSchedule.js dependency.
 * Reads Active schedule rules from the database at call-time.
 */
const VaccineScheduleRule = require("./models/VaccineScheduleRule");

/**
 * Resolves the canonical number of days for a schedule rule.
 * Priority: daysAfterBirth > weeksAfterBirth > monthsAfterBirth > yearsAfterBirth
 */
const resolveCanonicalDays = (rule) => {
  if (rule.daysAfterBirth   != null) return rule.daysAfterBirth;
  if (rule.weeksAfterBirth  != null) return Math.round(rule.weeksAfterBirth  * 7);
  if (rule.monthsAfterBirth != null) return Math.round(rule.monthsAfterBirth * 30.4375);
  if (rule.yearsAfterBirth  != null) return Math.round(rule.yearsAfterBirth  * 365.25);
  return 0;
};

/**
 * generateVaccines — async, DB-driven
 * @param {Date}   birthDate - Baby's date of birth
 * @param {string} babyName  - Baby's name
 * @param {string} email     - Parent email
 * @returns {Promise<Array>} - Array of Vaccine documents ready for insertMany
 */
const generateVaccines = async (birthDate, babyName, email) => {
  const rules = await VaccineScheduleRule.find({ status: "Active" }).sort({ daysAfterBirth: 1 });

  return rules.map((rule) => {
    const days = resolveCanonicalDays(rule);
    const vaccineDate = new Date(birthDate);
    vaccineDate.setDate(vaccineDate.getDate() + days);

    return {
      babyName:     babyName || "Unknown Baby",
      email:        email    || "No Email",
      vaccineName:  rule.vaccineName,
      scheduleDate: vaccineDate,
    };
  });
};

module.exports = generateVaccines;
