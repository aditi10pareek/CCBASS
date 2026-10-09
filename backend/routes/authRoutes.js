const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  getAllUsers,
  updateUserStatus,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public route for login
router.post('/login', loginUser);

// Conditional routes for register:
// Controller handles bypassing token auth if 0 users exist.
// So we use protect optionally by reading header or using it directly.
// To handle the 0-users case, we'll try to apply protect, but catch errors or just pass the execution.
// Actually, let's create a custom middleware or check inside registerUser. 
// If there's an authorization header, verify it. Otherwise, let it pass and let registerUser handle it.
const optionalProtect = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    return protect(req, res, next);
  }
  next();
};

router.post('/register', optionalProtect, registerUser);

// Protected routes
router.get('/profile', protect, getUserProfile);
router.get('/users', protect, authorize('Admin'), getAllUsers);
router.put('/users/:id/status', protect, authorize('Admin'), updateUserStatus);

module.exports = router;
