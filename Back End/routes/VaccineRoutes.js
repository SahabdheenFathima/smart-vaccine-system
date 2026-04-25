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

// Get vaccines for a specific baby
router.get("/baby/:babyId", async (req, res) => {
  try {
    const vaccines = await Vaccine.find({ babyId: req.params.babyId }).sort({ scheduleDate: 1 });
    res.json({ status: "ok", data: vaccines });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

// Update vaccine 'got' status
router.put("/:id", async (req, res) => {
  try {
    const { got } = req.body;
    const vaccine = await Vaccine.findByIdAndUpdate(
      req.params.id,
      { got },
      { new: true }
    );
    if (!vaccine) {
      return res.status(404).json({ status: "error", error: "Vaccine not found" });
    }
    res.json({ status: "ok", data: vaccine });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

module.exports = router;
