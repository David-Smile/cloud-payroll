const express = require('express');
const { protect, authorize } = require('../middleware/auth');

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
    res.json({
      success: true,
      message: 'Update user - TODO: Implement'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Admin only
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Delete user - TODO: Implement'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 