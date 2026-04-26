const express = require("express");
const router = express.Router();
const ClinicalNote = require("../models/ClinicalNote");
const Booking = require("../models/Booking");

// Get notes by childId
router.get("/:childId", async (req, res) => {
  try {
    const notes = await ClinicalNote.find({ childId: req.params.childId })
      .populate('consultantId', 'name specialization')
      .sort({ createdAt: -1 });
    res.json({ status: "ok", data: notes });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

// Create a clinical note
router.post("/", async (req, res) => {
  try {
    const note = new ClinicalNote(req.body);
    await note.save();

    // If final, update booking status to Completed
    if (note.status === 'Final' && note.appointmentId) {
      await Booking.findByIdAndUpdate(note.appointmentId, { status: 'Completed' });
    }

    res.status(201).json({ status: "ok", data: note });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

// Update a clinical note
router.put("/:id", async (req, res) => {
  try {
    const updatedNote = await ClinicalNote.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    // If updated to final, update booking status to Completed
    if (updatedNote.status === 'Final' && updatedNote.appointmentId) {
      await Booking.findByIdAndUpdate(updatedNote.appointmentId, { status: 'Completed' });
    }

    res.json({ status: "ok", data: updatedNote });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

// Parent specific get
router.get("/parent/:childId", async (req, res) => {
  try {
    const notes = await ClinicalNote.find({ 
      childId: req.params.childId,
      status: 'Final',
      visibility: { $in: ['shared_parent', 'summary_parent'] }
    })
    .populate('consultantId', 'name specialization hospital_name')
    .sort({ createdAt: -1 });

    // Filter fields if summary_parent
    const mappedNotes = notes.map(note => {
      if (note.visibility === 'summary_parent') {
        const { subjective, objective, ...rest } = note.toObject();
        return rest;
      }
      return note;
    });

    res.json({ status: "ok", data: mappedNotes });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

// Mark as viewed by parent
router.put("/:id/viewed", async (req, res) => {
  try {
    const updatedNote = await ClinicalNote.findByIdAndUpdate(
      req.params.id, 
      { parentViewed: true }, 
      { new: true }
    );
    res.json({ status: "ok", data: updatedNote });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

module.exports = router;
