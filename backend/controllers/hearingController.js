const Hearing = require('../models/Hearing');
const Case = require('../models/Case');
const Notification = require('../models/Notification');
const LawyerAvailability = require('../models/LawyerAvailability');

// @desc    Schedule a new hearing
// @route   POST /api/hearings
// @access  Private (Clerk only)
const scheduleHearing = async (req, res) => {
  try {
    const { caseId, date, time } = req.body;

    const targetCase = await Case.findById(caseId);
    if (!targetCase) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    // Check if lawyer is available on the scheduled date
    const formattedDate = new Date(date).setHours(0,0,0,0);
    const availability = await LawyerAvailability.findOne({
      lawyerId: targetCase.lawyerId,
      date: {
        $gte: new Date(formattedDate),
        $lt: new Date(formattedDate + 24 * 60 * 60 * 1000)
      }
    });

    // If lawyer has specifically set availability as false
    if (availability && !availability.available) {
      return res.status(400).json({
        success: false,
        message: `Lawyer is unavailable on this date. Reason: ${availability.reason || 'None provided'}`
      });
    }

    // Create the hearing
    const hearing = await Hearing.create({
      caseId,
      judgeId: targetCase.judgeId,
      date,
      time,
      status: 'Scheduled'
    });

    // Update case details
    targetCase.status = 'Scheduled';
    targetCase.nextHearing = date;
    await targetCase.save();

    // Create Notifications
    await Notification.create({
      userId: targetCase.lawyerId,
      title: 'Hearing Scheduled',
      message: `A hearing for Case ${targetCase.caseNumber} - "${targetCase.title}" has been scheduled for ${new Date(date).toLocaleDateString()} at ${time}.`,
      status: 'Unread'
    });

    await Notification.create({
      userId: targetCase.judgeId,
      title: 'Hearing Scheduled',
      message: `A hearing for Case ${targetCase.caseNumber} has been scheduled in your court for ${new Date(date).toLocaleDateString()} at ${time}.`,
      status: 'Unread'
    });

    res.status(201).json({ success: true, data: hearing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all hearings
// @route   GET /api/hearings
// @access  Private / Public (conditional)
const getHearings = async (req, res) => {
  try {
    const { judgeId, date, status, caseId } = req.query;
    let query = {};

    if (judgeId) query.judgeId = judgeId;
    if (status) query.status = status;
    if (caseId) query.caseId = caseId;

    if (date) {
      const targetDate = new Date(date).setHours(0,0,0,0);
      query.date = {
        $gte: new Date(targetDate),
        $lt: new Date(targetDate + 24 * 60 * 60 * 1000)
      };
    }

    const hearings = await Hearing.find(query)
      .populate({
        path: 'caseId',
        populate: [
          { path: 'judgeId', select: 'name email' },
          { path: 'lawyerId', select: 'name email' }
        ]
      })
      .populate('judgeId', 'name email')
      .sort({ date: 1, time: 1 });

    res.json({ success: true, count: hearings.length, data: hearings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update hearing details & record judge remarks
// @route   PUT /api/hearings/:id
// @access  Private (Clerk/Judge)
const updateHearing = async (req, res) => {
  try {
    const { status, remarks, closeCase } = req.body;

    const hearing = await Hearing.findById(req.params.id);
    if (!hearing) {
      return res.status(404).json({ success: false, message: 'Hearing not found' });
    }

    if (status !== undefined) hearing.status = status;
    if (remarks !== undefined) hearing.remarks = remarks;

    await hearing.save();

    // If hearing was conducted and the judge requested to close/dispose the case
    if (status === 'Conducted') {
      const targetCase = await Case.findById(hearing.caseId);
      if (targetCase) {
        if (closeCase) {
          targetCase.status = 'Closed';
          targetCase.nextHearing = null;
        } else {
          // Ready for next schedule
          targetCase.status = 'New';
        }
        await targetCase.save();
      }
    }

    // Populate and return
    const updatedHearing = await Hearing.findById(req.params.id)
      .populate('caseId')
      .populate('judgeId', 'name email');

    res.json({ success: true, data: updatedHearing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  scheduleHearing,
  getHearings,
  updateHearing
};
