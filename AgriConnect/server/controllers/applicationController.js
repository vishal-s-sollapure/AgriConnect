const mongoose = require('mongoose');
const Application = require('../models/Application');
const Job = require('../models/Job');

/**
 * In-process per-job mutex to serialize acceptance operations on the same job
 * and guarantee capacity is never exceeded even under high concurrent load
 */
const jobHiringLocks = new Map();

async function acquireJobLock(jobId) {
  while (jobHiringLocks.has(jobId)) {
    await jobHiringLocks.get(jobId);
  }
  let release;
  const promise = new Promise(resolve => {
    release = resolve;
  });
  jobHiringLocks.set(jobId, promise);
  return () => {
    jobHiringLocks.delete(jobId);
    release();
  };
}

/**
 * @desc    Get all applications for the authenticated worker
 * @route   GET /api/applications/my-applications
 * @access  Private (Worker only)
 */
exports.getMyApplications = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const query = { worker: req.user._id };

    if (req.query.status) {
      const allowed = ['pending', 'accepted', 'rejected', 'withdrawn'];
      if (allowed.includes(req.query.status)) {
        query.status = req.query.status;
      }
    }

    const total = await Application.countDocuments(query);
    const applications = await Application.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate(
        'job',
        'title crop workType wageAmount wageType startDate durationValue durationUnit location village district state status'
      );

    // Calculate status breakdown for dashboard stats
    const statsResult = await Application.aggregate([
      { $match: { worker: new mongoose.Types.ObjectId(req.user._id) } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const stats = {
      total: 0,
      pending: 0,
      accepted: 0,
      rejected: 0,
      withdrawn: 0
    };

    statsResult.forEach(item => {
      stats[item._id] = item.count;
      stats.total += item.count;
    });

    return res.status(200).json({
      success: true,
      data: applications,
      applications,
      stats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 0
      }
    });

  } catch (error) {
    console.error('Get My Applications Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching your applications'
    });
  }
};

/**
 * @desc    Withdraw a pending application
 * @route   PATCH /api/applications/:id/withdraw
 * @access  Private (Worker only)
 */
