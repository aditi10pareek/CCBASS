const express = require('express');
const router = express.Router();
const {
  getLawyers,
  getJudges,
  updateAvailability,
  getMyAvailability
} = require('../controllers/lawyerController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect); // All routes require login

router.get('/', getLawyers);
router.get('/judges', getJudges);
router.put('/availability', authorize('Lawyer', 'Admin'), updateAvailability);
router.get('/availability', authorize('Lawyer', 'Admin'), getMyAvailability);

module.exports = router;
