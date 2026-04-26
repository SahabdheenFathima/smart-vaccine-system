const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const Consultant = require("../models/Consultant");

// Helper to generate queue token
const generateToken = async (department) => {
  const prefix = department.charAt(0).toUpperCase(); // e.g., P for Pediatrician
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const count = await Booking.countDocuments({
    created_at: { $gte: today },
  });

  return `${prefix}-${(count + 1).toString().padStart(3, '0')}`;
};

// Get all bookings (admin view)
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('parent_id', 'fname email')
      .populate('child_id', 'babyName birthDate')
      .populate('consultant_id', 'name department specialization')
      .sort({ created_at: -1 });
    res.json({ status: "ok", data: bookings });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

// Get bookings by parent ID
router.get("/parent/:parentId", async (req, res) => {
  try {
    const bookings = await Booking.find({ parent_id: req.params.parentId })
      .populate('child_id', 'babyName')
      .populate('consultant_id', 'name department specialization hospital_name')
      .sort({ booking_date: 1 });
    res.json({ status: "ok", data: bookings });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

// Create a booking
router.post("/", async (req, res) => {
  try {
    const { consultant_id } = req.body;
    const consultant = await Consultant.findById(consultant_id);
    if (!consultant) return res.status(404).json({ status: "error", error: "Consultant not found" });

    const token_no = await generateToken(consultant.department);
    const newBooking = new Booking({
      ...req.body,
      token_no
    });

    await newBooking.save();
    res.status(201).json({ status: "ok", data: newBooking });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

// Update booking status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status, rejection_reason } = req.body;
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status, rejection_reason },
      { new: true }
    );
    res.json({ status: "ok", data: updatedBooking });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

module.exports = router;
