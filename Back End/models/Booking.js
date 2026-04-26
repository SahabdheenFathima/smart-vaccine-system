const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  parent_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  child_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Baby', required: true },
  consultant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Consultant', required: true },
  booking_date: { type: Date, required: true },
  booking_time: { type: String, required: true },
  token_no: { type: String, required: true },
  reason: { type: String, required: true },
  priority_level: { type: String, enum: ['Normal', 'Urgent'], default: 'Normal' },
  status: { type: String, enum: ['Pending', 'Approved', 'Completed', 'Rejected', 'Cancelled'], default: 'Pending' },
  rejection_reason: { type: String },
  created_at: { type: Date, default: Date.now },
});

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
