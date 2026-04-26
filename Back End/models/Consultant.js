const mongoose = require("mongoose");

const consultantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  registration_no: { type: String, required: true, unique: true },
  specialization: { type: String, required: true },
  qualification: { type: String, required: true },
  experience: { type: Number, required: true },
  hospital_name: { type: String, required: true },
  department: { type: String, required: true },
  available_days: { type: [String], required: true },
  available_slots: { type: [String], required: true },
  status: { type: String, enum: ['Active', 'On Leave', 'Inactive'], default: 'Active' },
  profile_image: { type: String },
});

const Consultant = mongoose.model("Consultant", consultantSchema);
module.exports = Consultant;
