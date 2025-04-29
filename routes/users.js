const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateProfile,
  getMe,
  uploadUserPhoto,
  getUserStats
} = require('../controllers/users');

const User = require('../models/User');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

// Public routes (no middleware needed)
// None currently - all user routes are protected

// Routes for logged-in users (any role)
// Apply protection middleware - requires authentication
router.use(protect);

router.route('/me')
  .get(getMe);

router.route('/profile')
  .put(updateProfile);

router.route('/photo')
  .put(uploadUserPhoto);

// Admin-only routes
// Apply authorization middleware - requires admin role
router.use(authorize('admin'));

router.route('/stats')
  .get(getUserStats);

router
  .route('/')
  .get(advancedResults(User), getUsers)
  .post(createUser);

router
  .route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;