exports.withdrawApplication = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application ID format'
      });
    }

    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Ownership check: only the worker who owns the application can withdraw it
    if (application.worker.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only withdraw your own applications'
      });
    }

    // Status transition rule: only pending applications can be withdrawn
    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot withdraw application with status '${application.status}'. Only pending applications can be withdrawn.`
      });
    }

    application.status = 'withdrawn';
    await application.save();

    const updatedApp = await Application.findById(application._id).populate(
      'job',
      'title crop workType wageAmount wageType startDate durationValue durationUnit location status'
    );

    return res.status(200).json({
      success: true,
      message: 'Application withdrawn successfully',
      application: updatedApp
    });

  } catch (error) {
    console.error('Withdraw Application Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while withdrawing application'
    });
  }
};

/**
 * @desc    Get all applications for a specific job (Farmer only)
 * @route   GET /api/jobs/:id/applications
 * @access  Private (Farmer only)
 */
exports.getJobApplications = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job ID format'
      });
    }

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Ownership check: only the farmer who created the job can view its applicants
    if (job.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only view applicants for your own jobs'
      });
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const query = { job: job._id };

    if (req.query.status) {
      const allowed = ['pending', 'accepted', 'rejected', 'withdrawn'];
      if (allowed.includes(req.query.status)) {
        query.status = req.query.status;
      }
    }

    // Overall hiring summary for this job
    const summaryAgg = await Application.aggregate([
      { $match: { job: job._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const summary = {
      total: 0,
      pending: 0,
      accepted: 0,
      rejected: 0,
      withdrawn: 0,
      workersRequired: job.workersRequired,
      remainingVacancies: job.workersRequired,
      isFullyStaffed: false
    };

    summaryAgg.forEach(item => {
      summary[item._id] = item.count;
      summary.total += item.count;
    });

    summary.remainingVacancies = Math.max(0, job.workersRequired - summary.accepted);
    summary.isFullyStaffed = summary.accepted >= job.workersRequired;

    const totalFiltered = await Application.countDocuments(query);
    const applications = await Application.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('worker', 'name location skills experience availability preferredRadius profileImage phone');

    // Safe worker projection:
    // Only reveal worker's contact number if the application is accepted
    const safeApplications = applications.map(app => {
      const appObj = app.toObject();
      if (appObj.worker) {
        if (appObj.status !== 'accepted') {
          delete appObj.worker.phone;
        }
      }
      return appObj;
    });

    return res.status(200).json({
      success: true,
      job: {
        _id: job._id,
        id: job._id,
        title: job.title,
        crop: job.crop,
        workType: job.workType,
        workersRequired: job.workersRequired,
        wageAmount: job.wageAmount,
        wageType: job.wageType,
        startDate: job.startDate,
        status: job.status
      },
      summary,
      data: safeApplications,
      applications: safeApplications,
      pagination: {
        page,
        limit,
        total: totalFiltered,
        totalPages: Math.ceil(totalFiltered / limit) || 0
      }
    });
  } catch (error) {
    console.error('Get Job Applications Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching job applications'
    });
  }
};

/**
 * @desc    Accept or reject an application (Farmer only)
 * @route   PATCH /api/applications/:id/status
 * @access  Private (Farmer only)
 */
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application ID format'
      });
    }

    const allowed = ['accepted', 'rejected'];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value. Allowed status decisions: 'accepted' or 'rejected'"
      });
    }

    // Reject attempts to modify unauthorized/protected fields
    const disallowedFields = Object.keys(req.body).filter(k => k !== 'status');
    if (disallowedFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Modification of protected application fields is strictly prohibited'
      });
    }

    const application = await Application.findById(id).populate('job');
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const job = application.job;
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Associated job record not found'
      });
    }

    // Ownership check: farmer must own the job associated with the application
    if (job.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only make hiring decisions for your own jobs'
      });
    }

    // Transition rule: only pending applications can be accepted or rejected
    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot change status: Only pending applications can be accepted or rejected. Current status is '${application.status}'`
      });
    }

    // Check completed job status
    if (job.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot make hiring decisions on a completed job'
      });
    }

    if (status === 'accepted') {
      // Serialize acceptance check for this job to prevent concurrent overselling of positions
      const releaseLock = await acquireJobLock(job._id.toString());
      try {
        // Count current accepted applications for this job
        const acceptedCount = await Application.countDocuments({
          job: job._id,
          status: 'accepted'
        });

        if (acceptedCount >= job.workersRequired) {
          return res.status(400).json({
            success: false,
            message: `Cannot accept application: Hiring capacity for this job is full (${job.workersRequired}/${job.workersRequired} positions filled)`
          });
        }

        // Atomically update application status from pending to accepted
        const updatedApp = await Application.findOneAndUpdate(
          { _id: application._id, status: 'pending' },
          { status: 'accepted' },
          { returnDocument: 'after' }
        ).populate('worker', 'name location skills experience availability preferredRadius profileImage phone')
         .populate('job', 'title crop workersRequired status');

        if (!updatedApp) {
          return res.status(400).json({
            success: false,
            message: 'Application status could not be updated (no longer pending)'
          });
        }

        const newAcceptedCount = acceptedCount + 1;
        const isFullyStaffed = newAcceptedCount >= job.workersRequired;

        return res.status(200).json({
          success: true,
          message: isFullyStaffed
            ? `Application accepted successfully. Job is now fully staffed (${newAcceptedCount}/${job.workersRequired}).`
            : `Application accepted successfully (${newAcceptedCount}/${job.workersRequired} hired).`,
          application: updatedApp,
          hiringProgress: {
            acceptedCount: newAcceptedCount,
            workersRequired: job.workersRequired,
            remainingVacancies: Math.max(0, job.workersRequired - newAcceptedCount),
            isFullyStaffed
          }
        });
      } finally {
        releaseLock();
      }
    } else {
      // status === 'rejected'
      const updatedApp = await Application.findOneAndUpdate(
        { _id: application._id, status: 'pending' },
        { status: 'rejected' },
        { returnDocument: 'after' }
      ).populate('worker', 'name location skills experience availability preferredRadius profileImage')
       .populate('job', 'title crop workersRequired status');

      if (!updatedApp) {
        return res.status(400).json({
          success: false,
          message: 'Application status could not be updated (no longer pending)'
        });
      }

      const acceptedCount = await Application.countDocuments({
        job: job._id,
        status: 'accepted'
      });

      return res.status(200).json({
        success: true,
        message: 'Application rejected.',
        application: updatedApp,
        hiringProgress: {
          acceptedCount,
          workersRequired: job.workersRequired,
          remainingVacancies: Math.max(0, job.workersRequired - acceptedCount),
          isFullyStaffed: acceptedCount >= job.workersRequired
        }
      });
    }
  } catch (error) {
    console.error('Update Application Status Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating application status'
    });
  }
};

/**
 * @desc    Get hiring summary statistics for a farmer's job
 * @route   GET /api/jobs/:id/hiring-summary
 * @access  Private (Farmer only)
 */
exports.getJobHiringSummary = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job ID format'
      });
    }

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only view hiring summary for your own jobs'
      });
    }

    const summaryAgg = await Application.aggregate([
      { $match: { job: job._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const summary = {
      jobId: job._id,
      title: job.title,
      crop: job.crop,
      jobStatus: job.status,
      workersRequired: job.workersRequired,
      totalApplications: 0,
      pendingApplications: 0,
      acceptedApplications: 0,
      rejectedApplications: 0,
      withdrawnApplications: 0,
      remainingVacancies: job.workersRequired,
      isFullyStaffed: false
    };

    summaryAgg.forEach(item => {
      summary[`${item._id}Applications`] = item.count;
      summary.totalApplications += item.count;
    });

    summary.remainingVacancies = Math.max(0, job.workersRequired - summary.acceptedApplications);
    summary.isFullyStaffed = summary.acceptedApplications >= job.workersRequired;

    return res.status(200).json({
      success: true,
      summary
    });
  } catch (error) {
    console.error('Get Hiring Summary Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while retrieving hiring summary'
    });
  }
};
