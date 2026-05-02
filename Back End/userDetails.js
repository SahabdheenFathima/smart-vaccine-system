const mongoose = require("mongoose");

const UserDetailsSchema = new mongoose.Schema(
  {
    fname: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, enum: ['PARENT', 'ADMIN', 'CONSULTANT'], default: 'PARENT' },
  },
  {
    collection: "UserInfo", // Corrected capitalization
  }
);

module.exports = mongoose.model("UserInfo", UserDetailsSchema);
