const mongoose = require('mongoose');
const Job = require('../models/Job');
const Application = require('../models/Application');

/**
 * Helper to safely escape regular expressions to avoid ReDoS
 */
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

/**
 * @desc    Get all open jobs with server-side filtering, search, and pagination
 * @route   GET /api/jobs
 * @access  Public
 */
exports.getJobs = async (req, res) => {
  try {
    const {
      search,
      crop,
      workType,
      location,
      minWage,
      maxWage,
      wageType,
      startDate,
      page,
      limit
    } = req.query;

    // Filter strictly for published open jobs
    const query = { status: 'open' };

    // Search keyword across title, crop, description, location, village, district, state
    if (search && typeof search === 'string' && search.trim()) {
      const sanitized = escapeRegex(search.trim());
      const searchRegex = new RegExp(sanitized, 'i');
      query.$or = [
        { title: searchRegex },
        { crop: searchRegex },
        { description: searchRegex },
        { location: searchRegex },
        { village: searchRegex },
        { district: searchRegex },
        { state: searchRegex }
      ];
    }

    // Filter by Crop
    if (crop && typeof crop === 'string' && crop.trim()) {
      const sanitizedCrop = escapeRegex(crop.trim());
      query.crop = new RegExp(`^${sanitizedCrop}$`, 'i');
    }

    // Filter by Work Type
    if (workType && typeof workType === 'string' && workType.trim()) {
      const sanitizedWorkType = escapeRegex(workType.trim());
      query.workType = new RegExp(`^${sanitizedWorkType}$`, 'i');
    }

    // Filter by Location
    if (location && typeof location === 'string' && location.trim()) {
      const sanitizedLocation = escapeRegex(location.trim());
      const locRegex = new RegExp(sanitizedLocation, 'i');
      const locOr = [
        { location: locRegex },
        { village: locRegex },
        { district: locRegex },
        { state: locRegex }
      ];
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: locOr }];
        delete query.$or;
      } else {
        query.$or = locOr;
      }
    }

    // Filter by Wage Type
    if (wageType && ['daily', 'hourly', 'fixed'].includes(wageType)) {
      query.wageType = wageType;
    }

    // Filter by Wage Range
    const parsedMinWage = Number(minWage);
    const parsedMaxWage = Number(maxWage);
    if (!isNaN(parsedMinWage) && parsedMinWage >= 0) {
      query.wageAmount = { ...(query.wageAmount || {}), $gte: parsedMinWage };
    }
    if (!isNaN(parsedMaxWage) && parsedMaxWage > 0) {
      query.wageAmount = { ...(query.wageAmount || {}), $lte: parsedMaxWage };
    }

    // Filter by Start Date
    if (startDate) {
      const parsedDate = new Date(startDate);
      if (!isNaN(parsedDate.getTime())) {
        query.startDate = { $gte: parsedDate };
      }
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('farmer', 'name farmName location farmType');

    return res.status(200).json({
      success: true,
      data: jobs,
      jobs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 0
      }
    });

  } catch (error) {
    console.error('Get Jobs Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while discovering jobs'
    });
  }
};

/**
 * @desc    Create a new job posting
 * @route   POST /api/jobs
 * @access  Private (Farmer only)
 */
