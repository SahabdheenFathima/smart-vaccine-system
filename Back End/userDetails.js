const mongoose = require("mongoose");

const UserDetailsSchema = new mongoose.Schema(
  {
    fname: String,
    email: { type: String, unique: true },
    password: String,
  },
  {
    collection: "UserInfo", // Corrected capitalization
  }
);

module.exports = mongoose.model("UserInfo", UserDetailsSchema);
