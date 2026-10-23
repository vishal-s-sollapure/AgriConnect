const Notification = require('../models/Notification');

async function createNotification(notification) {
  try {
    await Notification.create(notification);
  } catch (error) {
    if (error.code === 11000) return;
    console.error('Notification creation failed:', error.message);
  }
}

async function createNotifications(notifications) {
  if (!notifications.length) return;
  try {
    await Notification.insertMany(notifications, { ordered: false });
  } catch (error) {
    if (error.code === 11000 && error.writeErrors?.every(item => item.code === 11000)) return;
    console.error('Bulk notification creation failed:', error.message);
  }
}

function eventNotification({ recipient, type, job, application, dedupeKey }) {
  const data = {
    jobId: job?._id,
    jobTitle: job?.title
  };
  if (application?._id) data.applicationId = application._id;
  const messageKeys = {
    new_application: 'notification_new_application_message',
    application_accepted: 'notification_application_accepted_message',
    application_rejected: 'notification_application_rejected_message',
    application_withdrawn: 'notification_application_withdrawn_message',
    job_updated: 'notification_job_updated_message',
    job_closed: 'notification_job_closed_message'
  };
  const titleKeys = {
    new_application: 'notification_new_application_title',
    application_accepted: 'notification_application_accepted_title',
    application_rejected: 'notification_application_rejected_title',
    application_withdrawn: 'notification_application_withdrawn_title',
    job_updated: 'notification_job_updated_title',
    job_closed: 'notification_job_closed_title'
  };
  return {
    recipient,
    type,
    titleKey: titleKeys[type],
    messageKey: messageKeys[type],
    data,
    dedupeKey
  };
}

async function notifyJobApplicants(job, type) {
  try {
    const Application = require('../models/Application');
    const applications = await Application.find({
      job: job._id,
      status: { $in: ['pending', 'accepted'] }
    }).select('_id worker').lean();
    const notifications = applications
      .filter(application => application.worker.toString() !== job.farmer.toString())
      .map(application => eventNotification({
        recipient: application.worker,
        type,
        job,
        application,
        dedupeKey: `${type}:${job._id}:${job.updatedAt.getTime()}:${application.worker}`
      }));
    await createNotifications(notifications);
  } catch (error) {
    console.error('Job applicant notifications failed:', error.message);
  }
}

module.exports = {
  createNotification,
  createNotifications,
  eventNotification,
  notifyJobApplicants
};
