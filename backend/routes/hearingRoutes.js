const express = require('express');
const router = express.Router();
const {
  scheduleHearing,
  getHearings,
  updateHearing
} = require('../controllers/hearingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect); // All hearing routes require logging in

router.get('/', getHearings);
router.post('/', authorize('Clerk', 'Admin'), scheduleHearing);
router.put('/:id', authorize('Clerk', 'Admin', 'Judge'), updateHearing);

module.exports = router;
