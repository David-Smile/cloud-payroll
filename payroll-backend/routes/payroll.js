const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');

const router = express.Router();

// All routes require authentication
router.use(protect);

// @desc    Get all payrolls
// @route   GET /api/payroll
// @access  Admin/Manager only
router.get('/', authorize('admin', 'manager'), async (req, res) => {
  try {
    const payrolls = await Payroll.find()
      .populate('processedBy', 'name email')
      .populate('payrollItems.employee', 'name email position department')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: payrolls.length,
      payrolls
    });
  } catch (error) {
    console.error('Get payrolls error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single payroll
// @route   GET /api/payroll/:id
// @access  Admin/Manager only
router.get('/:id', authorize('admin', 'manager'), async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id)
      .populate('processedBy', 'name email')
      .populate('payrollItems.employee', 'name email position department');
    
    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll not found'
      });
    }

    res.json({
      success: true,
      payroll
    });
  } catch (error) {
    console.error('Get payroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create payroll
// @route   POST /api/payroll
// @access  Admin only
router.post('/', authorize('admin'), [
  body('period').trim().notEmpty().withMessage('Period is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('type').isIn(['weekly', 'biweekly', 'monthly']).withMessage('Valid type is required')
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

    const { period, startDate, endDate, type, notes } = req.body;

    // Get active employees
    const employees = await Employee.find({ status: 'active' });
    
    if (employees.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No active employees found'
      });
    }

    // Calculate payroll items for each employee
    const payrollItems = employees.map(employee => {
      const baseSalary = employee.salary / 12; // Monthly salary
      const deductions = baseSalary * 0.15; // 15% deductions
      const taxes = baseSalary * 0.25; // 25% taxes
      const netPay = baseSalary - deductions - taxes;

      return {
        employee: employee._id,
        baseSalary,
        hoursWorked: 160, // Default 160 hours per month
        overtimeHours: 0,
        overtimeRate: 0,
        bonuses: 0,
        deductions,
        taxes,
        netPay,
        status: 'pending'
      };
    });

    // Calculate totals
    const totalAmount = payrollItems.reduce((sum, item) => sum + item.baseSalary, 0);
    const totalDeductions = payrollItems.reduce((sum, item) => sum + item.deductions, 0);
    const totalTaxes = payrollItems.reduce((sum, item) => sum + item.taxes, 0);
    const netAmount = payrollItems.reduce((sum, item) => sum + item.netPay, 0);

    // Create payroll
    const payroll = await Payroll.create({
      period,
      startDate,
      endDate,
      type,
      totalAmount,
      employeeCount: employees.length,
      deductions: totalDeductions,
      taxes: totalTaxes,
      netAmount,
      payrollItems,
      notes,
      processedBy: req.user.id,
      processedAt: Date.now()
    });

    const populatedPayroll = await Payroll.findById(payroll._id)
      .populate('processedBy', 'name email')
      .populate('payrollItems.employee', 'name email position department');

    res.status(201).json({
      success: true,
      payroll: populatedPayroll
    });
  } catch (error) {
    console.error('Create payroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update payroll
// @route   PUT /api/payroll/:id
// @access  Admin only
router.put('/:id', authorize('admin'), [
  body('period').optional().trim().notEmpty().withMessage('Period cannot be empty'),
  body('startDate').optional().isISO8601().withMessage('Valid start date is required'),
  body('endDate').optional().isISO8601().withMessage('Valid end date is required'),
  body('type').optional().isIn(['weekly', 'biweekly', 'monthly']).withMessage('Valid type is required')
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

    const payroll = await Payroll.findById(req.params.id);
    
    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll not found'
      });
    }

    // Only allow updates if payroll is in draft status
    if (payroll.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update payroll that is not in draft status'
      });
    }

    // Update payroll
    const updatedPayroll = await Payroll.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('processedBy', 'name email')
     .populate('payrollItems.employee', 'name email position department');

    res.json({
      success: true,
      payroll: updatedPayroll
    });
  } catch (error) {
    console.error('Update payroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Process payroll
// @route   POST /api/payroll/:id/process
// @access  Admin only
router.post('/:id/process', authorize('admin'), async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);
    
    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll not found'
      });
    }

    if (payroll.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Payroll is not in draft status'
      });
    }

    // Update payroll status to processed
    payroll.status = 'processed';
    payroll.processedAt = new Date();
    await payroll.save();

    const populatedPayroll = await Payroll.findById(payroll._id)
      .populate('processedBy', 'name email')
      .populate('payrollItems.employee', 'name email position department');

    res.json({
      success: true,
      payroll: populatedPayroll,
      message: 'Payroll processed successfully'
    });
  } catch (error) {
    console.error('Process payroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete payroll
// @route   DELETE /api/payroll/:id
// @access  Admin only
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);
    
    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll not found'
      });
    }

    // Only allow deletion if payroll is in draft status
    if (payroll.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete payroll that is not in draft status'
      });
    }

    await Payroll.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Payroll deleted successfully'
    });
  } catch (error) {
    console.error('Delete payroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 