const mongoose = require('mongoose');

const babySchema = new mongoose.Schema({
  babyName: { type: String, required: true },
  birthDate: { type: Date, required: true },
  motherName: String,
  motherAge: String,
  address: String,
  gender: String,
  numberOfBabies: String,
  weight: String,
  height: String,
  headCircumference: String,
  deliveryMethod: String,
  additionalInfo: String,
  email: { type: String, required: true }
}, { 
  strict: false,
  collection: 'babies' 
});

module.exports = mongoose.model("Baby", babySchema);
