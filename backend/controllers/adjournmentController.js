const Adjournment = require('../models/Adjournment');
const Case = require('../models/Case');
const Hearing = require('../models/Hearing');
const Notification = require('../models/Notification');
const { calculatePriorityScore } = require('../utils/priorityScorer');

// @desc    Request an adjournment
// @route   POST /api/adjournments
// @access  Private (Lawyer only)
const requestAdjournment = async (req, res) => {
  try {
    const { caseId, reason, date } = req.body;

    const targetCase = await Case.findById(caseId);
    if (!targetCase) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    // Verify requesting user is the lawyer assigned to the case
    if (targetCase.lawyerId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized. You are not the assigned lawyer for this case.' });
    }

    const adjournment = await Adjournment.create({
      caseId,
      reason,
      date,
      requestedBy: req.user._id,
      status: 'Pending'
    });

    // Notify Clerk and Judge
    await Notification.create({
      userId: targetCase.judgeId,
      title: 'Adjournment Requested',
      message: `Lawyer ${req.user.name} has requested an adjournment for Case ${targetCase.caseNumber}. Reason: "${reason}".`,
      status: 'Unread'
    });

    res.status(201).json({ success: true, data: adjournment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all adjournments
// @route   GET /api/adjournments
// @access  Private (Clerk, Judge, Admin, Lawyer)
const getAdjournments = async (req, res) => {
  try {
    let query = {};

    // Lawyers can only see their requested adjournments
    if (req.user.role === 'Lawyer') {
      query.requestedBy = req.user._id;
    } else if (req.user.role === 'Judge') {
      // Judge can see adjournments for cases assigned to them
      const judgeCases = await Case.find({ judgeId: req.user._id }).select('_id');
      const caseIds = judgeCases.map(c => c._id);
      query.caseId = { $in: caseIds };
    }

    const adjournments = await Adjournment.find(query)
      .populate({
        path: 'caseId',
        select: 'caseNumber title status adjournmentCount judgeId lawyerId'
      })
      .populate('requestedBy', 'name email role')
      .populate('approvedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: adjournments.length, data: adjournments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve/Reject adjournment request
// @route   PUT /api/adjournments/:id
// @access  Private (Clerk, Judge, Admin)
const updateAdjournmentStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'Approved' or 'Rejected'
    
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status update. Must be Approved or Rejected.' });
    }

    const adjournment = await Adjournment.findById(req.params.id);
    if (!adjournment) {
      return res.status(404).json({ success: false, message: 'Adjournment request not found' });
    }

    if (adjournment.status !== 'Pending') {
      return res.status(400).json({ success: false, message: `Request has already been processed: ${adjournment.status}` });
    }

    adjournment.status = status;
    adjournment.approvedBy = req.user._id;
    await adjournment.save();

    const targetCase = await Case.findById(adjournment.caseId);
    
    if (status === 'Approved' && targetCase) {
      // Update case
      targetCase.adjournmentCount += 1;
      targetCase.status = 'Adjourned';
      
      // Compute new priority score with updated adjournmentCount
      targetCase.priorityScore = calculatePriorityScore(targetCase);

      // Save previous hearing date and update to new date
      const oldNextHearingDate = targetCase.nextHearing;
      targetCase.nextHearing = adjournment.date;
      await targetCase.save();

      // Find the currently scheduled active hearing for this case and mark it as Adjourned
      if (oldNextHearingDate) {
        const activeHearing = await Hearing.findOne({
          caseId: targetCase._id,
          date: oldNextHearingDate,
          status: 'Scheduled'
        });
        if (activeHearing) {
          activeHearing.status = 'Adjourned';
          activeHearing.remarks = `Adjourned by request. Reason: ${adjournment.reason}`;
          await activeHearing.save();
        }
      }

      // Automatically create a new scheduled hearing on the approved date
      await Hearing.create({
        caseId: targetCase._id,
        judgeId: targetCase.judgeId,
        date: adjournment.date,
        time: '10:00 AM', // Default morning time
        status: 'Scheduled'
      });

      // Send notifications
      await Notification.create({
        userId: targetCase.lawyerId,
        title: 'Adjournment Request Approved',
        message: `Your adjournment request for Case ${targetCase.caseNumber} was approved. Next hearing is on ${new Date(adjournment.date).toLocaleDateString()}.`,
        status: 'Unread'
      });
    } else if (status === 'Rejected' && targetCase) {
      // Send notifications
      await Notification.create({
        userId: targetCase.lawyerId,
        title: 'Adjournment Request Rejected',
        message: `Your adjournment request for Case ${targetCase.caseNumber} was rejected. Hearing scheduled on ${new Date(targetCase.nextHearing).toLocaleDateString()} remains active.`,
        status: 'Unread'
      });
    }

    res.json({ success: true, data: adjournment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  requestAdjournment,
  getAdjournments,
  updateAdjournmentStatus
};
