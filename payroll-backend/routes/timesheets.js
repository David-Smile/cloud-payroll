const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const Timesheet = require('../models/Timesheet');
const Employee = require('../models/Employee');

const router = express.Router();

// All routes require authentication
router.use(protect);

// @desc    Get all timesheets
// @route   GET /api/timesheets
// @access  Private
router.get('/', async (req, res) => {
  try {
    const timesheets = await Timesheet.find()
      .populate('employee', 'name email position department')
      .populate('approvedBy', 'name email')
      .sort({ date: -1, createdAt: -1 });
    
    res.json({
      success: true,
      count: timesheets.length,
      timesheets
    });
  } catch (error) {
    console.error('Get timesheets error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single timesheet
// @route   GET /api/timesheets/:id
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const timesheet = await Timesheet.findById(req.params.id)
      .populate('employee', 'name email position department')
      .populate('approvedBy', 'name email');
    
    if (!timesheet) {
      return res.status(404).json({
        success: false,
        message: 'Timesheet not found'
      });
    }

    res.json({
      success: true,
      timesheet
    });
  } catch (error) {
    console.error('Get timesheet error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create timesheet
// @route   POST /api/timesheets
// @access  Private
router.post('/', [
  body('employee').isMongoId().withMessage('Valid employee ID is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('startTime').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time is required (HH:MM)'),
  body('endTime').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time is required (HH:MM)'),
  body('project').trim().notEmpty().withMessage('Project is required'),
  body('breakTime').optional().isNumeric().withMessage('Break time must be a number')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { employee, date, startTime, endTime, breakTime, project, task, notes, location, tags } = req.body;

    // Check if employee exists
    const employeeExists = await Employee.findById(employee);
    if (!employeeExists) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Check if timesheet already exists for this employee and date
    const existingTimesheet = await Timesheet.findOne({
      employee,
      date: new Date(date)
    });

    if (existingTimesheet) {
      return res.status(400).json({
        success: false,
        message: 'Timesheet already exists for this employee and date'
      });
    }

    // Calculate total hours
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    
    // Handle overnight shifts
    if (end < start) {
      end.setDate(end.getDate() + 1);
    }
    
    const totalMinutes = (end - start) / (1000 * 60);
    const breakMinutes = breakTime || 0;
    const workMinutes = totalMinutes - breakMinutes;
    const totalHours = Math.max(0, workMinutes / 60);
    
    // Calculate overtime (assuming 8 hours is regular work day)
    const regularHours = 8;
    const overtimeHours = Math.max(0, totalHours - regularHours);

    // Create timesheet
    const timesheet = await Timesheet.create({
      employee,
      date: new Date(date),
      startTime,
      endTime,
      breakTime: breakMinutes,
      totalHours,
      overtimeHours,
      project,
      task,
      notes,
      location,
      tags,
      hourlyRate: employeeExists.hourlyRate || 0
    });

    const populatedTimesheet = await Timesheet.findById(timesheet._id)
      .populate('employee', 'name email position department')
      .populate('approvedBy', 'name email');

    res.status(201).json({
      success: true,
      timesheet: populatedTimesheet
    });
  } catch (error) {
    console.error('Create timesheet error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update timesheet
// @route   PUT /api/timesheets/:id
// @access  Private
router.put('/:id', [
  body('date').optional().isISO8601().withMessage('Valid date is required'),
  body('startTime').optional().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time is required (HH:MM)'),
  body('endTime').optional().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time is required (HH:MM)'),
  body('project').optional().trim().notEmpty().withMessage('Project cannot be empty'),
  body('breakTime').optional().isNumeric().withMessage('Break time must be a number')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const timesheet = await Timesheet.findById(req.params.id);
    
    if (!timesheet) {
      return res.status(404).json({
        success: false,
        message: 'Timesheet not found'
      });
    }

    // Only allow updates if timesheet is pending
    if (timesheet.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update timesheet that is not pending'
      });
    }

    // Update timesheet
    const updatedTimesheet = await Timesheet.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('employee', 'name email position department')
     .populate('approvedBy', 'name email');

    res.json({
      success: true,
      timesheet: updatedTimesheet
    });
  } catch (error) {
    console.error('Update timesheet error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Approve timesheet
// @route   POST /api/timesheets/:id/approve
// @access  Admin/Manager only
router.post('/:id/approve', authorize('admin', 'manager'), async (req, res) => {
  try {
    const timesheet = await Timesheet.findById(req.params.id);
    
    if (!timesheet) {
      return res.status(404).json({
        success: false,
        message: 'Timesheet not found'
      });
    }

    if (timesheet.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Timesheet is not pending'
      });
    }

    // Update timesheet status to approved
    timesheet.status = 'approved';
    timesheet.approvedBy = req.user.id;
    timesheet.approvedAt = new Date();
    await timesheet.save();

    const populatedTimesheet = await Timesheet.findById(timesheet._id)
      .populate('employee', 'name email position department')
      .populate('approvedBy', 'name email');

    res.json({
      success: true,
      timesheet: populatedTimesheet,
      message: 'Timesheet approved successfully'
    });
  } catch (error) {
    console.error('Approve timesheet error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Reject timesheet
// @route   POST /api/timesheets/:id/reject
// @access  Admin/Manager only
router.post('/:id/reject', authorize('admin', 'manager'), [
  body('rejectionReason').trim().notEmpty().withMessage('Rejection reason is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const timesheet = await Timesheet.findById(req.params.id);
    
    if (!timesheet) {
      return res.status(404).json({
        success: false,
        message: 'Timesheet not found'
      });
    }

    if (timesheet.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Timesheet is not pending'
      });
    }

    // Update timesheet status to rejected
    timesheet.status = 'rejected';
    timesheet.rejectionReason = req.body.rejectionReason;
    timesheet.approvedBy = req.user.id;
    timesheet.approvedAt = new Date();
    await timesheet.save();

    const populatedTimesheet = await Timesheet.findById(timesheet._id)
      .populate('employee', 'name email position department')
      .populate('approvedBy', 'name email');

    res.json({
      success: true,
      timesheet: populatedTimesheet,
      message: 'Timesheet rejected successfully'
    });
  } catch (error) {
    console.error('Reject timesheet error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete timesheet
// @route   DELETE /api/timesheets/:id
// @access  Admin only
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const timesheet = await Timesheet.findById(req.params.id);
    
    if (!timesheet) {
      return res.status(404).json({
        success: false,
        message: 'Timesheet not found'
      });
    }

    // Only allow deletion if timesheet is pending
    if (timesheet.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete timesheet that is not pending'
      });
    }

    await Timesheet.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Timesheet deleted successfully'
    });
  } catch (error) {
    console.error('Delete timesheet error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 