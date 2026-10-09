const User = require('../models/User');
const LawyerAvailability = require('../models/LawyerAvailability');

// @desc    Get list of all lawyers
// @route   GET /api/lawyers
// @access  Private
const getLawyers = async (req, res) => {
  try {
    const lawyers = await User.find({ role: 'Lawyer', status: 'Active' }).select('name email phone');
    res.json({ success: true, count: lawyers.length, data: lawyers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get list of all judges (helpful utility for Clerk case creation)
// @route   GET /api/lawyers/judges
// @access  Private
const getJudges = async (req, res) => {
  try {
    const judges = await User.find({ role: 'Judge', status: 'Active' }).select('name email phone');
    res.json({ success: true, count: judges.length, data: judges });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update availability schedule
// @route   PUT /api/lawyers/availability
// @access  Private (Lawyer only)
const updateAvailability = async (req, res) => {
  try {
    const { date, available, reason } = req.body;

    if (!date) {
      return res.status(400).json({ success: false, message: 'Please provide a date.' });
    }

    const formattedDate = new Date(date).setHours(0,0,0,0);

    // Find and update, or create a new availability record
    const availability = await LawyerAvailability.findOneAndUpdate(
      {
        lawyerId: req.user._id,
        date: new Date(formattedDate)
      },
      {
        available: !!available,
        reason: reason || ''
      },
      {
        new: true,
        upsert: true
      }
    );

    res.json({ success: true, data: availability });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current lawyer's availability log
// @route   GET /api/lawyers/availability
// @access  Private (Lawyer only)
const getMyAvailability = async (req, res) => {
  try {
    const availability = await LawyerAvailability.find({ lawyerId: req.user._id })
      .sort({ date: 1 });
    res.json({ success: true, data: availability });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getLawyers,
  getJudges,
  updateAvailability,
  getMyAvailability
};
