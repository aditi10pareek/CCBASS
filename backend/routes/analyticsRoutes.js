const express = require('express');
const router = express.Router();
const {
  getDashboardData,
  getChartsData,
  getNotifications,
  markNotificationRead
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All routes require login

router.get('/dashboard', getDashboardData);
router.get('/charts', getChartsData);
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);

module.exports = router;
