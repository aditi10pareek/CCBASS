const express = require('express');
const router = express.Router();
const {
  requestAdjournment,
  getAdjournments,
  updateAdjournmentStatus
} = require('../controllers/adjournmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect); // All adjournment routes require logging in

router.post('/', authorize('Lawyer', 'Admin'), requestAdjournment);
router.get('/', getAdjournments);
router.put('/:id', authorize('Clerk', 'Judge', 'Admin'), updateAdjournmentStatus);

module.exports = router;
