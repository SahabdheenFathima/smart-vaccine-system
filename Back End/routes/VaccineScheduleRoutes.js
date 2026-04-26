/**
 * VaccineScheduleRoutes.js
 * Full CRUD API for the dynamic Vaccine Schedule Management System.
 * Replaces vaccineSchedule.js + vaccineGenerator.js static dependency.
 */
const express = require("express");
const router  = express.Router();
const VaccineScheduleRule = require("../models/VaccineScheduleRule");

// ─────────────────────────────────────────────────────────────
//  SEED DATA – mirrors the original vaccineSchedule.js exactly
// ─────────────────────────────────────────────────────────────
const SEED_SCHEDULES = [
  { vaccineName: "BCG",                                         vaccineCode: "BCG",   daysAfterBirth: 0,    doseOrder: 1, recommendedAgeLabel: "At Birth",   priorityLevel: "Critical" },
  { vaccineName: "Oral Polio-1",                                vaccineCode: "OPV1",  daysAfterBirth: 63,   doseOrder: 1, recommendedAgeLabel: "2 Months",   priorityLevel: "High" },
  { vaccineName: "Pentavalent 1",                               vaccineCode: "PENT1", daysAfterBirth: 60,   doseOrder: 1, recommendedAgeLabel: "2 Months",   priorityLevel: "High" },
  { vaccineName: "Polio-2",                                     vaccineCode: "IPV2",  daysAfterBirth: 120,  doseOrder: 2, recommendedAgeLabel: "4 Months",   priorityLevel: "High" },
  { vaccineName: "Oral Pentavalent 2",                          vaccineCode: "OPV2",  daysAfterBirth: 120,  doseOrder: 2, recommendedAgeLabel: "4 Months",   priorityLevel: "High" },
  { vaccineName: "Injectable Polio",                            vaccineCode: "IPV",   daysAfterBirth: 120,  doseOrder: 1, recommendedAgeLabel: "4 Months",   priorityLevel: "High" },
  { vaccineName: "Oral Polio-3",                                vaccineCode: "OPV3",  daysAfterBirth: 135,  doseOrder: 3, recommendedAgeLabel: "4.5 Months", priorityLevel: "High" },
  { vaccineName: "Pentavalent 3",                               vaccineCode: "PENT3", daysAfterBirth: 180,  doseOrder: 3, recommendedAgeLabel: "6 Months",   priorityLevel: "High" },
  { vaccineName: "MMR (Measles, Mumps, Rubella)",               vaccineCode: "MMR1",  daysAfterBirth: 270,  doseOrder: 1, recommendedAgeLabel: "9 Months",   priorityLevel: "High" },
  { vaccineName: "Japanese Encephalitis",                       vaccineCode: "JE",    daysAfterBirth: 365,  doseOrder: 1, recommendedAgeLabel: "12 Months",  priorityLevel: "Medium" },
  { vaccineName: "Oral Polio-4",                                vaccineCode: "OPV4",  daysAfterBirth: 548,  doseOrder: 4, recommendedAgeLabel: "18 Months",  priorityLevel: "High" },
  { vaccineName: "DPT (Diphtheria, Pertussis, Tetanus)",        vaccineCode: "DPT",   daysAfterBirth: 548,  doseOrder: 1, recommendedAgeLabel: "18 Months",  priorityLevel: "High" },
  { vaccineName: "MMR 2 (Measles, Mumps, Rubella - 2nd dose)", vaccineCode: "MMR2",  daysAfterBirth: 1095, doseOrder: 2, recommendedAgeLabel: "3 Years",    priorityLevel: "High" },
  { vaccineName: "Oral Polio-5",                                vaccineCode: "OPV5",  daysAfterBirth: 1825, doseOrder: 5, recommendedAgeLabel: "5 Years",    priorityLevel: "Medium" },
  { vaccineName: "DT (Diphtheria, Tetanus)",                    vaccineCode: "DT",    daysAfterBirth: 1825, doseOrder: 1, recommendedAgeLabel: "5 Years",    priorityLevel: "Medium" },
  { vaccineName: "DT for Adults (Diphtheria, Tetanus)",         vaccineCode: "DTA",   daysAfterBirth: 4015, doseOrder: 2, recommendedAgeLabel: "11 Years",   priorityLevel: "Medium" },
];

/**
 * Seed the collection on boot if empty.
 * This runs once and never again (idempotent via upsert).
 */
const seedIfEmpty = async () => {
  const count = await VaccineScheduleRule.countDocuments();
  if (count === 0) {
    await VaccineScheduleRule.insertMany(SEED_SCHEDULES);
    console.log("✅ VaccineScheduleRule collection seeded with", SEED_SCHEDULES.length, "entries.");
  }
};

