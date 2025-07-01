const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  period: {
    type: String,
    required: [true, 'Please provide payroll period'],
    trim: true
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please provide end date']
  },
  type: {
    type: String,
    enum: ['weekly', 'biweekly', 'monthly'],
    required: [true, 'Please provide payroll type']
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'processed', 'paid', 'cancelled'],
    default: 'draft'
  },
  totalAmount: {
    type: Number,
    required: [true, 'Please provide total amount'],
    min: [0, 'Total amount cannot be negative']
  },
  employeeCount: {
    type: Number,
    required: [true, 'Please provide employee count'],
    min: [0, 'Employee count cannot be negative']
  },
  deductions: {
    type: Number,
    default: 0,
    min: [0, 'Deductions cannot be negative']
  },
  taxes: {
    type: Number,
    default: 0,
    min: [0, 'Taxes cannot be negative']
  },
  netAmount: {
    type: Number,
    required: [true, 'Please provide net amount'],
    min: [0, 'Net amount cannot be negative']
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  processedAt: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
  },
  payrollItems: [{
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true
    },
    baseSalary: {
      type: Number,
      required: true
    },
    hoursWorked: {
      type: Number,
      default: 0
    },
    overtimeHours: {
      type: Number,
      default: 0
    },
    overtimeRate: {
      type: Number,
      default: 0
    },
    overtimePay: {
      type: Number,
      default: 0
    },
    bonuses: {
      type: Number,
      default: 0
    },
    customBonuses: {
      type: Number,
      default: 0
    },
    allowances: {
      type: Number,
      default: 0
    },
    deductions: {
      type: Number,
      default: 0
    },
    customDeductions: {
      type: Number,
      default: 0
    },
    taxes: {
      type: Number,
      default: 0
    },
    netPay: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'cancelled'],
      default: 'pending'
    }
  }],
  paymentMethod: {
    type: String,
    enum: ['direct_deposit', 'check', 'cash'],
    default: 'direct_deposit'
  },
  paymentDate: {
    type: Date
  },
  reference: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

// Generate reference number before saving
payrollSchema.pre('save', function(next) {
  if (!this.reference) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.reference = `PAY-${year}${month}-${random}`;
  }
  next();
});

// Index for better query performance
payrollSchema.index({ period: 1 });
payrollSchema.index({ status: 1 });
payrollSchema.index({ processedBy: 1 });
payrollSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('Payroll', payrollSchema); 