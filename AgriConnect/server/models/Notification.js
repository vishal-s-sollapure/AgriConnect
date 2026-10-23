const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: [
        'new_application',
        'application_accepted',
        'application_rejected',
        'application_withdrawn',
        'job_updated',
        'job_closed'
      ]
    },
    titleKey: {
      type: String,
      required: true
    },
    messageKey: {
      type: String,
      required: true
    },
    data: {
      jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
      applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
      jobTitle: { type: String, maxlength: 100 }
    },
    dedupeKey: {
      type: String,
      required: true,
      unique: true,
      maxlength: 240
    },
    readAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, readAt: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
