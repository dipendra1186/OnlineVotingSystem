const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: String,
  age: Number,
  religion: String,
  gender: String,
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['Admin', 'Governor', 'Voter'] },
  voterID: String
});


module.exports = mongoose.model("User", userSchema);
