const mongoose = require('mongoose');
const dotenv = require('dotenv');
const assert = require('assert');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const {
  getJobApplications,
  updateApplicationStatus,
  getJobHiringSummary
} = require('../controllers/applicationController');
const {
  getJobs,
  getMyJobs,
  createJob,
  applyForJob
} = require('../controllers/jobController');
const {
  getWorkerProfileForFarmer
} = require('../controllers/userController');
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

async function runPhase5Tests() {
  console.log('🧪 Starting AgriConnect Phase 5 Test Suite...\n');

  const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/agriconnect';

  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB for Phase 5 testing');
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }

  let farmerA, farmerB, worker1, worker2, worker3;
  let jobA, jobCapacity1;
  let appA1, appA2, appCapacity1, appCapacity2;

  try {
    // 1. Cleanup test fixtures
    await Application.deleteMany({ message: { $regex: /Phase5Test/i } });
    await Job.deleteMany({ title: { $regex: /Phase5Test/i } });
    await User.deleteMany({
      email: {
        $in: [
          'p5_farmer_a@agri.org',
          'p5_farmer_b@agri.org',
          'p5_worker1@agri.org',
          'p5_worker2@agri.org',
          'p5_worker3@agri.org',
          'p5_worker4@agri.org'
        ]
      }
    });

    // 2. Create Fixture Users
    farmerA = await User.create({
      name: 'Farmer Anand Patel',
      email: 'p5_farmer_a@agri.org',
      phone: '9876543201',
      password: 'Password123',
      role: 'farmer',
      location: 'Anand, Gujarat',
      farmName: 'Anand Organic Farms',
      farmType: 'Cotton & Wheat'
    });

    farmerB = await User.create({
      name: 'Farmer Bharat Patel',
      email: 'p5_farmer_b@agri.org',
      phone: '9876543202',
      password: 'Password123',
      role: 'farmer',
      location: 'Baroda, Gujarat',
      farmName: 'Baroda Agro Farms',
      farmType: 'Vegetables'
    });

    worker1 = await User.create({
      name: 'Kisan Worker Suresh',
      email: 'p5_worker1@agri.org',
      phone: '9876543203',
      password: 'Password123',
      role: 'worker',
      location: 'Anand Rural',
      skills: 'Cotton Harvesting, Tractor Operation',
      experience: '4 Years',
      availability: 'Immediate',
      preferredRadius: '15 km'
    });

    worker2 = await User.create({
      name: 'Kisan Worker Mahesh',
      email: 'p5_worker2@agri.org',
      phone: '9876543204',
      password: 'Password123',
      role: 'worker',
      location: 'Petlad, Anand',
      skills: 'Sowing, Weeding',
      experience: '2 Years',
      availability: 'Full Time',
      preferredRadius: '10 km'
    });

    worker3 = await User.create({
      name: 'Kisan Worker Dinesh',
      email: 'p5_worker3@agri.org',
      phone: '9876543205',
      password: 'Password123',
      role: 'worker',
      location: 'Kheda, Gujarat',
      skills: 'Tilling, Harvesting',
      experience: '5 Years',
      availability: 'Weekdays',
      preferredRadius: '20 km'
    });

    worker4 = await User.create({
      name: 'Kisan Worker Naresh',
      email: 'p5_worker4@agri.org',
      phone: '9876543206',
      password: 'Password123',
      role: 'worker',
      location: 'Borsad, Gujarat',
      skills: 'Ploughing',
      experience: '3 Years',
      availability: 'Part Time',
      preferredRadius: '15 km'
    });

    // 3. Create Fixture Jobs
    jobA = await Job.create({
      farmer: farmerA._id,
      title: 'Phase5Test Cotton Picking Season',
      crop: 'Cotton',
      workType: 'Harvesting',
      workersRequired: 2,
      wageAmount: 650,
      wageType: 'daily',
      startDate: new Date(Date.now() + 86400000),
      durationValue: 14,
      durationUnit: 'days',
      location: 'Anand, Gujarat',
      description: 'Phase5Test Experienced cotton pickers needed for seasonal harvest',
      status: 'open'
    });

    jobCapacity1 = await Job.create({
      farmer: farmerA._id,
      title: 'Phase5Test Single Vacancy Tractor Work',
      crop: 'Wheat',
      workType: 'Tractor Driving',
      workersRequired: 1, // Only 1 worker needed
      wageAmount: 900,
      wageType: 'daily',
      startDate: new Date(Date.now() + 86400000),
      durationValue: 5,
      durationUnit: 'days',
      location: 'Anand, Gujarat',
      description: 'Phase5Test Skilled tractor driver required for 5 days',
      status: 'open'
    });

    // 4. Create Fixture Applications
    appA1 = await Application.create({
      job: jobA._id,
      worker: worker1._id,
      status: 'pending',
      message: 'Phase5Test Experienced cotton picker ready'
    });

    appA2 = await Application.create({
      job: jobA._id,
      worker: worker2._id,
      status: 'pending',
      message: 'Phase5Test Hard worker available for full duration'
    });

    appCapacity1 = await Application.create({
      job: jobCapacity1._id,
      worker: worker1._id,
      status: 'pending',
      message: 'Phase5Test Tractor license holder'
    });

    appCapacity2 = await Application.create({
      job: jobCapacity1._id,
      worker: worker2._id,
      status: 'pending',
      message: 'Phase5Test Experienced driver'
    });

    console.log('✅ Test fixtures initialized successfully.\n');

    // ==========================================
    // TEST 1: Farmer can view applicants for their own job
    // ==========================================
    {
      const { req, res } = createMockReqRes({
        user: farmerA,
        params: { id: jobA._id.toString() }
      });
      await getJobApplications(req, res);
      assert.strictEqual(res.statusCode, 200, 'Test 1: Status code should be 200');
      assert.strictEqual(res.data.success, true, 'Test 1: Success flag should be true');
      assert.strictEqual(res.data.applications.length, 2, 'Test 1: Should return 2 applications');
      assert.strictEqual(res.data.summary.total, 2, 'Test 1: Summary total should be 2');
      assert.strictEqual(res.data.summary.pending, 2, 'Test 1: Summary pending should be 2');
      console.log('✅ TEST 1 PASSED: Farmer can view applicants for their own job.');
    }

    // ==========================================
    // TEST 2: Farmer cannot view another farmer's applicants
    // ==========================================
    {
      const { req, res } = createMockReqRes({
        user: farmerB, // Non-owner farmer
        params: { id: jobA._id.toString() }
      });
      await getJobApplications(req, res);
      assert.strictEqual(res.statusCode, 403, 'Test 2: Status code should be 403 Forbidden');
      assert.strictEqual(res.data.success, false, 'Test 2: Success should be false');
      assert.match(res.data.message, /Forbidden/i, 'Test 2: Should return forbidden message');
      console.log("✅ TEST 2 PASSED: Farmer cannot view another farmer's applicants.");
    }

    // ==========================================
    // TEST 3: Workers cannot access farmer applicant-management endpoints
    // ==========================================
    {
      const roleMiddleware = requireRole('farmer');
      const { req, res } = createMockReqRes({ user: worker1 });
      let nextCalled = false;
      roleMiddleware(req, res, () => { nextCalled = true; });
      assert.strictEqual(nextCalled, false, 'Test 3: next() must not be called for worker');
      assert.strictEqual(res.statusCode, 403, 'Test 3: Must return 403 for worker accessing farmer endpoint');
      console.log('✅ TEST 3 PASSED: Workers cannot access farmer applicant-management endpoints.');
    }

    // ==========================================
    // TEST 4: An owner can accept a pending application
    // ==========================================
    {
      const { req, res } = createMockReqRes({
        user: farmerA,
        params: { id: appA1._id.toString() },
        body: { status: 'accepted' }
      });
      await updateApplicationStatus(req, res);
      assert.strictEqual(res.statusCode, 200, 'Test 4: Status code should be 200');
      assert.strictEqual(res.data.success, true, 'Test 4: Success should be true');
      assert.strictEqual(res.data.application.status, 'accepted', 'Test 4: Status should be accepted');
      assert.strictEqual(res.data.hiringProgress.acceptedCount, 1, 'Test 4: Accepted count should be 1');
      assert.strictEqual(res.data.hiringProgress.remainingVacancies, 1, 'Test 4: Remaining vacancies should be 1');

      // Check DB
      const dbApp = await Application.findById(appA1._id);
      assert.strictEqual(dbApp.status, 'accepted', 'Test 4: DB record status should be accepted');
      console.log('✅ TEST 4 PASSED: An owner can accept a pending application.');
    }

    // ==========================================
    // TEST 5: An owner can reject a pending application
    // ==========================================
    {
      const { req, res } = createMockReqRes({
        user: farmerA,
        params: { id: appA2._id.toString() },
        body: { status: 'rejected' }
      });
      await updateApplicationStatus(req, res);
      assert.strictEqual(res.statusCode, 200, 'Test 5: Status code should be 200');
      assert.strictEqual(res.data.success, true, 'Test 5: Success should be true');
      assert.strictEqual(res.data.application.status, 'rejected', 'Test 5: Status should be rejected');

      // Check DB
      const dbApp = await Application.findById(appA2._id);
      assert.strictEqual(dbApp.status, 'rejected', 'Test 5: DB record status should be rejected');
      console.log('✅ TEST 5 PASSED: An owner can reject a pending application.');
    }

    let workerApp;

    // ==========================================
    // TEST 6: A worker cannot accept or reject their own application
    // ==========================================
    {
      // Create a pending application for worker3
      workerApp = await Application.create({
        job: jobA._id,
        worker: worker3._id,
        status: 'pending',
        message: 'Phase5Test worker self-decision attempt'
      });

      // Endpoint ownership check protects against workers or non-owners
      const { req, res } = createMockReqRes({
        user: worker3,
        params: { id: workerApp._id.toString() },
        body: { status: 'accepted' }
      });
      await updateApplicationStatus(req, res);
      assert.strictEqual(res.statusCode, 403, 'Test 6: Worker must get 403 Forbidden on updateApplicationStatus');
      console.log('✅ TEST 6 PASSED: A worker cannot accept or reject their own application.');
    }

    // ==========================================
    // TEST 7: A non-owner farmer cannot change an application status
    // ==========================================
    {
      // Farmer B attempts to accept workerApp on Farmer A's job
      const { req, res } = createMockReqRes({
        user: farmerB,
        params: { id: workerApp._id.toString() },
        body: { status: 'accepted' }
      });
      await updateApplicationStatus(req, res);
      assert.strictEqual(res.statusCode, 403, 'Test 7: Status code must be 403 Forbidden for non-owner farmer');
      assert.strictEqual(res.data.success, false, 'Test 7: Success should be false');
      console.log('✅ TEST 7 PASSED: A non-owner farmer cannot change an application status.');
    }

    // ==========================================
    // TEST 8: Invalid application IDs are handled safely
    // ==========================================
    {
      // Malformed ID
      const { req: req1, res: res1 } = createMockReqRes({
        user: farmerA,
        params: { id: 'invalid-mongodb-id' },
        body: { status: 'accepted' }
      });
      await updateApplicationStatus(req1, res1);
      assert.strictEqual(res1.statusCode, 400, 'Test 8: Malformed ID should return 400');

      // Non-existent valid ObjectId
      const nonExistentId = new mongoose.Types.ObjectId();
      const { req: req2, res: res2 } = createMockReqRes({
        user: farmerA,
        params: { id: nonExistentId.toString() },
        body: { status: 'accepted' }
      });
      await updateApplicationStatus(req2, res2);
      assert.strictEqual(res2.statusCode, 404, 'Test 8: Non-existent ID should return 404');
      console.log('✅ TEST 8 PASSED: Invalid application IDs are handled safely.');
    }

    // ==========================================
    // TEST 9: Rejected, accepted, and withdrawn applications cannot be improperly transitioned
    // ==========================================
    {
      // Try accepting appA1 again (already accepted in Test 4)
      const { req: req1, res: res1 } = createMockReqRes({
        user: farmerA,
        params: { id: appA1._id.toString() },
        body: { status: 'accepted' }
      });
      await updateApplicationStatus(req1, res1);
      assert.strictEqual(res1.statusCode, 400, 'Test 9: Cannot re-accept already accepted application');

      // Try accepting appA2 (already rejected in Test 5)
      const { req: req2, res: res2 } = createMockReqRes({
        user: farmerA,
        params: { id: appA2._id.toString() },
        body: { status: 'accepted' }
      });
      await updateApplicationStatus(req2, res2);
      assert.strictEqual(res2.statusCode, 400, 'Test 9: Cannot accept already rejected application');

      // Create a withdrawn application for worker4 and try accepting it
      const withdrawnApp = await Application.create({
        job: jobA._id,
        worker: worker4._id,
        status: 'withdrawn',
        message: 'Phase5Test withdrawn application'
      });

      const { req: req3, res: res3 } = createMockReqRes({
        user: farmerA,
        params: { id: withdrawnApp._id.toString() },
        body: { status: 'accepted' }
      });
      await updateApplicationStatus(req3, res3);
      assert.strictEqual(res3.statusCode, 400, 'Test 9: Cannot accept withdrawn application');
      console.log('✅ TEST 9 PASSED: Rejected, accepted, and withdrawn applications cannot be improperly transitioned.');
    }

    // ==========================================
    // TEST 10: Accepted workers cannot exceed the job's worker requirement
    // ==========================================
    {
      // jobCapacity1 requires 1 worker. Accept appCapacity1.
      const { req: req1, res: res1 } = createMockReqRes({
        user: farmerA,
        params: { id: appCapacity1._id.toString() },
        body: { status: 'accepted' }
      });
      await updateApplicationStatus(req1, res1);
      assert.strictEqual(res1.statusCode, 200, 'Test 10: First acceptance should succeed');
      assert.strictEqual(res1.data.hiringProgress.isFullyStaffed, true, 'Test 10: Job is now fully staffed');

      // Now attempt to accept appCapacity2 for the same job (capacity 1/1 already filled)
      const { req: req2, res: res2 } = createMockReqRes({
        user: farmerA,
        params: { id: appCapacity2._id.toString() },
        body: { status: 'accepted' }
      });
      await updateApplicationStatus(req2, res2);
      assert.strictEqual(res2.statusCode, 400, 'Test 10: Second acceptance must be rejected');
      assert.match(res2.data.message, /capacity/i, 'Test 10: Must mention capacity is full');

      // Confirm DB still only has 1 accepted application for jobCapacity1
      const count = await Application.countDocuments({ job: jobCapacity1._id, status: 'accepted' });
      assert.strictEqual(count, 1, 'Test 10: DB must have exactly 1 accepted application');
      console.log("✅ TEST 10 PASSED: Accepted workers cannot exceed the job's worker requirement.");
    }

    // ==========================================
    // TEST 11: Concurrent acceptance attempts respect job capacity
    // ==========================================
    {
      // Create a fresh job with workersRequired: 1 and 2 pending applications
      const concurrentJob = await Job.create({
        farmer: farmerA._id,
        title: 'Phase5Test Concurrency Test Job',
        crop: 'Mustard',
        workType: 'Harvesting',
        workersRequired: 1,
        wageAmount: 700,
        wageType: 'daily',
        startDate: new Date(Date.now() + 86400000),
        durationValue: 3,
        durationUnit: 'days',
        location: 'Anand',
        description: 'Phase5Test Concurrency test job description',
        status: 'open'
      });

      const concApp1 = await Application.create({
        job: concurrentJob._id,
        worker: worker1._id,
        status: 'pending',
        message: 'Phase5Test Concurrency applicant 1'
      });

      const concApp2 = await Application.create({
        job: concurrentJob._id,
        worker: worker2._id,
        status: 'pending',
        message: 'Phase5Test Concurrency applicant 2'
      });

      // Run both acceptance calls concurrently
      const { req: r1, res: s1 } = createMockReqRes({
        user: farmerA,
        params: { id: concApp1._id.toString() },
        body: { status: 'accepted' }
      });
      const { req: r2, res: s2 } = createMockReqRes({
        user: farmerA,
        params: { id: concApp2._id.toString() },
        body: { status: 'accepted' }
      });

      await Promise.all([
        updateApplicationStatus(r1, s1),
        updateApplicationStatus(r2, s2)
      ]);

      const statusCodes = [s1.statusCode, s2.statusCode].sort();
      assert.deepStrictEqual(statusCodes, [200, 400], 'Test 11: Exactly one request must succeed (200) and one must be rejected (400)');

      // Verify DB count
      const acceptedCount = await Application.countDocuments({
        job: concurrentJob._id,
        status: 'accepted'
      });
      assert.strictEqual(acceptedCount, 1, 'Test 11: Final DB accepted count must be exactly 1, never exceeding workersRequired');
      console.log('✅ TEST 11 PASSED: Concurrent acceptance attempts respect job capacity.');
    }

    // ==========================================
    // TEST 12: Hiring summaries contain accurate database-derived counts
    // ==========================================
    {
      const { req, res } = createMockReqRes({
        user: farmerA,
        params: { id: jobA._id.toString() }
      });
      await getJobHiringSummary(req, res);
      assert.strictEqual(res.statusCode, 200, 'Test 12: Hiring summary returns 200');
      assert.strictEqual(res.data.success, true, 'Test 12: Success should be true');
      const sum = res.data.summary;
      assert.strictEqual(sum.workersRequired, 2, 'Test 12: workersRequired matches');
      assert.strictEqual(sum.acceptedApplications, 1, 'Test 12: acceptedApplications count matches');
      assert.strictEqual(sum.rejectedApplications, 1, 'Test 12: rejectedApplications count matches');
      assert.strictEqual(sum.remainingVacancies, 1, 'Test 12: remainingVacancies calculated correctly');
      console.log('✅ TEST 12 PASSED: Hiring summaries contain accurate database-derived counts.');
    }

    // ==========================================
    // TEST 13: Private user fields are not returned
    // ==========================================
    {
      // 1. In getJobApplications: worker password, email, and tokens are omitted
      const { req: r1, res: s1 } = createMockReqRes({
        user: farmerA,
        params: { id: jobA._id.toString() }
      });
      await getJobApplications(r1, s1);
      s1.data.applications.forEach(app => {
        assert.strictEqual(app.worker.password, undefined, 'Test 13: Password must not be populated');
        assert.strictEqual(app.worker.email, undefined, 'Test 13: Email must not be exposed');
        assert.strictEqual(app.worker.tokens, undefined, 'Test 13: Tokens must not be exposed');
      });

      // 2. For non-accepted worker (appA2 is rejected), phone must be deleted/undefined
      const rejectedApp = s1.data.applications.find(a => a._id.toString() === appA2._id.toString());
      assert.strictEqual(rejectedApp.worker.phone, undefined, 'Test 13: Phone must be omitted for non-accepted worker');

      // 3. For accepted worker (appA1 is accepted), phone is revealed
      const acceptedApp = s1.data.applications.find(a => a._id.toString() === appA1._id.toString());
      assert.strictEqual(acceptedApp.worker.phone, '9876543203', 'Test 13: Phone is revealed only for accepted applicant');

      // 4. In getWorkerProfileForFarmer:
      const { req: r2, res: s2 } = createMockReqRes({
        user: farmerA,
        params: { id: worker1._id.toString() }
      });
      await getWorkerProfileForFarmer(r2, s2);
      assert.strictEqual(s2.statusCode, 200, 'Test 13: Worker profile returns 200');
      assert.strictEqual(s2.data.worker.password, undefined, 'Test 13: Password hash never returned in profile');
      assert.strictEqual(s2.data.worker.email, undefined, 'Test 13: Private email not returned in safe profile');

      // 5. Unrelated farmer (farmerB) cannot view worker1's profile
      const { req: r3, res: s3 } = createMockReqRes({
        user: farmerB,
        params: { id: worker1._id.toString() }
      });
      await getWorkerProfileForFarmer(r3, s3);
      assert.strictEqual(s3.statusCode, 403, 'Test 13: Unrelated farmer must receive 403 for worker profile');
      console.log('✅ TEST 13 PASSED: Private user fields are protected and not returned.');
    }

    // ==========================================
    // TEST 14: Existing job creation, job discovery, worker applications, and dashboard still work
    // ==========================================
    {
      // 1. Farmer creates a job
      const { req: rCreate, res: sCreate } = createMockReqRes({
        user: farmerA,
        body: {
          title: 'Phase5Test Regression Job',
          crop: 'Wheat',
          workType: 'Sowing',
          workersRequired: 3,
          wageAmount: 500,
          wageType: 'daily',
          startDate: new Date(Date.now() + 86400000).toISOString(),
          durationValue: 7,
          durationUnit: 'days',
          location: 'Anand, Gujarat',
          description: 'Wheat sowing job'
        }
      });
      await createJob(rCreate, sCreate);
      assert.strictEqual(sCreate.statusCode, 201, 'Test 14: Job creation works');
      const createdJobId = sCreate.data.job._id;

      // 2. Worker discovers jobs
      const { req: rGet, res: sGet } = createMockReqRes({
        query: { search: 'Phase5Test Regression' }
      });
      await getJobs(rGet, sGet);
      assert.strictEqual(sGet.statusCode, 200, 'Test 14: Public job discovery works');
      assert.strictEqual(sGet.data.jobs.length >= 1, true, 'Test 14: Created job is discoverable');

      // 3. Worker applies for the job
      const { req: rApply, res: sApply } = createMockReqRes({
        user: worker3,
        params: { id: createdJobId.toString() },
        body: { message: 'Phase5Test applying for wheat sowing' }
      });
      await applyForJob(rApply, sApply);
      assert.strictEqual(sApply.statusCode, 201, 'Test 14: Worker application works');

      // 4. Farmer gets my-jobs with aggregated applicant counts
      const { req: rMyJobs, res: sMyJobs } = createMockReqRes({
        user: farmerA,
        query: { limit: 10 }
      });
      await getMyJobs(rMyJobs, sMyJobs);
      assert.strictEqual(sMyJobs.statusCode, 200, 'Test 14: getMyJobs works');
      assert.strictEqual(sMyJobs.data.stats.totalApplications > 0, true, 'Test 14: totalApplications aggregated');
      const myJob = sMyJobs.data.jobs.find(j => j._id.toString() === createdJobId.toString());
      assert.strictEqual(myJob.applicantCounts.total, 1, 'Test 14: per-job applicantCounts total matches');
      assert.strictEqual(myJob.applicantCounts.pending, 1, 'Test 14: per-job applicantCounts pending matches');

      console.log('✅ TEST 14 PASSED: Existing job creation, discovery, and worker applications still work.');
    }

    console.log('\n🎉 ALL PHASE 5 BACKEND TESTS PASSED (14/14 automated assertions succeeded)!\n');

  } catch (error) {
    console.error('❌ Phase 5 Test Failed:', error);
    process.exit(1);
  } finally {
    // Clean up test fixtures
    await Application.deleteMany({ message: { $regex: /Phase5Test/i } });
    await Job.deleteMany({ title: { $regex: /Phase5Test/i } });
    await User.deleteMany({
      email: {
        $in: [
          'p5_farmer_a@agri.org',
          'p5_farmer_b@agri.org',
          'p5_worker1@agri.org',
          'p5_worker2@agri.org',
          'p5_worker3@agri.org',
          'p5_worker4@agri.org'
        ]
      }
    });
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB. Cleaned up test fixtures.');
  }
}

runPhase5Tests();
