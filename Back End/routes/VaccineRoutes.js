// routes/VaccineRoutes.js
const express = require("express");
const router = express.Router();
const Vaccine = require("../models/Vaccine");

// Get all vaccine reminders
router.get("/", async (_req, res) => {
  try {
    const vaccines = await Vaccine.find();
    res.json(vaccines);
  } catch (err) {
    res.status(500).json({ message: "Error fetching vaccines", error: err });
  }
});

module.exports = router;
