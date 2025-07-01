const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const Timesheet = require('../models/Timesheet');

const router = express.Router();

// All routes require authentication
router.use(protect);

// @desc    Get payroll summary
// @route   GET /api/reports/payroll-summary
// @access  Admin/Manager only
router.get('/payroll-summary', authorize('admin', 'manager'), async (req, res) => {
  try {
    // Aggregate payroll statistics
    const payrollAgg = await Payroll.aggregate([
      {
        $group: {
          _id: null,
          totalPayroll: { $sum: "$totalAmount" },
          totalNetPay: { $sum: "$netAmount" },
          totalTaxes: { $sum: "$taxes" },
          totalDeductions: { $sum: "$deductions" },
          payrollCount: { $sum: 1 }
        }
      }
    ]);
    const payrollStats = payrollAgg[0] || {
      totalPayroll: 0,
      totalNetPay: 0,
      totalTaxes: 0,
      totalDeductions: 0,
      payrollCount: 0
    };
    // Count active employees
    const employeeCount = await Employee.countDocuments({ status: 'active' });
    res.json({
      success: true,
      data: {
        ...payrollStats,
        employeeCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get employee performance report
// @route   GET /api/reports/employee-performance
// @access  Admin/Manager only
router.get('/employee-performance', authorize('admin', 'manager'), async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Get employee performance report - TODO: Implement'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get timesheet report
// @route   GET /api/reports/timesheet
// @access  Admin/Manager only
router.get('/timesheet', authorize('admin', 'manager'), async (req, res) => {
  try {
    // Aggregate timesheet statistics
    const agg = await Timesheet.aggregate([
      {
        $group: {
          _id: null,
          totalTimesheets: { $sum: 1 },
          totalHours: { $sum: "$totalHours" },
          totalOvertime: { $sum: "$overtimeHours" },
          avgHours: { $avg: "$totalHours" }
        }
      }
    ]);
    const stats = agg[0] || {
      totalTimesheets: 0,
      totalHours: 0,
      totalOvertime: 0,
      avgHours: 0
    };
    // Count by status
    const [approved, pending, rejected] = await Promise.all([
      Timesheet.countDocuments({ status: 'approved' }),
      Timesheet.countDocuments({ status: 'pending' }),
      Timesheet.countDocuments({ status: 'rejected' })
    ]);
    res.json({
      success: true,
      data: {
        ...stats,
        approved,
        pending,
        rejected
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get department summary
// @route   GET /api/reports/department-summary
// @access  Admin/Manager only
router.get('/department-summary', authorize('admin', 'manager'), async (req, res) => {
  try {
    const summary = await Timesheet.aggregate([
      {
        $lookup: {
          from: "employees",
          localField: "employee",
          foreignField: "_id",
          as: "employee"
        }
      },
      { $unwind: "$employee" },
      {
        $group: {
          _id: "$employee.department",
          totalHours: { $sum: "$totalHours" },
          totalOvertime: { $sum: "$overtimeHours" },
          timesheetCount: { $sum: 1 },
          employees: { $addToSet: "$employee._id" }
        }
      },
      {
        $project: {
          _id: 0,
          department: "$_id",
          totalHours: 1,
          totalOvertime: 1,
          timesheetCount: 1,
          employeeCount: { $size: "$employees" }
        }
      },
      { $sort: { department: 1 } }
    ]);
    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Export report to CSV
// @route   GET /api/reports/export/:type
// @access  Admin only
router.get('/export/:type', authorize('admin'), async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Export report - TODO: Implement'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get top employees by hours worked
// @route   GET /api/reports/top-employees
// @access  Admin/Manager only
router.get('/top-employees', authorize('admin', 'manager'), async (req, res) => {
  try {
    const leaders = await Timesheet.aggregate([
      {
        $group: {
          _id: "$employee",
          totalHours: { $sum: "$totalHours" },
          totalOvertime: { $sum: "$overtimeHours" },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalHours: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "employees",
          localField: "_id",
          foreignField: "_id",
          as: "employee"
        }
      },
      { $unwind: "$employee" },
      {
        $project: {
          _id: 0,
          employeeId: "$employee._id",
          name: "$employee.name",
          email: "$employee.email",
          department: "$employee.department",
          position: "$employee.position",
          totalHours: 1,
          totalOvertime: 1,
          timesheetCount: "$count"
        }
      }
    ]);
    res.json({ success: true, data: leaders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get timesheet trends over time (monthly)
// @route   GET /api/reports/timesheet-trends
// @access  Admin/Manager only
router.get('/timesheet-trends', authorize('admin', 'manager'), async (req, res) => {
  try {
    const trends = await Timesheet.aggregate([
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" } },
          totalHours: { $sum: "$totalHours" },
          totalOvertime: { $sum: "$overtimeHours" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          totalHours: 1,
          totalOvertime: 1,
          timesheetCount: "$count"
        }
      }
    ]);
    res.json({ success: true, data: trends });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get overtime leaders (top employees by overtime hours)
// @route   GET /api/reports/overtime-leaders
// @access  Admin/Manager only
router.get('/overtime-leaders', authorize('admin', 'manager'), async (req, res) => {
  try {
    const leaders = await Timesheet.aggregate([
      {
        $group: {
          _id: "$employee",
          totalOvertime: { $sum: "$overtimeHours" },
          totalHours: { $sum: "$totalHours" },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalOvertime: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "employees",
          localField: "_id",
          foreignField: "_id",
          as: "employee"
        }
      },
      { $unwind: "$employee" },
      {
        $project: {
          _id: 0,
          employeeId: "$employee._id",
          name: "$employee.name",
          email: "$employee.email",
          department: "$employee.department",
          position: "$employee.position",
          totalOvertime: 1,
          totalHours: 1,
          timesheetCount: "$count"
        }
      }
    ]);
    res.json({ success: true, data: leaders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router; 