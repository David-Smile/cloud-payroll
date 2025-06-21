const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide employee name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide employee email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  position: {
    type: String,
    required: [true, 'Please provide employee position'],
    trim: true
  },
  department: {
    type: String,
    required: [true, 'Please provide employee department'],
    trim: true
  },
  salary: {
    type: Number,
    required: [true, 'Please provide employee salary'],
    min: [0, 'Salary cannot be negative']
  },
  hourlyRate: {
    type: Number,
    min: [0, 'Hourly rate cannot be negative']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'terminated', 'on-leave'],
    default: 'active'
  },
  hireDate: {
    type: Date,
    default: Date.now
  },
  terminationDate: {
    type: Date
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
    email: String
  },
  taxInfo: {
    ssn: {
      type: String,
      select: false // Hide SSN by default for security
    },
    taxWithholding: {
      type: Number,
      default: 0
    }
  },
  benefits: {
    healthInsurance: {
      type: Boolean,
      default: false
    },
    dentalInsurance: {
      type: Boolean,
      default: false
    },
    visionInsurance: {
      type: Boolean,
      default: false
    },
    retirementPlan: {
      type: Boolean,
      default: false
    }
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
  },
  avatar: {
    type: String,
    default: function() {
      return this.name ? this.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'E';
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for better query performance
employeeSchema.index({ department: 1 });
employeeSchema.index({ status: 1 });
employeeSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Employee', employeeSchema); 