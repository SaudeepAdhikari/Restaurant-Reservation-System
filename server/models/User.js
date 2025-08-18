const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Store hashed passwords
  isAdmin: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', userSchema);