exports.createJob = async (req, res) => {
  try {
    const {
      title,
      crop,
      workType,
      workersRequired,
      wageAmount,
      wageType,
      startDate,
      durationValue,
      durationUnit,
      location,
      village,
      district,
      state,
      latitude,
      longitude,
      description
    } = req.body;

    // Required fields validation
    const missingFields = [];
    if (!title) missingFields.push('title');
    if (!crop) missingFields.push('crop');
    if (!workType) missingFields.push('workType');
    if (workersRequired === undefined || workersRequired === null) missingFields.push('workersRequired');
    if (wageAmount === undefined || wageAmount === null) missingFields.push('wageAmount');
    if (!startDate) missingFields.push('startDate');
    if (durationValue === undefined || durationValue === null) missingFields.push('durationValue');
    if (!location) missingFields.push('location');
    if (!description) missingFields.push('description');

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Please correct the highlighted fields.',
        errors: missingFields.map(field => `${field} is required`)
      });
    }

    // Number validations
    const parsedWorkers = Number(workersRequired);
    const parsedWage = Number(wageAmount);
    const parsedDuration = Number(durationValue);

    if (isNaN(parsedWorkers) || parsedWorkers < 1) {
      return res.status(400).json({
        success: false,
        message: 'Workers required must be a positive integer'
      });
    }

    if (isNaN(parsedWage) || parsedWage <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Wage amount must be a positive number'
      });
    }

    if (isNaN(parsedDuration) || parsedDuration <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Duration value must be a positive number'
      });
    }

    // Date validation
    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid start date'
      });
    }

    // Reject past start dates (accounting for timezone differences by zeroing time)
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);

    const startMidnight = new Date(start);
    startMidnight.setHours(0, 0, 0, 0);

    if (startMidnight < todayMidnight) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be in the past'
      });
    }

    // Enum validations
    const validWageTypes = ['daily', 'hourly', 'fixed'];
    const selectedWageType = wageType || 'daily';
    if (!validWageTypes.includes(selectedWageType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid wageType. Allowed values: ${validWageTypes.join(', ')}`
      });
    }

    const validDurationUnits = ['hours', 'days', 'weeks'];
    const selectedDurationUnit = durationUnit || 'days';
    if (!validDurationUnits.includes(selectedDurationUnit)) {
      return res.status(400).json({
        success: false,
        message: `Invalid durationUnit. Allowed values: ${validDurationUnits.join(', ')}`
      });
    }

    // Derive farmer ID strictly from authenticated session token
    const job = await Job.create({
      farmer: req.user._id,
      title: title.trim(),
      crop: crop.trim(),
      workType: workType.trim(),
      workersRequired: parsedWorkers,
      wageAmount: parsedWage,
      wageType: selectedWageType,
      startDate: start,
      durationValue: parsedDuration,
      durationUnit: selectedDurationUnit,
      location: location.trim(),
      village: village ? village.trim() : '',
      district: district ? district.trim() : '',
      state: state ? state.trim() : '',
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      description: description.trim(),
      status: 'open'
    });

    const populatedJob = await Job.findById(job._id).populate(
      'farmer',
      'name email phone location farmName farmType'
    );

    return res.status(201).json({
      success: true,
      message: 'Job created successfully.',
      job: populatedJob
    });

  } catch (error) {
    console.error('Create Job Error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Please correct the highlighted fields.',
        errors: messages
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error while creating job post'
    });
  }
};

/**
 * @desc    Get all jobs created by the authenticated farmer
 * @route   GET /api/jobs/my-jobs
 * @access  Private (Farmer only)
 */
exports.getMyJobs = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = { farmer: req.user._id };

    if (req.query.status) {
      const allowed = ['open', 'closed', 'completed'];
      if (allowed.includes(req.query.status)) {
        query.status = req.query.status;
      }
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [{ title: searchRegex }, { crop: searchRegex }, { location: searchRegex }];
    }

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('farmer', 'name email phone location farmName farmType');

    // Calculate status breakdown for statistics
    const statsResult = await Job.aggregate([
      { $match: { farmer: new mongoose.Types.ObjectId(req.user._id) } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const stats = {
      total: 0,
      open: 0,
      closed: 0,
      completed: 0
    };

    statsResult.forEach(item => {
      stats[item._id] = item.count;
      stats.total += item.count;
    });

    // Aggregate application metrics across all jobs owned by this farmer
    const allFarmerJobIds = await Job.find({ farmer: req.user._id }).distinct('_id');

    const appStatsAgg = await Application.aggregate([
      { $match: { job: { $in: allFarmerJobIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const applicationStats = {
      total: 0,
      pending: 0,
      accepted: 0,
      rejected: 0,
      withdrawn: 0
    };

    appStatsAgg.forEach(item => {
      if (applicationStats[item._id] !== undefined) {
        applicationStats[item._id] = item.count;
      }
      applicationStats.total += item.count;
    });

    stats.totalApplications = applicationStats.total;
    stats.pendingApplications = applicationStats.pending;
    stats.acceptedWorkers = applicationStats.accepted;
    stats.rejectedApplications = applicationStats.rejected;
    stats.withdrawnApplications = applicationStats.withdrawn;

    // Aggregate per-job applicant counts for the returned page of jobs
    const pageJobIds = jobs.map(j => j._id);
    const perJobAgg = await Application.aggregate([
      { $match: { job: { $in: pageJobIds } } },
      {
        $group: {
          _id: { job: '$job', status: '$status' },
          count: { $sum: 1 }
        }
      }
    ]);

    const jobApplicantCountMap = {};
    perJobAgg.forEach(item => {
      const jobId = item._id.job.toString();
      if (!jobApplicantCountMap[jobId]) {
        jobApplicantCountMap[jobId] = {
          total: 0,
          pending: 0,
          accepted: 0,
          rejected: 0,
          withdrawn: 0
        };
      }
      jobApplicantCountMap[jobId][item._id.status] = item.count;
      jobApplicantCountMap[jobId].total += item.count;
    });

    const jobsWithCounts = jobs.map(job => {
      const jobObj = job.toObject();
      jobObj.applicantCounts = jobApplicantCountMap[job._id.toString()] || {
        total: 0,
        pending: 0,
        accepted: 0,
        rejected: 0,
        withdrawn: 0
      };
      return jobObj;
    });

    return res.status(200).json({
      success: true,
      count: jobsWithCounts.length,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      stats,
      applicationStats,
      jobs: jobsWithCounts
    });

  } catch (error) {
    console.error('Get My Jobs Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while retrieving farmer jobs'
    });
  }
};

/**
 * @desc    Get single job details
 * @route   GET /api/jobs/:id
 * @access  Public / Authenticated
 */
exports.getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job ID format'
      });
    }

    const job = await Job.findById(id).populate(
      'farmer',
      'name email phone location farmName farmType'
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or inaccessible'
      });
    }

    const isOwnerFarmer =
      req.user &&
      req.user.role === 'farmer' &&
      job.farmer._id.toString() === req.user._id.toString();

    // If job is closed or completed:
    if (job.status !== 'open') {
      if (isOwnerFarmer) {
        // Owner farmer can view and manage their own job in any status
        return res.status(200).json({
          success: true,
          job
        });
      }
      return res.status(404).json({
        success: false,
        message: 'Job not found or is no longer open'
      });
    }

    // Job is open: strip confidential contact details (email, phone) for non-owners
    let safeJob = job.toObject();
    if (!isOwnerFarmer && safeJob.farmer) {
      delete safeJob.farmer.email;
      delete safeJob.farmer.phone;
    }

    // If requester is an authenticated worker, check if they have applied
    let hasApplied = false;
    let application = null;
    if (req.user && req.user.role === 'worker') {
      const existingApp = await Application.findOne({
        job: job._id,
        worker: req.user._id
      });
      if (existingApp) {
        hasApplied = true;
        application = {
          _id: existingApp._id,
          status: existingApp.status,
          createdAt: existingApp.createdAt
        };
      }
    }

    return res.status(200).json({
      success: true,
      job: safeJob,
      hasApplied,
      application
    });

  } catch (error) {
    console.error('Get Job By ID Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching job details'
    });
  }
};

/**
 * @desc    Update an existing job
 * @route   PUT /api/jobs/:id
 * @access  Private (Farmer only)
 */
exports.updateJob = async (req, res) => {
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
        message: 'Job not found or inaccessible'
      });
    }

    // Ownership check
    if (job.farmer.toString() !== req.user._id.toString()) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or inaccessible'
      });
    }

    // Prevent editing completed jobs
    if (job.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Completed jobs cannot be edited'
      });
    }

    const {
      title,
      crop,
      workType,
      workersRequired,
      wageAmount,
      wageType,
      startDate,
      durationValue,
      durationUnit,
      location,
      village,
      district,
      state,
      description
    } = req.body;

    // Validate updated fields if provided
    if (title) job.title = title.trim();
    if (crop) job.crop = crop.trim();
    if (workType) job.workType = workType.trim();

    if (workersRequired !== undefined) {
      const parsedWorkers = Number(workersRequired);
      if (isNaN(parsedWorkers) || parsedWorkers < 1) {
        return res.status(400).json({
          success: false,
          message: 'Workers required must be a positive integer'
        });
      }
      job.workersRequired = parsedWorkers;
    }

    if (wageAmount !== undefined) {
      const parsedWage = Number(wageAmount);
      if (isNaN(parsedWage) || parsedWage <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Wage amount must be a positive number'
        });
      }
      job.wageAmount = parsedWage;
    }

    if (wageType) {
      const validWageTypes = ['daily', 'hourly', 'fixed'];
      if (!validWageTypes.includes(wageType)) {
        return res.status(400).json({
          success: false,
          message: `Invalid wageType. Allowed values: ${validWageTypes.join(', ')}`
        });
      }
      job.wageType = wageType;
    }

    if (startDate) {
      const start = new Date(startDate);
      if (isNaN(start.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid start date'
        });
      }
      job.startDate = start;
    }

    if (durationValue !== undefined) {
      const parsedDuration = Number(durationValue);
      if (isNaN(parsedDuration) || parsedDuration <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Duration value must be a positive number'
        });
      }
      job.durationValue = parsedDuration;
    }

    if (durationUnit) {
      const validDurationUnits = ['hours', 'days', 'weeks'];
      if (!validDurationUnits.includes(durationUnit)) {
        return res.status(400).json({
          success: false,
          message: `Invalid durationUnit. Allowed values: ${validDurationUnits.join(', ')}`
        });
      }
      job.durationUnit = durationUnit;
    }

    if (location) job.location = location.trim();
    if (village !== undefined) job.village = village.trim();
    if (district !== undefined) job.district = district.trim();
    if (state !== undefined) job.state = state.trim();
    if (description) job.description = description.trim();

    // Ensure farmer field remains untouched
    job.farmer = req.user._id;

    await job.save();

    const updatedJob = await Job.findById(job._id).populate(
      'farmer',
      'name email phone location farmName farmType'
    );

    return res.status(200).json({
      success: true,
      message: 'Job updated successfully.',
      job: updatedJob
    });

  } catch (error) {
    console.error('Update Job Error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Please correct the highlighted fields.',
        errors: messages
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error while updating job'
    });
  }
};

/**
 * @desc    Update job status (open, closed, completed)
 * @route   PATCH /api/jobs/:id/status
 * @access  Private (Farmer only)
 */
exports.updateJobStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job ID format'
      });
    }

    const allowedStatuses = ['open', 'closed', 'completed'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}`
      });
    }

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or inaccessible'
      });
    }

    // Ownership check
    if (job.farmer.toString() !== req.user._id.toString()) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or inaccessible'
      });
    }

    // Status transition rules:
    // Completed jobs cannot change status
    if (job.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Completed jobs cannot be reopened or changed'
      });
    }

    job.status = status;
    await job.save();

    const updatedJob = await Job.findById(job._id).populate(
      'farmer',
      'name email phone location farmName farmType'
    );

    return res.status(200).json({
      success: true,
      message: `Job status changed to '${status}'.`,
      job: updatedJob
    });

  } catch (error) {
    console.error('Update Job Status Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating job status'
    });
  }
};

