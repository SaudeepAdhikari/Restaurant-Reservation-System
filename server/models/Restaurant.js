const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: String,
  description: String,
  cuisine: String,
  openingHours: String,
  contactInfo: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
