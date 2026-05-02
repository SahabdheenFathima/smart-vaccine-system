const mongoose = require('mongoose');

const MilestoneSchema = new mongoose.Schema({
  babyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Baby', 
    required: true 
  },
  stageIndex: { 
    type: Number, 
    required: true 
  },
  taskIndex: { 
    type: Number, 
    required: true 
  },
  response: { 
    type: String, 
    enum: ['YES', 'NO'], 
    required: true 
  }
}, { 
  timestamps: true 
});

// Ensure only one response per task per child
MilestoneSchema.index({ babyId: 1, stageIndex: 1, taskIndex: 1 }, { unique: true });

module.exports = mongoose.model('Milestone', MilestoneSchema);
