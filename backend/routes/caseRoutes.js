const express = require('express');
const router = express.Router();
const {
  createCase,
  getCases,
  getCaseById,
  updateCase,
  deleteCase
} = require('../controllers/caseController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes (anyone, including citizens, can retrieve/search cases)
router.get('/', getCases);
router.get('/:id', getCaseById);

// Protected routes
router.post('/', protect, authorize('Clerk', 'Admin'), createCase);
router.put('/:id', protect, authorize('Clerk', 'Admin', 'Judge'), updateCase);
router.delete('/:id', protect, authorize('Admin'), deleteCase);

module.exports = router;
