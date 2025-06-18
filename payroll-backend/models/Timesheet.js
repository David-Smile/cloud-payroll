const mongoose = require('mongoose');

const timesheetSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Please provide employee']
  },
  date: {
    type: Date,
    required: [true, 'Please provide date'],
    default: Date.now
  },
  startTime: {
    type: String,
    required: [true, 'Please provide start time'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide valid time format (HH:MM)']
  },
  endTime: {
    type: String,
    required: [true, 'Please provide end time'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide valid time format (HH:MM)']
  },
  breakTime: {
    type: Number,
    default: 0,
    min: [0, 'Break time cannot be negative']
  },
  totalHours: {
    type: Number,
    required: [true, 'Please provide total hours'],
    min: [0, 'Total hours cannot be negative']
  },
  overtimeHours: {
    type: Number,
    default: 0,
    min: [0, 'Overtime hours cannot be negative']
  },
  project: {
    type: String,
    required: [true, 'Please provide project name'],
    trim: true
  },
  task: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    maxlength: [500, 'Rejection reason cannot be more than 500 characters']
  },
  hourlyRate: {
    type: Number,
    min: [0, 'Hourly rate cannot be negative']
  },
  totalPay: {
    type: Number,
    min: [0, 'Total pay cannot be negative']
  },
  location: {
    type: String,
    enum: ['office', 'remote', 'client-site', 'travel'],
    default: 'office'
  },
  tags: [{
    type: String,
    trim: true
  }],
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String
  }]
}, {
  timestamps: true
});

// Calculate total hours before saving
timesheetSchema.pre('save', function(next) {
  if (this.startTime && this.endTime) {
    const start = new Date(`2000-01-01T${this.startTime}:00`);
    const end = new Date(`2000-01-01T${this.endTime}:00`);
    
    // Handle overnight shifts
    if (end < start) {
      end.setDate(end.getDate() + 1);
    }
    
    const totalMinutes = (end - start) / (1000 * 60);
    const breakMinutes = this.breakTime || 0;
    const workMinutes = totalMinutes - breakMinutes;
    
    this.totalHours = Math.max(0, workMinutes / 60);
    
    // Calculate overtime (assuming 8 hours is regular work day)
    const regularHours = 8;
    this.overtimeHours = Math.max(0, this.totalHours - regularHours);
  }
  next();
});

// Index for better query performance
timesheetSchema.index({ employee: 1, date: 1 });
timesheetSchema.index({ status: 1 });
timesheetSchema.index({ project: 1 });
timesheetSchema.index({ approvedBy: 1 });
timesheetSchema.index({ date: 1 });

module.exports = mongoose.model('Timesheet', timesheetSchema); 