// Export seed function so index.js can call it after DB connects
router.seed = seedIfEmpty;

// ─────────────────────────────────────────────────────────────
//  GET /api/vaccine-schedules
//  Returns all rules (Active by default, pass ?status=all for everything)
// ─────────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const filter = req.query.status === "all" ? {} : { status: "Active" };
    const schedules = await VaccineScheduleRule.find(filter).sort({ daysAfterBirth: 1 });
    res.json({ status: "ok", data: schedules });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
//  GET /api/vaccine-schedules/:id
// ─────────────────────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const rule = await VaccineScheduleRule.findById(req.params.id);
    if (!rule) return res.status(404).json({ status: "error", error: "Not found" });
    res.json({ status: "ok", data: rule });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
//  POST /api/vaccine-schedules
//  Create a new schedule rule
// ─────────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { vaccineName, vaccineCode, daysAfterBirth, weeksAfterBirth,
            monthsAfterBirth, yearsAfterBirth, doseOrder,
            recommendedAgeLabel, priorityLevel, status, notes } = req.body;

    // At least one scheduling rule must be present
    if (
      daysAfterBirth == null && weeksAfterBirth == null &&
      monthsAfterBirth == null && yearsAfterBirth == null
    ) {
      return res.status(400).json({ status: "error", error: "At least one scheduling rule is required." });
    }

    const rule = new VaccineScheduleRule({
      vaccineName, vaccineCode, daysAfterBirth, weeksAfterBirth,
      monthsAfterBirth, yearsAfterBirth, doseOrder,
      recommendedAgeLabel, priorityLevel, status, notes
    });
    await rule.save();
    res.status(201).json({ status: "ok", data: rule });
  } catch (err) {
    if (err.code === 11000) {
      const key = Object.keys(err.keyPattern)[0];
      return res.status(400).json({ status: "error", error: `A vaccine with this ${key} already exists.` });
    }
    res.status(500).json({ status: "error", error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
//  PUT /api/vaccine-schedules/:id
//  Update an existing rule
// ─────────────────────────────────────────────────────────────
router.put("/:id", async (req, res) => {
  try {
    const updated = await VaccineScheduleRule.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ status: "error", error: "Schedule rule not found." });
    res.json({ status: "ok", data: updated });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
//  DELETE /api/vaccine-schedules/:id
//  Hard delete — should only be used for rules never used in child records
// ─────────────────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await VaccineScheduleRule.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ status: "error", error: "Schedule rule not found." });
    res.json({ status: "ok", message: "Schedule rule permanently deleted." });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
//  POST /api/vaccine-schedules/:id/toggle-status
//  Safe disable/enable — preferred over hard delete for deployed rules
// ─────────────────────────────────────────────────────────────
router.post("/:id/toggle-status", async (req, res) => {
  try {
    const rule = await VaccineScheduleRule.findById(req.params.id);
    if (!rule) return res.status(404).json({ status: "error", error: "Not found." });
    rule.status = rule.status === "Active" ? "Inactive" : "Active";
    await rule.save();
    res.json({ status: "ok", data: rule });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
//  GET /api/vaccine-schedules/calculate/:birthDate
//  Schedule Calculation Engine — core of the dynamic system
//  Returns child-specific vaccination timeline from DB rules
// ─────────────────────────────────────────────────────────────
router.get("/calculate/:birthDate", async (req, res) => {
  try {
    const birthDate = new Date(req.params.birthDate);
    if (isNaN(birthDate.getTime())) {
      return res.status(400).json({ status: "error", error: "Invalid birth date." });
    }

    const rules = await VaccineScheduleRule.find({ status: "Active" }).sort({ daysAfterBirth: 1 });

    const timeline = rules.map(rule => {
      // Resolve canonical days from whichever field is set
      let days = 0;
      if (rule.daysAfterBirth   != null) days = rule.daysAfterBirth;
      else if (rule.weeksAfterBirth  != null) days = Math.round(rule.weeksAfterBirth  * 7);
      else if (rule.monthsAfterBirth != null) days = Math.round(rule.monthsAfterBirth * 30.4375);
      else if (rule.yearsAfterBirth  != null) days = Math.round(rule.yearsAfterBirth  * 365.25);

      const dueDate = new Date(birthDate);
      dueDate.setDate(dueDate.getDate() + days);

      return {
        vaccineCode:          rule.vaccineCode,
        vaccineName:          rule.vaccineName,
        doseOrder:            rule.doseOrder,
        recommendedAgeLabel:  rule.recommendedAgeLabel,
        priorityLevel:        rule.priorityLevel,
        scheduledDate:        dueDate,
      };
    });

    res.json({ status: "ok", data: timeline });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

module.exports = router;
