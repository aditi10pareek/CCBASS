const mongoose = require('mongoose');

const CaseSchema = new mongoose.Schema({
  caseNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  caseType: {
    type: String,
    enum: ['Civil', 'Criminal'],
    required: true,
  },
  plaintiff: {
    type: String,
    required: true,
    trim: true,
  },
  defendant: {
    type: String,
    required: true,
    trim: true,
  },
  judgeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  lawyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  court: {
    type: String,
    required: true,
    trim: true,
  },
  priorityScore: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['New', 'Scheduled', 'Adjourned', 'Closed'],
    default: 'New',
  },
  filingDate: {
    type: Date,
    default: Date.now,
  },
  nextHearing: {
    type: Date,
  },
  adjournmentCount: {
    type: Number,
    default: 0,
  },
  // Scoring parameters
  isWomenSafety: {
    type: Boolean,
    default: false,
  },
  isSeniorCitizen: {
    type: Boolean,
    default: false,
  },
  isChildRelated: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Case', CaseSchema);
