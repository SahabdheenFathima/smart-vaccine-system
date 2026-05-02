// routes/VaccineRoutes.js
const express = require("express");
const router = express.Router();
const Vaccine = require("../models/Vaccine");

// GET all vaccines (Admin Registry) with baby population
router.get("/", async (_req, res) => {
  try {
    const vaccines = await Vaccine.find()
      .populate('babyId', 'babyName birthDate gender')
      .sort({ scheduleDate: 1 });
    res.json({ status: "ok", data: vaccines });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

// Get vaccines for a specific baby (Parent View)
router.get("/baby/:babyId", async (req, res) => {
  try {
    const vaccines = await Vaccine.find({ babyId: req.params.babyId }).sort({ scheduleDate: 1 });
    res.json({ status: "ok", data: vaccines });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

// Update vaccine status (Admin Registry — Pending / Completed / Missed)
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Pending', 'Completed', 'Missed'].includes(status)) {
      return res.status(400).json({ status: "error", error: "Invalid status value." });
    }
    const vaccine = await Vaccine.findByIdAndUpdate(
      req.params.id,
      { status, got: status === 'Completed' },
      { new: true }
    );
    if (!vaccine) return res.status(404).json({ status: "error", error: "Vaccine not found" });
    res.json({ status: "ok", data: vaccine });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

// Legacy: Update vaccine 'got' status
router.put("/:id", async (req, res) => {
  try {
    const { got } = req.body;
    const vaccine = await Vaccine.findByIdAndUpdate(
      req.params.id,
      { got, status: got ? 'Completed' : 'Pending' },
      { new: true }
    );
    if (!vaccine) return res.status(404).json({ status: "error", error: "Vaccine not found" });
    res.json({ status: "ok", data: vaccine });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

module.exports = router;
