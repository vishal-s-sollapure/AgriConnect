const assert = require('assert');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const { applyForJob, updateJob, updateJobStatus } = require('../controllers/jobController');
const {
  withdrawApplication,
  updateApplicationStatus
} = require('../controllers/applicationController');
const notificationController = require('../controllers/notificationController');

function createMockReqRes({ user, body = {}, params = {}, query = {} }) {
  const req = { user, body, params, query };
  const res = {
    statusCode: 200,
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.data = payload;
      return this;
    }
  };
  return { req, res };
}

async function callController(controller, options) {
  const { req, res } = createMockReqRes(options);
  await controller(req, res);
  return res;
}

async function createJob(farmer, title) {
  return Job.create({
    farmer: farmer._id,
    title,
    crop: 'Wheat',
    workType: 'Harvesting',
    workersRequired: 3,
    wageAmount: 600,
    wageType: 'daily',
    startDate: new Date(Date.now() + 86400000),
    durationValue: 2,
    durationUnit: 'days',
    location: 'Anand, Gujarat',
    description: 'Phase9 test job details',
    status: 'open'
  });
}

async function runPhase9Tests() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/agriconnect';
  await mongoose.connect(mongoUri);
  let farmer;
  let worker;
  let otherWorker;
  const createdJobIds = [];
  const createdApplicationIds = [];

  try {
    const fixtureUsers = await User.find({
      email: { $in: ['p9_farmer@agri.org', 'p9_worker@agri.org', 'p9_other_worker@agri.org'] }
    }).select('_id');
    await Notification.deleteMany({ recipient: { $in: fixtureUsers.map(user => user._id) } });
    await Notification.deleteMany({ dedupeKey: /^p9test:/ });
    await Job.deleteMany({ title: /Phase9Test/ });
    await User.deleteMany({ email: { $in: ['p9_farmer@agri.org', 'p9_worker@agri.org', 'p9_other_worker@agri.org'] } });
    farmer = await User.create({
      name: 'Phase9 Farmer',
      email: 'p9_farmer@agri.org',
      phone: '9876500001',
      password: 'Password123',
      role: 'farmer',
      location: 'Anand'
    });
    worker = await User.create({
      name: 'Phase9 Worker',
      email: 'p9_worker@agri.org',
      phone: '9876500002',
      password: 'Password123',
      role: 'worker',
      location: 'Anand'
    });
    otherWorker = await User.create({
      name: 'Phase9 Other Worker',
      email: 'p9_other_worker@agri.org',
      phone: '9876500003',
      password: 'Password123',
      role: 'worker',
      location: 'Anand'
    });

    const acceptedJob = await createJob(farmer, 'Phase9Test Accepted Event');
    createdJobIds.push(acceptedJob._id);
    const applied = await callController(applyForJob, {
      user: worker,
      params: { id: acceptedJob._id.toString() },
      body: { message: 'Phase9 test application' }
    });
    assert.strictEqual(applied.statusCode, 201, 'successful application is created');
    const applicationId = applied.data.application._id;
    createdApplicationIds.push(applicationId);
    assert.strictEqual(
      await Notification.countDocuments({ recipient: farmer._id, type: 'new_application', 'data.applicationId': applicationId }),
      1,
      'successful application notifies the job owner'
    );
    const missingJobApplication = await callController(applyForJob, {
      user: worker,
      params: { id: new mongoose.Types.ObjectId().toString() },
      body: {}
    });
    assert.strictEqual(missingJobApplication.statusCode, 404, 'application for a missing job fails');
    assert.strictEqual(await Notification.countDocuments({ recipient: farmer._id, type: 'new_application' }), 1, 'failed application does not create a notification');

    const foreignDecision = await callController(updateApplicationStatus, {
      user: otherWorker,
      params: { id: applicationId.toString() },
      body: { status: 'accepted' }
    });
    assert.strictEqual(foreignDecision.statusCode, 403, 'non-owner cannot decide an application');
    assert.strictEqual(await Notification.countDocuments({ recipient: worker._id, type: 'application_accepted' }), 0, 'unauthorized hiring attempt does not notify worker');

    const duplicateApply = await callController(applyForJob, {
      user: worker,
      params: { id: acceptedJob._id.toString() },
      body: {}
    });
    assert.strictEqual(duplicateApply.statusCode, 400, 'duplicate application is rejected');
    assert.strictEqual(await Notification.countDocuments({ recipient: farmer._id, type: 'new_application', 'data.jobId': acceptedJob._id }), 1, 'duplicate application does not duplicate notification');

    const accepted = await callController(updateApplicationStatus, {
      user: farmer,
      params: { id: applicationId.toString() },
      body: { status: 'accepted' }
    });
    assert.strictEqual(accepted.statusCode, 200, 'pending application can be accepted');
    assert.strictEqual(await Notification.countDocuments({ recipient: worker._id, type: 'application_accepted', 'data.applicationId': applicationId }), 1, 'accepted worker receives one notification');
    const repeatedAccept = await callController(updateApplicationStatus, {
      user: farmer,
      params: { id: applicationId.toString() },
      body: { status: 'accepted' }
    });
    assert.strictEqual(repeatedAccept.statusCode, 400, 'unchanged status transition is rejected');
    assert.strictEqual(await Notification.countDocuments({ recipient: worker._id, type: 'application_accepted', 'data.applicationId': applicationId }), 1, 'repeated acceptance does not create another notification');

    const rejectedJob = await createJob(farmer, 'Phase9Test Rejected Event');
    createdJobIds.push(rejectedJob._id);
    const rejectApply = await callController(applyForJob, {
      user: otherWorker,
      params: { id: rejectedJob._id.toString() },
      body: {}
    });
    const rejectedApplicationId = rejectApply.data.application._id;
    createdApplicationIds.push(rejectedApplicationId);
    const rejected = await callController(updateApplicationStatus, {
      user: farmer,
      params: { id: rejectedApplicationId.toString() },
      body: { status: 'rejected' }
    });
    assert.strictEqual(rejected.statusCode, 200, 'pending application can be rejected');
    assert.strictEqual(await Notification.countDocuments({ recipient: otherWorker._id, type: 'application_rejected', 'data.applicationId': rejectedApplicationId }), 1, 'rejected worker receives a notification');

    const withdrawnJob = await createJob(farmer, 'Phase9Test Withdrawn Event');
    createdJobIds.push(withdrawnJob._id);
    const withdrawalApply = await callController(applyForJob, {
      user: worker,
      params: { id: withdrawnJob._id.toString() },
      body: {}
    });
    const withdrawnApplicationId = withdrawalApply.data.application._id;
    createdApplicationIds.push(withdrawnApplicationId);
    const foreignWithdrawal = await callController(withdrawApplication, {
      user: otherWorker,
      params: { id: withdrawnApplicationId.toString() }
    });
    assert.strictEqual(foreignWithdrawal.statusCode, 403, 'worker cannot withdraw another worker application');
    assert.strictEqual(await Notification.countDocuments({ recipient: farmer._id, type: 'application_withdrawn' }), 0, 'unauthorized withdrawal does not notify farmer');
    const withdrawn = await callController(withdrawApplication, {
      user: worker,
      params: { id: withdrawnApplicationId.toString() }
    });
    assert.strictEqual(withdrawn.statusCode, 200, 'worker can withdraw pending application');
    assert.strictEqual(await Notification.countDocuments({ recipient: farmer._id, type: 'application_withdrawn', 'data.applicationId': withdrawnApplicationId }), 1, 'withdrawal notifies job owner');

    const updateJobFixture = await createJob(farmer, 'Phase9Test Update Event');
    createdJobIds.push(updateJobFixture._id);
    const updateApply = await callController(applyForJob, {
      user: otherWorker,
      params: { id: updateJobFixture._id.toString() },
      body: {}
    });
    const updateApplicationId = updateApply.data.application._id;
    createdApplicationIds.push(updateApplicationId);
    const foreignJobUpdate = await callController(updateJob, {
      user: otherWorker,
      params: { id: updateJobFixture._id.toString() },
      body: { title: 'Unauthorized title' }
    });
    assert.strictEqual(foreignJobUpdate.statusCode, 404, 'non-owner cannot update the job');
    assert.strictEqual(await Notification.countDocuments({ recipient: otherWorker._id, type: 'job_updated', 'data.jobId': updateJobFixture._id }), 0, 'failed job update does not create applicant notifications');
    const updated = await callController(updateJob, {
      user: farmer,
      params: { id: updateJobFixture._id.toString() },
      body: { title: 'Phase9Test Updated Title' }
    });
    assert.strictEqual(updated.statusCode, 200, 'farmer can update own job');
    assert.strictEqual(await Notification.countDocuments({ recipient: otherWorker._id, type: 'job_updated', 'data.jobId': updateJobFixture._id }), 1, 'active applicant receives job update');
    await callController(updateJob, {
      user: farmer,
      params: { id: updateJobFixture._id.toString() },
      body: { title: 'Phase9Test Updated Title' }
    });
    assert.strictEqual(await Notification.countDocuments({ recipient: otherWorker._id, type: 'job_updated', 'data.jobId': updateJobFixture._id }), 1, 'unchanged job update does not duplicate notification');

    const closedJob = await createJob(farmer, 'Phase9Test Closed Event');
    createdJobIds.push(closedJob._id);
    const closeApply = await callController(applyForJob, {
      user: worker,
      params: { id: closedJob._id.toString() },
      body: {}
    });
    const closeApplicationId = closeApply.data.application._id;
    createdApplicationIds.push(closeApplicationId);
    const closed = await callController(updateJobStatus, {
      user: farmer,
      params: { id: closedJob._id.toString() },
      body: { status: 'closed' }
    });
    assert.strictEqual(closed.statusCode, 200, 'farmer can close own job');
    assert.strictEqual(await Notification.countDocuments({ recipient: worker._id, type: 'job_closed', 'data.jobId': closedJob._id }), 1, 'active applicant is notified when job closes');
    await callController(updateJobStatus, {
      user: farmer,
      params: { id: closedJob._id.toString() },
      body: { status: 'closed' }
    });
    assert.strictEqual(await Notification.countDocuments({ recipient: worker._id, type: 'job_closed', 'data.jobId': closedJob._id }), 1, 'unchanged job status does not duplicate closure notification');

    await Notification.updateMany({ recipient: { $in: [farmer._id, otherWorker._id] } }, { $set: { readAt: new Date() } });
    await Notification.create({
      recipient: farmer._id,
      type: 'job_updated',
      titleKey: 'notification_job_updated_title',
      messageKey: 'notification_job_updated_message',
      data: { jobId: acceptedJob._id, jobTitle: acceptedJob.title },
      dedupeKey: `p9test:unread:${farmer._id}`
    });
    await Notification.create({
      recipient: otherWorker._id,
      type: 'job_updated',
      titleKey: 'notification_job_updated_title',
      messageKey: 'notification_job_updated_message',
      data: { jobId: rejectedJob._id, jobTitle: rejectedJob.title },
      dedupeKey: `p9test:other:${otherWorker._id}`
    });

    const farmerList = await callController(notificationController.getMyNotifications, { user: farmer, query: { page: '1', limit: '50' } });
    assert.strictEqual(farmerList.statusCode, 200, 'authenticated user can list own notifications');
    assert(farmerList.data.notifications.every(item => !item.recipient), 'notification API does not expose recipient ID');
    assert(farmerList.data.notifications.every(item => item.data.jobId), 'notification API returns safe navigation metadata');
    const unread = await callController(notificationController.getUnreadCount, { user: farmer });
    assert.strictEqual(unread.data.count, 1, 'unread count is scoped to authenticated user');
    const invalidPage = await callController(notificationController.getMyNotifications, { user: farmer, query: { page: '0' } });
    assert.strictEqual(invalidPage.statusCode, 400, 'invalid pagination is rejected');
    const foreignNotification = await Notification.findOne({ recipient: otherWorker._id });
    const foreignRead = await callController(notificationController.markNotificationRead, {
      user: farmer,
      params: { id: foreignNotification._id.toString() }
    });
    assert.strictEqual(foreignRead.statusCode, 404, 'user cannot read another user notification');
    const foreignDelete = await callController(notificationController.deleteNotification, {
      user: farmer,
      params: { id: foreignNotification._id.toString() }
    });
    assert.strictEqual(foreignDelete.statusCode, 404, 'user cannot delete another user notification');
    const markAll = await callController(notificationController.markAllNotificationsRead, { user: farmer });
    assert.strictEqual(markAll.statusCode, 200, 'user can mark own notifications read');
    assert.strictEqual(await Notification.countDocuments({ recipient: farmer._id, readAt: null }), 0, 'read-all clears only own unread notifications');
    assert.strictEqual(await Notification.countDocuments({ recipient: otherWorker._id, readAt: null }), 1, 'read-all preserves other users unread notifications');
    const deleteOwn = await callController(notificationController.deleteNotification, {
      user: farmer,
      params: { id: farmerList.data.notifications[0]._id.toString() }
    });
    assert.strictEqual(deleteOwn.statusCode, 200, 'recipient can delete own notification');

    console.log('Phase 9 notification tests passed: event generation, transition idempotency, recipient scoping, pagination validation, mark-read/read-all, and delete authorization.');
  } finally {
    await Notification.deleteMany({ 'data.jobId': { $in: createdJobIds } });
    await Notification.deleteMany({ dedupeKey: /^p9test:/ });
    await Application.deleteMany({ _id: { $in: createdApplicationIds } });
    await Job.deleteMany({ _id: { $in: createdJobIds } });
    if (farmer || worker || otherWorker) {
      await User.deleteMany({ _id: { $in: [farmer?._id, worker?._id, otherWorker?._id].filter(Boolean) } });
    }
    await mongoose.disconnect();
  }
}

runPhase9Tests().catch(error => {
  console.error('Phase 9 notification tests failed:', error);
  process.exitCode = 1;
});
