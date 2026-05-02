const mongoose = require("mongoose");

const GrowthSchema = new mongoose.Schema(
  {
    babyId: { type: mongoose.Schema.Types.ObjectId, ref: "Baby" },
    email: { type: String, required: true },
    age: { type: Number, required: true },       // age in months (auto-calculated or manual)
    month: { type: Number },                     // manual month override (same as age, kept for UI clarity)
    height: { type: Number, required: true },    // height in cm
    weight: { type: Number },                    // weight in kg
    date: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Growth", GrowthSchema);
