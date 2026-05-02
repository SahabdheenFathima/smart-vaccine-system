const mongoose = require("mongoose");
require('dotenv').config();

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const Notification = require("./models/Notification");
  const notifs = await Notification.find().sort({createdAt: -1});
  console.log("Recent notifications:", notifs.slice(0,3));
  process.exit(0);
}
check();
