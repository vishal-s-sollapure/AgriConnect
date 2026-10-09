const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Farmer identity is required']
    },
    title: {
      type: String,
      required: [true, 'Please provide a job title'],
      trim: true,
      minlength: [3, 'Job title must be at least 3 characters long'],
      maxlength: [100, 'Job title cannot exceed 100 characters']
    },
    crop: {
      type: String,
      required: [true, 'Please specify the crop type'],
      trim: true
    },
    workType: {
      type: String,
      required: [true, 'Please specify the work type'],
      trim: true
    },
    workersRequired: {
      type: Number,
      required: [true, 'Please specify the number of workers required'],
      min: [1, 'At least 1 worker is required']
    },
    wageAmount: {
      type: Number,
      required: [true, 'Please specify the wage amount'],
      min: [1, 'Wage amount must be greater than 0']
    },
    wageType: {
      type: String,
      required: [true, 'Please specify the wage type'],
      enum: {
        values: ['daily', 'hourly', 'fixed'],
        message: 'Wage type must be daily, hourly, or fixed'
      },
      default: 'daily'
    },
    startDate: {
      type: Date,
      required: [true, 'Please specify the start date']
    },
    durationValue: {
      type: Number,
      required: [true, 'Please specify the work duration'],
      min: [1, 'Duration value must be at least 1']
    },
    durationUnit: {
      type: String,
      required: [true, 'Please specify the duration unit'],
      enum: {
        values: ['hours', 'days', 'weeks'],
        message: 'Duration unit must be hours, days, or weeks'
      },
      default: 'days'
    },
    location: {
      type: String,
      required: [true, 'Please specify the farm location or village'],
      trim: true
    },
    village: {
      type: String,
      trim: true,
      default: ''
    },
    district: {
      type: String,
      trim: true,
      default: ''
    },
    state: {
      type: String,
      trim: true,
      default: ''
    },
    latitude: {
      type: Number,
      default: null
    },
    longitude: {
      type: Number,
      default: null
    },
    description: {
      type: String,
      required: [true, 'Please provide job details and description'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    status: {
      type: String,
      enum: {
        values: ['open', 'closed', 'completed'],
        message: 'Status must be open, closed, or completed'
      },
      default: 'open'
    }
  },
  {
    timestamps: true
  }
);

// Indexes for query performance
jobSchema.index({ farmer: 1, createdAt: -1 });
jobSchema.index({ status: 1 });

module.exports = mongoose.model('Job', jobSchema);
