const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
  table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' },
  guests: Number,
  date: Date,
  time: String,
  status: { type: String, default: 'pending' }
});

module.exports = mongoose.model('Reservation', reservationSchema);
