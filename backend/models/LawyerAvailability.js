const mongoose = require('mongoose');

const LawyerAvailabilitySchema = new mongoose.Schema({
  lawyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  available: {
    type: Boolean,
    default: true,
  },
  reason: {
    type: String,
    default: '',
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('LawyerAvailability', LawyerAvailabilitySchema);