/**
 * @desc    Delete a job
 * @route   DELETE /api/jobs/:id
 * @access  Private (Farmer only)
 */
exports.deleteJob = async (req, res) => {
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
        message: 'Job not found or inaccessible'
      });
    }

    // Ownership check
    if (job.farmer.toString() !== req.user._id.toString()) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or inaccessible'
      });
    }

    await job.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Job deleted successfully.'
    });

  } catch (error) {
    console.error('Delete Job Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting job'
    });
  }
};

/**
 * @desc    Apply for an open job
 * @route   POST /api/jobs/:id/apply
 * @access  Private (Worker only)
 */
exports.applyForJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

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

    // Verify job is currently open
    if (job.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Cannot apply: This job is no longer open for applications'
      });
    }

    // Prevent a worker from applying to their own job if applicable
    if (job.farmer.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot apply to your own job posting'
      });
    }

    // Validate optional message length
    let applicationMessage = '';
    if (message !== undefined && message !== null) {
      if (typeof message !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Application message must be text'
        });
      }
      applicationMessage = message.trim();
      if (applicationMessage.length > 500) {
        return res.status(400).json({
          success: false,
          message: 'Application message cannot exceed 500 characters'
        });
      }
    }

    // Check duplicate application at application layer
    const existingApplication = await Application.findOne({
      job: job._id,
      worker: req.user._id
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // Save application to MongoDB
    const application = await Application.create({
      job: job._id,
      worker: req.user._id,
      message: applicationMessage,
      status: 'pending'
    });

    const populatedApp = await Application.findById(application._id)
      .populate('job', 'title crop location wageAmount wageType startDate durationValue durationUnit status')
      .populate('worker', 'name phone location skills experience');

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application: populatedApp
    });

  } catch (error) {
    console.error('Apply For Job Error:', error);

    // Handle MongoDB unique compound index duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error while submitting job application'
    });
  }
};
