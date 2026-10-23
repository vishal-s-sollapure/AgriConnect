const mongoose = require('mongoose');
const dotenv = require('dotenv');
const assert = require('assert');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Job = require('../models/Job');
const {
  createJob,
  getMyJobs,
  getJobById,
  updateJob,
  updateJobStatus,
  deleteJob
} = require('../controllers/jobController');
const { requireRole } = require('../middleware/authMiddleware');

function createMockReqRes({ user = null, body = {}, params = {}, query = {}, headers = {} } = {}) {
  const req = {
    user,
    body,
    params,
    query,
    headers
  };

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

async function runPhase3Tests() {
  console.log('🧪 Starting AgriConnect Phase 3 Complete Test Suite...\n');

  const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/agriconnect';

  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB for Phase 3 testing');
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }

  let testFarmer1, testFarmer2, testWorker;
  let createdJobId;

  try {
    // Cleanup prior test fixtures
    await User.deleteMany({
      email: { $in: ['p3_farmer1@agri.org', 'p3_farmer2@agri.org', 'p3_worker@agri.org'] }
    });
    await Job.deleteMany({ title: { $regex: /Phase3 Test Job/i } });

    // Fixture Users
    testFarmer1 = await User.create({
      name: 'Farmer One',
      email: 'p3_farmer1@agri.org',
      phone: '9998887771',
      password: 'Password123',
      role: 'farmer',
      location: 'Anand, Gujarat',
      farmName: 'Green Acres'
    });

    testFarmer2 = await User.create({
      name: 'Farmer Two',
      email: 'p3_farmer2@agri.org',
      phone: '9998887772',
      password: 'Password123',
      role: 'farmer',
      location: 'Rajkot, Gujarat',
      farmName: 'Golden Fields'
    });

    testWorker = await User.create({
      name: 'Worker One',
      email: 'p3_worker@agri.org',
      phone: '9998887773',
      password: 'Password123',
      role: 'worker',
      location: 'Vadodara, Gujarat'
    });

    console.log('✅ Fixture users created successfully.\n');

    // 1. A farmer can create a valid job.
    {
      const { req, res } = createMockReqRes({
        user: testFarmer1,
        body: {
          title: 'Phase3 Test Job - Wheat Harvesting',
          crop: 'Wheat',
          workType: 'Harvesting',
          workersRequired: 4,
          wageAmount: 700,
          wageType: 'daily',
          startDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          durationValue: 3,
          durationUnit: 'days',
          location: 'Anand, Gujarat',
          description: 'Valid test job description for harvesting wheat'
        }
      });

      await createJob(req, res);
      assert.strictEqual(res.statusCode, 201, 'Should return HTTP 201');
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.job.title, 'Phase3 Test Job - Wheat Harvesting');
      createdJobId = res.data.job._id.toString();
      console.log('✅ TEST 1 PASSED: A farmer can create a valid job.');
    }

    // 2. The job persists in MongoDB.
    {
      const persistedJob = await Job.findById(createdJobId);
      assert.ok(persistedJob, 'Job should be found in MongoDB');
      assert.strictEqual(persistedJob.farmer.toString(), testFarmer1._id.toString());
      console.log('✅ TEST 2 PASSED: The job persists accurately in MongoDB.');
    }

    // 3. A worker cannot create a job.
    {
      const roleMiddleware = requireRole('farmer');
      const { req, res } = createMockReqRes({ user: testWorker });
      let calledNext = false;
      roleMiddleware(req, res, () => { calledNext = true; });

      assert.strictEqual(calledNext, false, 'Role middleware should block worker from job creation route');
      assert.strictEqual(res.statusCode, 403, 'Should return HTTP 403 Forbidden for worker role');
      console.log('✅ TEST 3 PASSED: A worker cannot create a job (403 Forbidden).');
    }

    // 4. An unauthenticated user cannot create a job.
    {
      const roleMiddleware = requireRole('farmer');
      const { req, res } = createMockReqRes({ user: null });
      let calledNext = false;
      roleMiddleware(req, res, () => { calledNext = true; });

      assert.strictEqual(calledNext, false, 'Unauthenticated user should be blocked');
      assert.strictEqual(res.statusCode, 401, 'Should return HTTP 401 Unauthorized for unauthenticated request');
      console.log('✅ TEST 4 PASSED: An unauthenticated user cannot create a job (401 Unauthorized).');
    }

    // 5. Invalid wages and worker counts are rejected.
    {
      const { req, res } = createMockReqRes({
        user: testFarmer1,
        body: {
          title: 'Phase3 Test Job Invalid Payload',
          crop: 'Wheat',
          workType: 'Harvesting',
          workersRequired: -2,
          wageAmount: -100,
          wageType: 'daily',
          startDate: new Date().toISOString().split('T')[0],
          durationValue: 0,
          location: 'Anand',
          description: 'Invalid numbers payload'
        }
      });

      await createJob(req, res);
      assert.strictEqual(res.statusCode, 400, 'Should reject invalid numeric values with HTTP 400');
      assert.strictEqual(res.data.success, false);
      console.log('✅ TEST 5 PASSED: Invalid wages and worker counts are rejected (400 Bad Request).');
    }

    // 6. A farmer sees only their own jobs.
    {
      await Job.create({
        farmer: testFarmer2._id,
        title: 'Phase3 Test Job - Farmer 2 Cotton Picking',
        crop: 'Cotton',
        workType: 'Harvesting',
        workersRequired: 5,
        wageAmount: 600,
        wageType: 'daily',
        startDate: new Date(),
        durationValue: 2,
        durationUnit: 'days',
        location: 'Rajkot',
        description: 'Farmer 2 job description'
      });

      const { req, res } = createMockReqRes({ user: testFarmer1 });
      await getMyJobs(req, res);
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.data.success, true);
      const allOwnedByFarmer1 = res.data.jobs.every(j => j.farmer._id.toString() === testFarmer1._id.toString());
      assert.ok(allOwnedByFarmer1, 'Farmer 1 should only see their own jobs');
      console.log('✅ TEST 6 PASSED: A farmer sees only their own jobs in getMyJobs.');
    }

    // 7. A farmer cannot edit another farmer's job.
    {
      const farmer2Job = await Job.findOne({ farmer: testFarmer2._id });

      const { req: editReq, res: editRes } = createMockReqRes({
        user: testFarmer1,
        params: { id: farmer2Job._id.toString() },
        body: { title: 'Unauthorized Edit Attempt' }
      });

      await updateJob(editReq, editRes);
      assert.strictEqual(editRes.statusCode, 404, 'Should return HTTP 404 when editing another farmer job');
      console.log('✅ TEST 7 PASSED: A farmer cannot edit another farmer\'s job.');
    }

    // 8. A farmer cannot close or delete another farmer's job.
    {
      const farmer2Job = await Job.findOne({ farmer: testFarmer2._id });

      const { req: delReq, res: delRes } = createMockReqRes({
        user: testFarmer1,
        params: { id: farmer2Job._id.toString() }
      });

      await deleteJob(delReq, delRes);
      assert.strictEqual(delRes.statusCode, 404, 'Should return HTTP 404 when deleting another farmer job');
      console.log('✅ TEST 8 PASSED: A farmer cannot close or delete another farmer\'s job.');
    }

    // 9. Invalid job IDs are handled correctly.
    {
      const { req, res } = createMockReqRes({
        user: testFarmer1,
        params: { id: 'invalid-object-id-123' }
      });

      await getJobById(req, res);
      assert.strictEqual(res.statusCode, 400, 'Should return HTTP 400 for invalid ObjectId format');
      console.log('✅ TEST 9 PASSED: Invalid job IDs are handled gracefully with 400 Bad Request.');
    }

    // 10. Closed jobs can be reopened.
    {
      // Close job
      const { req: closeReq, res: closeRes } = createMockReqRes({
        user: testFarmer1,
        params: { id: createdJobId },
        body: { status: 'closed' }
      });
      await updateJobStatus(closeReq, closeRes);
      assert.strictEqual(closeRes.statusCode, 200);
      assert.strictEqual(closeRes.data.job.status, 'closed');

      // Reopen job
      const { req: openReq, res: openRes } = createMockReqRes({
        user: testFarmer1,
        params: { id: createdJobId },
        body: { status: 'open' }
      });
      await updateJobStatus(openReq, openRes);
      assert.strictEqual(openRes.statusCode, 200);
      assert.strictEqual(openRes.data.job.status, 'open');
      console.log('✅ TEST 10 PASSED: Closed jobs can be reopened.');
    }

    // 11. Completed jobs cannot be edited or reopened.
    {
      // Mark completed
      const { req: compReq, res: compRes } = createMockReqRes({
        user: testFarmer1,
        params: { id: createdJobId },
        body: { status: 'completed' }
      });
      await updateJobStatus(compReq, compRes);
      assert.strictEqual(compRes.statusCode, 200);

      // Try to edit completed job
      const { req: editReq, res: editRes } = createMockReqRes({
        user: testFarmer1,
        params: { id: createdJobId },
        body: { title: 'New Title Attempt' }
      });
      await updateJob(editReq, editRes);
      assert.strictEqual(editRes.statusCode, 400, 'Should reject edit on completed job');

      // Try to reopen completed job
      const { req: reopenReq, res: reopenRes } = createMockReqRes({
        user: testFarmer1,
        params: { id: createdJobId },
        body: { status: 'open' }
      });
      await updateJobStatus(reopenReq, reopenRes);
      assert.strictEqual(reopenRes.statusCode, 400, 'Should reject status change on completed job');
      console.log('✅ TEST 11 PASSED: Completed jobs cannot be edited or reopened.');
    }

    // 12. Dashboard counts reflect saved jobs.
    {
      const { req, res } = createMockReqRes({ user: testFarmer1 });
      await getMyJobs(req, res);
      assert.strictEqual(res.statusCode, 200);
      assert.ok(res.data.stats, 'Dashboard stats should be returned');
      assert.strictEqual(res.data.stats.total >= 1, true);
      console.log('✅ TEST 12 PASSED: Dashboard counts reflect saved jobs.');
    }

    console.log('\n🎉 ALL 12 PHASE 3 REQUIREMENTS PASSED VERIFICATION TESTS!\n');

  } catch (testError) {
    console.error('\n❌ Phase 3 Test Execution Failure:', testError);
    process.exit(1);
  } finally {
    // Cleanup
    await User.deleteMany({
      email: { $in: ['p3_farmer1@agri.org', 'p3_farmer2@agri.org', 'p3_worker@agri.org'] }
    });
    await Job.deleteMany({ title: { $regex: /Phase3 Test Job/i } });
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB. Cleaned up Phase 3 test fixtures.');
  }
}

runPhase3Tests();
