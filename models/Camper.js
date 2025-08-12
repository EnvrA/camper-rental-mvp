const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  startDate: Date,
  endDate: Date
});

const camperSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  pricePerDay: {
    type: Number,
    required: true
  },
  image: String,
  bookings: [bookingSchema],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Camper', camperSchema);