const express = require("express");
const router = express.Router();
const Consultant = require("../models/Consultant");

// Get all consultants
router.get("/", async (req, res) => {
  try {
    const consultants = await Consultant.find();
    res.json({ status: "ok", data: consultants });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

// Get consultant by ID
router.get("/:id", async (req, res) => {
  try {
    const consultant = await Consultant.findById(req.params.id);
    if (!consultant) return res.status(404).json({ status: "error", error: "Consultant not found" });
    res.json({ status: "ok", data: consultant });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

// Create a consultant
router.post("/", async (req, res) => {
  try {
    const newConsultant = new Consultant(req.body);
    await newConsultant.save();
    res.status(201).json({ status: "ok", data: newConsultant });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

// Update a consultant
router.put("/:id", async (req, res) => {
  try {
    const updatedConsultant = await Consultant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ status: "ok", data: updatedConsultant });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

// Delete a consultant
router.delete("/:id", async (req, res) => {
  try {
    await Consultant.findByIdAndDelete(req.params.id);
    res.json({ status: "ok", message: "Consultant deleted successfully" });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

module.exports = router;
