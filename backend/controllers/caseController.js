const Case = require('../models/Case');
const User = require('../models/User');
const { calculatePriorityScore } = require('../utils/priorityScorer');

// @desc    Create a new case
// @route   POST /api/cases
// @access  Private (Clerk only)
const createCase = async (req, res) => {
  try {
    const {
      caseNumber,
      title,
      caseType,
      plaintiff,
      defendant,
      judgeId,
      lawyerId,
      court,
      filingDate,
      isWomenSafety,
      isSeniorCitizen,
      isChildRelated
    } = req.body;

    // Validate judge and lawyer exist
    const judge = await User.findById(judgeId);
    if (!judge || judge.role !== 'Judge') {
      return res.status(400).json({ success: false, message: 'Invalid Judge assigned' });
    }

    const lawyer = await User.findById(lawyerId);
    if (!lawyer || lawyer.role !== 'Lawyer') {
      return res.status(400).json({ success: false, message: 'Invalid Lawyer assigned' });
    }

    // Check unique case number
    const caseExists = await Case.findOne({ caseNumber });
    if (caseExists) {
      return res.status(400).json({ success: false, message: 'Case number already exists' });
    }

    // Setup temporary case data object to pass to priority scorer
    const tempCaseData = {
      caseType,
      filingDate: filingDate || new Date(),
      adjournmentCount: 0,
      isWomenSafety: !!isWomenSafety,
      isSeniorCitizen: !!isSeniorCitizen,
      isChildRelated: !!isChildRelated
    };

    // Calculate score
    const priorityScore = calculatePriorityScore(tempCaseData);

    const newCase = await Case.create({
      caseNumber,
      title,
      caseType,
      plaintiff,
      defendant,
      judgeId,
      lawyerId,
      court,
      filingDate: tempCaseData.filingDate,
      priorityScore,
      isWomenSafety: tempCaseData.isWomenSafety,
      isSeniorCitizen: tempCaseData.isSeniorCitizen,
      isChildRelated: tempCaseData.isChildRelated,
      status: 'New'
    });

    res.status(201).json({ success: true, data: newCase });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all cases with filter, pagination and search
// @route   GET /api/cases
// @access  Public (Citizen has read access)
const getCases = async (req, res) => {
  try {
    const { 
      search, 
      status, 
      caseType, 
      judgeId, 
      lawyerId, 
      court, 
      sort,
      caseNumber 
    } = req.query;

    let query = {};

    // Filter by specific status, type, judge, lawyer, court, caseNumber
    if (status) query.status = status;
    if (caseType) query.caseType = caseType;
    if (judgeId) query.judgeId = judgeId;
    if (lawyerId) query.lawyerId = lawyerId;
    if (court) query.court = court;
    if (caseNumber) query.caseNumber = caseNumber;

    // Search query (caseNumber, title, plaintiff, defendant, court)
    if (search) {
      query.$or = [
        { caseNumber: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { plaintiff: { $regex: search, $options: 'i' } },
        { defendant: { $regex: search, $options: 'i' } },
        { court: { $regex: search, $options: 'i' } }
      ];
    }

    // Default sorting: higher priority score first
    let sortOption = { priorityScore: -1, filingDate: 1 };
    if (sort === 'filingDateAsc') sortOption = { filingDate: 1 };
    if (sort === 'filingDateDesc') sortOption = { filingDate: -1 };
    if (sort === 'priorityScoreAsc') sortOption = { priorityScore: 1 };

    const cases = await Case.find(query)
      .populate('judgeId', 'name email phone')
      .populate('lawyerId', 'name email phone')
      .sort(sortOption);

    res.json({ success: true, count: cases.length, data: cases });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get a single case
// @route   GET /api/cases/:id
// @access  Public
const getCaseById = async (req, res) => {
  try {
    const targetCase = await Case.findById(req.params.id)
      .populate('judgeId', 'name email phone')
      .populate('lawyerId', 'name email phone');

    if (!targetCase) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    res.json({ success: true, data: targetCase });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update case details
// @route   PUT /api/cases/:id
// @access  Private (Clerk/Admin/Judge)
const updateCase = async (req, res) => {
  try {
    const {
      title,
      caseType,
      plaintiff,
      defendant,
      judgeId,
      lawyerId,
      court,
      status,
      filingDate,
      isWomenSafety,
      isSeniorCitizen,
      isChildRelated,
      adjournmentCount,
      nextHearing
    } = req.body;

    const targetCase = await Case.findById(req.params.id);
    if (!targetCase) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    // Update individual fields
    if (title !== undefined) targetCase.title = title;
    if (caseType !== undefined) targetCase.caseType = caseType;
    if (plaintiff !== undefined) targetCase.plaintiff = plaintiff;
    if (defendant !== undefined) targetCase.defendant = defendant;
    if (court !== undefined) targetCase.court = court;
    if (status !== undefined) targetCase.status = status;
    if (filingDate !== undefined) targetCase.filingDate = filingDate;
    if (isWomenSafety !== undefined) targetCase.isWomenSafety = isWomenSafety;
    if (isSeniorCitizen !== undefined) targetCase.isSeniorCitizen = isSeniorCitizen;
    if (isChildRelated !== undefined) targetCase.isChildRelated = isChildRelated;
    if (adjournmentCount !== undefined) targetCase.adjournmentCount = adjournmentCount;
    if (nextHearing !== undefined) targetCase.nextHearing = nextHearing;

    if (judgeId !== undefined) {
      const judge = await User.findById(judgeId);
      if (!judge || judge.role !== 'Judge') {
        return res.status(400).json({ success: false, message: 'Invalid Judge assigned' });
      }
      targetCase.judgeId = judgeId;
    }

    if (lawyerId !== undefined) {
      const lawyer = await User.findById(lawyerId);
      if (!lawyer || lawyer.role !== 'Lawyer') {
        return res.status(400).json({ success: false, message: 'Invalid Lawyer assigned' });
      }
      targetCase.lawyerId = lawyerId;
    }

    // Recalculate priority score before saving
    targetCase.priorityScore = calculatePriorityScore(targetCase);

    await targetCase.save();
    
    // Fetch populated case
    const updatedCase = await Case.findById(req.params.id)
      .populate('judgeId', 'name email phone')
      .populate('lawyerId', 'name email phone');

    res.json({ success: true, data: updatedCase });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete case
// @route   DELETE /api/cases/:id
// @access  Private (Admin only)
const deleteCase = async (req, res) => {
  try {
    const targetCase = await Case.findById(req.params.id);

    if (!targetCase) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    await Case.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: 'Case removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createCase,
  getCases,
  getCaseById,
  updateCase,
  deleteCase
};
