const Case = require('../models/Case');
const Hearing = require('../models/Hearing');
const User = require('../models/User');
const Adjournment = require('../models/Adjournment');

// @desc    Get dashboard metrics & trends
// @route   GET /api/analytics/dashboard
// @access  Private
const getDashboardData = async (req, res) => {
  try {
    const totalCases = await Case.countDocuments({});
    const pendingCases = await Case.countDocuments({ status: { $ne: 'Closed' } });
    const closedCases = await Case.countDocuments({ status: 'Closed' });
    
    // Delayed cases: Pending cases older than 1 year (or more than 3 adjournments)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const delayedCases = await Case.countDocuments({
      status: { $ne: 'Closed' },
      $or: [
        { filingDate: { $lte: oneYearAgo } },
        { adjournmentCount: { $gt: 3 } }
      ]
    });

    // Today's hearings
    const startOfToday = new Date();
    startOfToday.setHours(0,0,0,0);
    const endOfToday = new Date();
    endOfToday.setHours(23,59,59,999);
    
    let hearingQuery = {
      date: { $gte: startOfToday, $lte: endOfToday }
    };

    // If Judge/Lawyer, restrict hearings to their own
    if (req.user.role === 'Judge') {
      hearingQuery.judgeId = req.user._id;
    } else if (req.user.role === 'Lawyer') {
      // Find cases where this user is lawyer
      const lawyerCases = await Case.find({ lawyerId: req.user._id }).select('_id');
      const caseIds = lawyerCases.map(c => c._id);
      hearingQuery.caseId = { $in: caseIds };
    }

    const todaysHearingsCount = await Hearing.countDocuments(hearingQuery);
    const lawyersCount = await User.countDocuments({ role: 'Lawyer', status: 'Active' });
    const judgesCount = await User.countDocuments({ role: 'Judge', status: 'Active' });

    // Rest of dashboard statistics depending on role
    let customSummary = {};
    if (req.user.role === 'Judge') {
      customSummary.assignedCases = await Case.countDocuments({ judgeId: req.user._id, status: { $ne: 'Closed' } });
      customSummary.completedCases = await Case.countDocuments({ judgeId: req.user._id, status: 'Closed' });
      customSummary.pendingOrders = await Hearing.countDocuments({ judgeId: req.user._id, status: 'Conducted', remarks: '' });
      customSummary.delayedCases = await Case.countDocuments({
        judgeId: req.user._id,
        status: { $ne: 'Closed' },
        $or: [{ filingDate: { $lte: oneYearAgo } }, { adjournmentCount: { $gt: 3 } }]
      });
    } else if (req.user.role === 'Lawyer') {
      const myCases = await Case.find({ lawyerId: req.user._id });
      const myCaseIds = myCases.map(c => c._id);
      
      customSummary.activeCases = myCases.filter(c => c.status !== 'Closed').length;
      customSummary.upcomingHearings = await Hearing.countDocuments({
        caseId: { $in: myCaseIds },
        date: { $gte: new Date() },
        status: 'Scheduled'
      });
      customSummary.pendingAdjournments = await Adjournment.countDocuments({
        requestedBy: req.user._id,
        status: 'Pending'
      });
    } else if (req.user.role === 'Clerk') {
      customSummary.pendingScheduling = await Case.countDocuments({ status: 'New' });
      customSummary.pendingAdjournments = await Adjournment.countDocuments({ status: 'Pending' });
      customSummary.newCasesCount = await Case.countDocuments({
        filingDate: { $gte: startOfToday }
      });
    }

    res.json({
      success: true,
      data: {
        metrics: {
          totalCases,
          pendingCases,
          closedCases,
          delayedCases,
          todaysHearingsCount,
          lawyersCount,
          judgesCount,
          ...customSummary
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get detailed report and chart statistics
// @route   GET /api/analytics/charts
// @access  Private
const getChartsData = async (req, res) => {
  try {
    // 1. Cases by Type
    const casesByType = await Case.aggregate([
      { $group: { _id: '$caseType', count: { $sum: 1 } } }
    ]);

    // 2. Cases by Status
    const casesByStatus = await Case.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // 3. Cases Monthly filing (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyCases = await Case.aggregate([
      { $match: { filingDate: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$filingDate' },
            month: { $month: '$filingDate' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // 4. Judge workload (active cases assigned per judge)
    const judgeWorkload = await Case.aggregate([
      { $match: { status: { $ne: 'Closed' } } },
      { $group: { _id: '$judgeId', count: { $sum: 1 } } }
    ]);

    // Populate judge names
    const populatedJudgeWorkload = await Promise.all(
      judgeWorkload.map(async (item) => {
        const judge = await User.findById(item._id).select('name');
        return {
          judgeName: judge ? judge.name : 'Unknown Judge',
          caseCount: item.count
        };
      })
    );

    // 5. Average Disposal Time (in days)
    const closedCasesList = await Case.find({ status: 'Closed' });
    let totalDisposalDays = 0;
    closedCasesList.forEach((c) => {
      const filing = new Date(c.filingDate);
      const closed = new Date(c.updatedAt);
      const diffTime = Math.abs(closed - filing);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      totalDisposalDays += diffDays;
    });

    const averageDisposalTime = closedCasesList.length > 0 
      ? Math.round(totalDisposalDays / closedCasesList.length) 
      : 0;

    // 6. Lawyer Delay Index (average adjournments per case for lawyer)
    const lawyerDelays = await Case.aggregate([
      { $group: { _id: '$lawyerId', avgAdjournments: { $avg: '$adjournmentCount' }, totalAdjournments: { $sum: '$adjournmentCount' } } }
    ]);

    // Populate lawyer names
    const populatedLawyerDelays = await Promise.all(
      lawyerDelays.map(async (item) => {
        const lawyer = await User.findById(item._id).select('name');
        return {
          lawyerName: lawyer ? lawyer.name : 'Unknown Lawyer',
          avgAdjournments: Math.round(item.avgAdjournments * 10) / 10,
          totalAdjournments: item.totalAdjournments
        };
      })
    );

    res.json({
      success: true,
      data: {
        casesByType: casesByType.map(c => ({ type: c._id, count: c.count })),
        casesByStatus: casesByStatus.map(c => ({ status: c._id, count: c.count })),
        monthlyCases: monthlyCases.map(m => {
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          return {
            month: `${monthNames[m._id.month - 1]} ${m._id.year}`,
            count: m.count
          };
        }),
        judgeWorkload: populatedJudgeWorkload,
        lawyerDelays: populatedLawyerDelays,
        averageDisposalTime
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's unread notifications
// @route   GET /api/analytics/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/analytics/notifications/:id/read
// @access  Private
const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (notification.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    notification.status = 'Read';
    await notification.save();

    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardData,
  getChartsData,
  getNotifications,
  markNotificationRead
};
