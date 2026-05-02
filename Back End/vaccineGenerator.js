/**
 * vaccineGenerator.js  —  DYNAMIC VERSION
 * Replaces the old static vaccineSchedule.js dependency.
 * Reads Active schedule rules from the database at call-time.
 */
const VaccineScheduleRule = require("./models/VaccineScheduleRule");

const resolveCanonicalDays = (rule) => {
  if (rule.daysAfterBirth   != null) return rule.daysAfterBirth;
  if (rule.weeksAfterBirth  != null) return Math.round(rule.weeksAfterBirth  * 7);
  if (rule.monthsAfterBirth != null) return Math.round(rule.monthsAfterBirth * 30.4375);
  if (rule.yearsAfterBirth  != null) return Math.round(rule.yearsAfterBirth  * 365.25);
  return 0;
};

const generateVaccines = async (birthDate, babyName, email, babyId) => {
  const rules = await VaccineScheduleRule.find({ status: "Active" }).sort({ daysAfterBirth: 1 });

  return rules.map((rule) => {
    const days = resolveCanonicalDays(rule);
    const vaccineDate = new Date(birthDate);
    vaccineDate.setDate(vaccineDate.getDate() + days);

    return {
      babyName:        babyName || "Unknown Baby",
      email:           email    || "No Email",
      babyId:          babyId   || null,
      vaccineName:     rule.vaccineName,
      ageLabel:        rule.recommendedAgeLabel || '',
      description:     rule.description || '',
      scheduleRuleId:  rule._id,
      scheduleDate:    vaccineDate,
      status:          'Pending',
      got:             false,
    };
  });
};

module.exports = generateVaccines;
