const mongoose = require('mongoose');
const Baby = require('./babyDetails');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const baby = await Baby.findOne({ babyName: /saji/i });
    console.log("Baby details:", baby);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
