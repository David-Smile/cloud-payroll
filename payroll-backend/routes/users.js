const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// All routes require authentication
router.use(protect);

// @desc    Get all users
// @route   GET /api/users
// @access  Admin only
router.get('/', authorize('admin'), async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Get all users - TODO: Implement'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Admin only
router.get('/:id', authorize('admin'), async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Get single user - TODO: Implement'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create user
// @route   POST /api/users
// @access  Admin only
router.post('/', authorize('admin'), async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Create user - TODO: Implement'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Admin only
router.put('/:id', authorize('admin'), async (req, res) => {
  try {
    const updates = (({
      name, email, role, department, phone, location, bio, isActive, preferences
    }) => ({ name, email, role, department, phone, location, bio, isActive, preferences }))(req.body);
    // Remove undefined fields
    Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Admin only
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

module.exports = router; 