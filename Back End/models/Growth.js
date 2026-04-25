const mongoose = require("mongoose");

const GrowthSchema = new mongoose.Schema(
  {
    babyId: { type: mongoose.Schema.Types.ObjectId, ref: "Baby" },
    email: { type: String, required: true },
    age: { type: Number, required: true },
    height: { type: Number, required: true },
    date: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Growth", GrowthSchema);
