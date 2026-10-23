const assert = require('assert');
const mongoose = require('mongoose');
const express = require('express');
const Notification = require('../models/Notification');
const { eventNotification } = require('../services/notificationService');
const controller = require('../controllers/notificationController');

function createMockReqRes({ user = { _id: new mongoose.Types.ObjectId() }, params = {}, query = {} } = {}) {
  const req = { user, params, query };
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

async function run() {
  const schema = Notification.schema;
  assert.deepStrictEqual(
    schema.path('type').enumValues,
    ['new_application', 'application_accepted', 'application_rejected', 'application_withdrawn', 'job_updated', 'job_closed'],
    'notification schema defines only supported event types'
  );
  assert(schema.indexes().some(([keys]) => keys.recipient === 1 && keys.createdAt === -1), 'recipient timeline index exists');
  assert(schema.indexes().some(([keys]) => keys.recipient === 1 && keys.readAt === 1), 'recipient unread-count index exists');
  assert(schema.indexes().some(([, options]) => options.unique), 'deduplication index is unique');

  const farmerId = new mongoose.Types.ObjectId();
  const job = { _id: new mongoose.Types.ObjectId(), title: 'Cotton harvest', farmer: farmerId };
  const application = { _id: new mongoose.Types.ObjectId() };
  const event = eventNotification({
    recipient: farmerId,
    type: 'new_application',
    job,
    application,
    dedupeKey: `new_application:${application._id}`
  });
  assert.strictEqual(event.titleKey, 'notification_new_application_title');
  assert.strictEqual(event.messageKey, 'notification_new_application_message');
  assert.strictEqual(event.data.jobId, job._id);
  assert.strictEqual(event.data.applicationId, application._id);
  assert.strictEqual(event.data.jobTitle, job.title);
  assert.strictEqual(Object.hasOwn(event.data, 'workerPhone'), false, 'notification metadata does not contain private worker data');

  const invalidPageContext = createMockReqRes({ query: { page: '0' } });
  await controller.getMyNotifications(invalidPageContext.req, invalidPageContext.res);
  assert.strictEqual(invalidPageContext.res.statusCode, 400, 'invalid page is rejected before database access');
  const invalidUnreadContext = createMockReqRes({ query: { unreadOnly: 'sometimes' } });
  await controller.getMyNotifications(invalidUnreadContext.req, invalidUnreadContext.res);
  assert.strictEqual(invalidUnreadContext.res.statusCode, 400, 'invalid unreadOnly filter is rejected before database access');
  const excessivePageContext = createMockReqRes({ query: { page: '10001' } });
  await controller.getMyNotifications(excessivePageContext.req, excessivePageContext.res);
  assert.strictEqual(excessivePageContext.res.statusCode, 400, 'excessive pagination is rejected before database access');
  const invalidReadContext = createMockReqRes({ params: { id: 'not-an-object-id' } });
  await controller.markNotificationRead(invalidReadContext.req, invalidReadContext.res);
  assert.strictEqual(invalidReadContext.res.statusCode, 400, 'invalid notification ID is rejected');
  const invalidDeleteContext = createMockReqRes({ params: { id: 'not-an-object-id' } });
  await controller.deleteNotification(invalidDeleteContext.req, invalidDeleteContext.res);
  assert.strictEqual(invalidDeleteContext.res.statusCode, 400, 'invalid notification delete ID is rejected');

  const app = express();
  app.use('/api/notifications', require('../routes/notificationRoutes'));
  const server = await new Promise(resolve => {
    const instance = app.listen(0, () => resolve(instance));
  });
  try {
    const baseUrl = `http://127.0.0.1:${server.address().port}/api/notifications`;
    for (const [url, method] of [
      ['', 'GET'],
      ['/unread-count', 'GET'],
      ['/read-all', 'PATCH'],
      ['/000000000000000000000000/read', 'PATCH'],
      ['/000000000000000000000000', 'DELETE']
    ]) {
      const response = await fetch(`${baseUrl}${url}`, { method });
      assert.strictEqual(response.status, 401, `${method} ${url || '/'} requires authentication`);
    }
  } finally {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }

  console.log('Phase 9 notification unit tests passed: schema, indexes, event metadata, pagination/filter and ID validation.');
}

run().catch(error => {
  console.error('Phase 9 notification unit tests failed:', error);
  process.exitCode = 1;
});
