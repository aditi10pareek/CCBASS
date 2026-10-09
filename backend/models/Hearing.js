const mongoose = require('mongoose');

const HearingSchema = new mongoose.Schema({
  caseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case',
    required: true,
  },
  judgeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true, // e.g., "10:30 AM"
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Conducted', 'Adjourned'],
    default: 'Scheduled',
  },
  remarks: {
    type: String,
    default: '',
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Hearing', HearingSchema);
