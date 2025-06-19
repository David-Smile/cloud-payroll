const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const Employee = require('../models/Employee');

const router = express.Router();

// All routes require authentication
router.use(protect);

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: employees.length,
      employees
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.json({
      success: true,
      employee
    });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create employee
// @route   POST /api/employees
// @access  Admin/Manager only
router.post('/', authorize('admin', 'manager'), [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('position').trim().notEmpty().withMessage('Position is required'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('salary').isNumeric().withMessage('Valid salary is required'),
  body('status').isIn(['active', 'inactive', 'terminated', 'on-leave']).withMessage('Valid status is required')
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

    const { name, email, position, department, salary, status, phone, address, emergencyContact, benefits, notes } = req.body;

    // Check if employee with email already exists
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: 'Employee with this email already exists'
      });
    }

    // Create employee
    const employee = await Employee.create({
      name,
      email,
      position,
      department,
      salary,
      status,
      phone,
      address,
      emergencyContact,
      benefits,
      notes,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      employee
    });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Admin/Manager only
router.put('/:id', authorize('admin', 'manager'), [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('position').optional().trim().notEmpty().withMessage('Position cannot be empty'),
  body('department').optional().trim().notEmpty().withMessage('Department cannot be empty'),
  body('salary').optional().isNumeric().withMessage('Valid salary is required'),
  body('status').optional().isIn(['active', 'inactive', 'terminated', 'on-leave']).withMessage('Valid status is required')
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

    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Check if email is being changed and if it already exists
    if (req.body.email && req.body.email !== employee.email) {
      const existingEmployee = await Employee.findOne({ email: req.body.email });
      if (existingEmployee) {
        return res.status(400).json({
          success: false,
          message: 'Employee with this email already exists'
        });
      }
    }

    // Update employee
    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedBy: req.user.id
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      employee: updatedEmployee
    });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Admin only
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    await Employee.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 