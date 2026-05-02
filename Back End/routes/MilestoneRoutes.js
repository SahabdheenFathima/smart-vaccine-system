const express = require('express');
const router = express.Router();
const Milestone = require('../models/Milestone');
const Baby = require('../babyDetails');

// POST: Save or update a milestone response (Upsert)
router.post('/', async (req, res) => {
  try {
    const { babyId, stageIndex, taskIndex, response } = req.body;
    
    if (!babyId || stageIndex === undefined || taskIndex === undefined || !response) {
      return res.status(400).json({ status: 'error', error: 'Missing required fields' });
    }

    // Find and update if exists, otherwise create new
    const milestone = await Milestone.findOneAndUpdate(
      { babyId, stageIndex, taskIndex },
      { response },
      { new: true, upsert: true }
    );
    
    res.json({ status: 'ok', data: milestone });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// GET: Fetch all milestone responses for a specific child (Parent View)
router.get('/baby/:babyId', async (req, res) => {
  try {
    const milestones = await Milestone.find({ babyId: req.params.babyId });
    res.json({ status: 'ok', data: milestones });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// GET: Fetch all milestones for Admin Dashboard
router.get('/admin/all', async (req, res) => {
  try {
    // Populate baby details to show names and calculate age on frontend
    const milestones = await Milestone.find().populate('babyId', 'babyName birthDate email').sort({ updatedAt: -1 });
    res.json({ status: 'ok', data: milestones });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

module.exports = router;
