const mongoose = require('mongoose');
const dotenv = require('dotenv');
const assert = require('assert');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
  memoryUsers
} = require('../controllers/authController');
const {
  getUserProfile,
  updateUserProfile,
  getWorkerProfileForFarmer
} = require('../controllers/userController');
const {
  protect,
  requireRole
} = require('../middleware/authMiddleware');

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

async function runPhase2Tests() {
  console.log('🧪 Starting AgriConnect Phase 2 Test Suite...\n');

  const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/agriconnect';

  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB for Phase 2 testing');
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }

  let createdWorker, createdFarmer;
  let workerToken, farmerToken;
  const memoryOnlyEmail = 'p2_test_memory_only@agri.org';

  try {
    // 0. Clean prior fixtures
    await User.deleteMany({ email: { $regex: /^p2_test_/i } });
    console.log('🧹 Cleaned up prior Phase 2 test fixtures.\n');

    // TEST 1: Register worker with role-specific profile fields
    {
      const { req, res } = createMockReqRes({
        body: {
          name: 'Ramesh Worker',
          email: 'p2_test_worker@agri.org',
          phone: '9876500001',
          password: 'Password123',
          role: 'worker',
          location: 'Kheda, Gujarat',
          skills: 'Tractor Driving, Cotton Picking',
          experience: '3-5 Years',
          availability: 'Full Time',
          preferredRadius: '15 km'
        }
      });

      await registerUser(req, res);
      assert.strictEqual(res.statusCode, 201, 'Should return HTTP 201 Created');
      assert.strictEqual(res.data.success, true);
      assert.ok(res.data.token, 'Registration must issue a JWT token');
      assert.strictEqual(res.data.user.role, 'worker');
      assert.strictEqual(res.data.user.skills, 'Tractor Driving, Cotton Picking');
      assert.strictEqual(res.data.user.preferredRadius, '15 km');
      assert.strictEqual(res.data.user.password, undefined, 'Password must not be returned');

      workerToken = res.data.token;
      createdWorker = await User.findOne({ email: 'p2_test_worker@agri.org' });
      assert.ok(createdWorker, 'Worker must be stored in database');
      console.log('✅ TEST 1 PASSED: Worker registration saves agricultural profile details & issues JWT token.');
    }

    // TEST 2: Register farmer with farm specifications
    {
      const { req, res } = createMockReqRes({
        body: {
          name: 'Suresh Farmer',
          email: 'p2_test_farmer@agri.org',
          phone: '9876500002',
          password: 'Password123',
          role: 'farmer',
          location: 'Anand, Gujarat',
          farmName: 'Suresh Green Agro Farm',
          farmType: 'Wheat & Mustard'
        }
      });

      await registerUser(req, res);
      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(res.data.user.role, 'farmer');
      assert.strictEqual(res.data.user.farmName, 'Suresh Green Agro Farm');
      assert.strictEqual(res.data.user.farmType, 'Wheat & Mustard');

      farmerToken = res.data.token;
      createdFarmer = await User.findOne({ email: 'p2_test_farmer@agri.org' });
      assert.ok(createdFarmer, 'Farmer must be stored in database');
      console.log('✅ TEST 2 PASSED: Farmer registration saves farm metadata & issues JWT token.');
    }

    // TEST 3: Registration validation - missing required fields
    {
      const { req, res } = createMockReqRes({
        body: {
          name: 'Incomplete User',
          email: 'p2_test_incomplete@agri.org'
          // Missing phone, password, role, location
        }
      });

      await registerUser(req, res);
      assert.strictEqual(res.statusCode, 400, 'Should return HTTP 400 for missing fields');
      assert.strictEqual(res.data.success, false);
      console.log('✅ TEST 3 PASSED: Registration rejects requests with missing mandatory fields.');
    }

    // TEST 4: Registration validation - invalid role
    {
      const { req, res } = createMockReqRes({
        body: {
          name: 'Invalid Role User',
          email: 'p2_test_badrole@agri.org',
          phone: '9876500003',
          password: 'Password123',
          role: 'broker', // invalid role
          location: 'Surat'
        }
      });

      await registerUser(req, res);
      assert.strictEqual(res.statusCode, 400);
      assert.ok(res.data.message.includes('Invalid role'), 'Error message should mention invalid role');
      console.log('✅ TEST 4 PASSED: Registration rejects unauthorized roles (only farmer/worker permitted).');
    }

    // TEST 5: Registration validation - invalid email format
    {
      const { req, res } = createMockReqRes({
        body: {
          name: 'Bad Email User',
          email: 'not-a-valid-email',
          phone: '9876500004',
          password: 'Password123',
          role: 'worker',
          location: 'Surat'
        }
      });

      await registerUser(req, res);
      assert.strictEqual(res.statusCode, 400);
      assert.ok(res.data.message.toLowerCase().includes('valid email'));
      console.log('✅ TEST 5 PASSED: Registration validates email address format.');
    }

    // TEST 6: Registration validation - password length under 6 characters
    {
      const { req, res } = createMockReqRes({
        body: {
          name: 'Short Pass User',
          email: 'p2_test_shortpass@agri.org',
          phone: '9876500005',
          password: '123',
          role: 'worker',
          location: 'Surat'
        }
      });

      await registerUser(req, res);
      assert.strictEqual(res.statusCode, 400);
      assert.ok(res.data.message.includes('at least 6 characters'));
      console.log('✅ TEST 6 PASSED: Registration enforces minimum 6-character password constraint.');
    }

    // TEST 7: Duplicate email registration rejected
    {
      const { req, res } = createMockReqRes({
        body: {
          name: 'Duplicate Worker',
          email: 'p2_test_worker@agri.org', // Existing email from Test 1
          phone: '9876500099',
          password: 'Password123',
          role: 'worker',
          location: 'Ahmedabad'
        }
      });

      await registerUser(req, res);
      assert.strictEqual(res.statusCode, 400);
      assert.ok(res.data.message.toLowerCase().includes('already exists'));
      console.log('✅ TEST 7 PASSED: Duplicate registration attempts are rejected with clear error message.');
    }

    // TEST 8: Password hashing security verification
    {
      const workerFromDb = await User.findOne({ email: 'p2_test_worker@agri.org' }).select('+password');
      assert.ok(workerFromDb.password, 'Hashed password must exist in DB');
      assert.notStrictEqual(workerFromDb.password, 'Password123', 'Password must never be saved as plain text');
      assert.ok(/^\$2[ab]\$/.test(workerFromDb.password), 'Password hash must be valid bcrypt hash');

      const isMatch = await workerFromDb.matchPassword('Password123');
      assert.strictEqual(isMatch, true, 'bcrypt compare must confirm valid password');

      const isWrongMatch = await workerFromDb.matchPassword('WrongPassword');
      assert.strictEqual(isWrongMatch, false, 'bcrypt compare must reject incorrect password');
      console.log('✅ TEST 8 PASSED: Passwords are encrypted with bcrypt salt hashing and never stored as plaintext.');
    }

    // TEST 9: Successful user login
    {
      const { req, res } = createMockReqRes({
        body: {
          email: 'p2_test_worker@agri.org',
          password: 'Password123'
        }
      });

      await loginUser(req, res);
      assert.strictEqual(res.statusCode, 200, 'Login should return HTTP 200');
      assert.strictEqual(res.data.success, true);
      assert.ok(res.data.token, 'Login should issue a JWT token');
      assert.strictEqual(res.data.user.email, 'p2_test_worker@agri.org');
      assert.strictEqual(res.data.user.role, 'worker');
      console.log('✅ TEST 9 PASSED: Login authenticates credentials and returns JWT token with sanitized user data.');
    }

    // TEST 10: Login fails with wrong password
    {
      const { req, res } = createMockReqRes({
        body: {
          email: 'p2_test_worker@agri.org',
          password: 'IncorrectPassword'
        }
      });

      await loginUser(req, res);
      assert.strictEqual(res.statusCode, 401, 'Should return HTTP 401 for incorrect password');
      assert.strictEqual(res.data.success, false);
      assert.ok(res.data.message.toLowerCase().includes('invalid'));
      console.log('✅ TEST 10 PASSED: Login rejects incorrect password with 401 Unauthorized.');
    }

    // TEST 11: Login fails with non-existent email
    {
      const { req, res } = createMockReqRes({
        body: {
          email: 'p2_test_unregistered@agri.org',
          password: 'Password123'
        }
      });

      await loginUser(req, res);
      assert.strictEqual(res.statusCode, 401);
      console.log('✅ TEST 11 PASSED: Login rejects non-existent email accounts.');
    }

    // TEST 12A: Never issue DB-backed JWTs for memory-only accounts
    {
      memoryUsers.set(memoryOnlyEmail, {
        _id: new mongoose.Types.ObjectId().toString(),
        email: memoryOnlyEmail,
        password: await bcrypt.hash('Password123', 10),
        role: 'farmer'
      });

      const { req: loginReq, res: loginRes } = createMockReqRes({
        body: { email: memoryOnlyEmail, password: 'Password123' }
      });
      await loginUser(loginReq, loginRes);
      assert.strictEqual(loginRes.statusCode, 401, 'A connected database must not authenticate an in-memory-only user');

      const { req: registerReq, res: registerRes } = createMockReqRes({
        body: {
          name: 'Recovered Farmer',
          email: memoryOnlyEmail,
          phone: '9876500098',
          password: 'Password123',
          role: 'farmer',
          location: 'Anand, Gujarat'
        }
      });
      await registerUser(registerReq, registerRes);
      assert.strictEqual(registerRes.statusCode, 201, 'A missing in-memory account should be re-creatable in MongoDB');
      assert.ok(await User.findOne({ email: memoryOnlyEmail }), 'Recovered account must be persisted in MongoDB');
      console.log('✅ TEST 12A PASSED: Connected-database auth rejects phantom memory users and permits persistent account recovery.');
    }

    // TEST 12: Login fails with missing fields
    {
      const { req, res } = createMockReqRes({
        body: { email: 'p2_test_worker@agri.org' } // Missing password
      });

      await loginUser(req, res);
      assert.strictEqual(res.statusCode, 400);
      console.log('✅ TEST 12 PASSED: Login rejects incomplete credential payloads with 400 Bad Request.');
    }

    // TEST 13: Protected route access via JWT verification (protect middleware)
    {
      const { req, res } = createMockReqRes({
        headers: {
          authorization: `Bearer ${workerToken}`
        }
      });

      let nextCalled = false;
      await protect(req, res, () => { nextCalled = true; });

      assert.strictEqual(nextCalled, true, 'Valid Bearer token must pass protect middleware');
      assert.ok(req.user, 'protect middleware must attach authenticated user to req');
      assert.strictEqual(req.user.email, 'p2_test_worker@agri.org');
      console.log('✅ TEST 13 PASSED: JWT protect middleware authenticates valid Bearer token and attaches user.');
    }

    // TEST 14: Protected route rejects missing token
    {
      const { req, res } = createMockReqRes({ headers: {} });

      let nextCalled = false;
      await protect(req, res, () => { nextCalled = true; });

      assert.strictEqual(nextCalled, false, 'Missing token must be intercepted');
      assert.strictEqual(res.statusCode, 401);
      assert.ok(res.data.message.includes('No authentication token'));
      console.log('✅ TEST 14 PASSED: protect middleware rejects requests lacking Authorization headers.');
    }

    // TEST 15: Protected route rejects invalid/tampered token
    {
      const { req, res } = createMockReqRes({
        headers: {
          authorization: 'Bearer forged.tampered.token'
        }
      });

      let nextCalled = false;
      await protect(req, res, () => { nextCalled = true; });

      assert.strictEqual(nextCalled, false);
      assert.strictEqual(res.statusCode, 401);
      assert.ok(res.data.message.includes('Invalid or expired token'));
      console.log('✅ TEST 15 PASSED: protect middleware blocks forged or expired JWT tokens.');
    }

    // TEST 16: Role authorization middleware (requireRole)
    {
      const farmerMiddleware = requireRole('farmer');

      // Farmer accessing farmer route -> allowed
      const { req: allowedReq, res: allowedRes } = createMockReqRes({ user: createdFarmer });
      let farmerNext = false;
      farmerMiddleware(allowedReq, allowedRes, () => { farmerNext = true; });
      assert.strictEqual(farmerNext, true, 'Farmer should pass requireRole("farmer")');

      // Worker accessing farmer route -> blocked with 403
      const { req: blockedReq, res: blockedRes } = createMockReqRes({ user: createdWorker });
      let workerNext = false;
      farmerMiddleware(blockedReq, blockedRes, () => { workerNext = true; });
      assert.strictEqual(workerNext, false, 'Worker must be blocked from farmer route');
      assert.strictEqual(blockedRes.statusCode, 403, 'Should return HTTP 403 Forbidden');
      console.log('✅ TEST 16 PASSED: Role-based access control enforces strict role segregation.');
    }

    // TEST 17: Get current user profile (getMe)
    {
      const { req, res } = createMockReqRes({ user: createdWorker });
      await getMe(req, res);
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.data.user.email, 'p2_test_worker@agri.org');
      assert.strictEqual(res.data.user.skills, 'Tractor Driving, Cotton Picking');
      console.log('✅ TEST 17 PASSED: Current authenticated user can fetch their personal profile.');
    }

    // TEST 18: Update profile attributes
    {
      const { req, res } = createMockReqRes({
        user: createdWorker,
        body: {
          phone: '9876599999',
          location: 'Vadodara, Gujarat',
          skills: 'Harvesting, Weeding, Tractor Driving',
          availability: 'Part Time'
        }
      });

      await updateUserProfile(req, res);
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.data.user.phone, '9876599999');
      assert.strictEqual(res.data.user.location, 'Vadodara, Gujarat');
      assert.strictEqual(res.data.user.skills, 'Harvesting, Weeding, Tractor Driving');
      assert.strictEqual(res.data.user.availability, 'Part Time');
      console.log('✅ TEST 18 PASSED: Users can update their agricultural profile and contact information.');
    }

    // TEST 19: Role immutability enforcement
    {
      const { req, res } = createMockReqRes({
        user: createdWorker,
        body: {
          role: 'farmer' // Attempt to unlawfully upgrade role
        }
      });

      await updateUserProfile(req, res);
      assert.strictEqual(res.statusCode, 200);
      const reloadedWorker = await User.findById(createdWorker._id);
      assert.strictEqual(reloadedWorker.role, 'worker', 'User role must remain unchanged');
      console.log('✅ TEST 19 PASSED: Role immutability is strictly enforced during profile updates.');
    }

    // TEST 20: Privacy protection - Farmer cannot view unapplied worker profile
    {
      const { req, res } = createMockReqRes({
        user: createdFarmer,
        params: { id: createdWorker._id.toString() }
      });

      await getWorkerProfileForFarmer(req, res);
      assert.strictEqual(res.statusCode, 403, 'Should return HTTP 403 Forbidden when worker has not applied to farmer jobs');
      assert.strictEqual(res.data.success, false);
      console.log('✅ TEST 20 PASSED: Strict privacy protection blocks farmers from viewing worker profiles without application.');
    }

    // TEST 21: Authorized Farmer can view applicant worker profile with sensitive data concealed
    {
      // Create job by farmer and application by worker
      const p2Job = await Job.create({
        farmer: createdFarmer._id,
        title: 'Phase2 Wheat Sowing',
        crop: 'Wheat',
        workType: 'Sowing',
        wageAmount: 650,
        wageType: 'daily',
        workersRequired: 2,
        startDate: new Date(),
        durationValue: 3,
        durationUnit: 'days',
        location: 'Anand, Gujarat',
        description: 'Need skilled farm hands'
      });

      const p2App = await Application.create({
        job: p2Job._id,
        worker: createdWorker._id,
        message: 'Ready for sowing work'
      });

      const { req, res } = createMockReqRes({
        user: createdFarmer,
        params: { id: createdWorker._id.toString() }
      });

      await getWorkerProfileForFarmer(req, res);
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.worker.name, 'Ramesh Worker');
      assert.strictEqual(res.data.worker.skills, 'Harvesting, Weeding, Tractor Driving');
      assert.strictEqual(res.data.worker.password, undefined, 'Password hash must be excluded');
      assert.strictEqual(res.data.worker.email, undefined, 'Worker email must be private in review');
      assert.strictEqual(res.data.worker.phone, null, 'Worker phone number must remain concealed until accepted');
      console.log('✅ TEST 21 PASSED: Farmer can inspect applicant worker qualifications while private credentials remain concealed.');
    }

    // TEST 22: Logout endpoint
    {
      const { req, res } = createMockReqRes();
      await logoutUser(req, res);
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.data.success, true);
      console.log('✅ TEST 22 PASSED: Logout endpoint gracefully acknowledges session termination.');
    }

    console.log('\n🎉 ALL 23 PHASE 2 BACKEND TESTS PASSED (23/23 automated assertions succeeded)!\n');

  } catch (testError) {
    console.error('\n❌ Phase 2 Test Execution Failure:', testError);
    process.exit(1);
  } finally {
    await Application.deleteMany({ message: { $regex: /Ready for sowing work/i } });
    await Job.deleteMany({ title: { $regex: /Phase2/i } });
    await User.deleteMany({ email: { $regex: /^p2_test_/i } });
    memoryUsers.delete(memoryOnlyEmail);
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB. Cleaned up Phase 2 test fixtures.');
  }
}

runPhase2Tests();
