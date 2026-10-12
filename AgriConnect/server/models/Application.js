const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job reference is required']
    },
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Worker reference is required']
    },
    message: {
      type: String,
      trim: true,
      maxlength: [500, 'Application message cannot exceed 500 characters'],
      default: ''
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'accepted', 'rejected', 'withdrawn'],
        message: 'Status must be pending, accepted, rejected, or withdrawn'
      },
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate applications by the same worker for the same job
applicationSchema.index({ job: 1, worker: 1 }, { unique: true });

// Performance indexes for querying worker applications and job applicants
applicationSchema.index({ worker: 1, createdAt: -1 });
applicationSchema.index({ job: 1, status: 1 });

module.exports = mongoose.model('Application', applicationSchema);
