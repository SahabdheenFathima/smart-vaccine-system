const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['System Announcement', 'Vaccine Alert', 'Urgent Alert'], default: 'System Announcement' },
  audience: { type: String, enum: ['All Parents', 'Specific Parent'], default: 'All Parents' },
  targetEmail: { type: String }, // If specific parent
  status: { type: String, enum: ['Sent', 'Scheduled', 'Failed'], default: 'Sent' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Notification", notificationSchema);
