const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
  name: String,
  capacity: Number,
  status: { type: String, default: 'available' }
});

module.exports = mongoose.model('Table', tableSchema);
