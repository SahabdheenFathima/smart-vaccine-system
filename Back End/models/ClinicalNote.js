const mongoose = require("mongoose");

const clinicalNoteSchema = new mongoose.Schema({
  childId: { type: mongoose.Schema.Types.ObjectId, ref: 'Baby', required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  consultantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Consultant', required: true },
  
  // SOAP Structure
  subjective: { type: String, default: '' },
  objective: {
    weight: String,
    height: String,
    temperature: String,
    pulse: String,
    oxygenSaturation: String,
    additionalNotes: String
  },
  assessment: { type: String, default: '' },
  plan: {
    medicines: [String],
    labTests: [String],
    advice: String,
    followUpDate: Date
  },
  
  tags: [{ type: String }],
  visibility: { type: String, enum: ['internal', 'shared_parent', 'summary_parent'], default: 'summary_parent' },
  parentViewed: { type: Boolean, default: false },
  status: { type: String, enum: ['Draft', 'Final'], default: 'Draft' }
}, {
  timestamps: true
});

module.exports = mongoose.model("ClinicalNote", clinicalNoteSchema);
