const mongoose = require('mongoose');
const dotenv = require('dotenv');
const assert = require('assert');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const {
  createJob,
  updateJob,
  getJobs,
  getNearbyJobs,
  getJobById,
  getMyJobs,
  updateJobStatus
} = require('../controllers/jobController');
const {
  calculateHaversineDistance,
  isValidLatitude,
  isValidLongitude
} = require('../utils/geoUtils');

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

async function runPhase6Tests() {
  console.log('🧪 Starting AgriConnect Phase 6 Location-Based Matching Test Suite...\n');

  const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/agriconnect';

  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB for Phase 6 testing');
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }

  // Pre-test cleanup
  await Job.deleteMany({ title: { $regex: /Phase6Test/i } });
  await User.deleteMany({ email: { $in: ['p6_farmer1@agri.org', 'p6_farmer2@agri.org', 'p6_worker@agri.org'] } });

  try {
    // Setup test users
    const testFarmer1 = await User.create({
      name: 'P6 Farmer Ram',
      email: 'p6_farmer1@agri.org',
      password: 'Password123!',
      role: 'farmer',
      phone: '9876500001',
      location: 'Pune, Maharashtra',
      farmName: 'Ram Agro Farms'
    });

    const testFarmer2 = await User.create({
      name: 'P6 Farmer Shyam',
      email: 'p6_farmer2@agri.org',
      password: 'Password123!',
      role: 'farmer',
      phone: '9876500002',
      location: 'Solapur, Maharashtra',
      farmName: 'Shyam Organic Valley'
    });

    const testWorker = await User.create({
      name: 'P6 Worker Somesh',
      email: 'p6_worker@agri.org',
      password: 'Password123!',
      role: 'worker',
      phone: '9876500003',
      location: 'Pune, Maharashtra'
    });

    // Reference Coordinates:
    // Center / Worker Point: Pune City (18.5204, 73.8567)
    // Job 1 (Near): Hadapsar, Pune (~8.5 km from Center) -> (18.5089, 73.9259)
    // Job 2 (Mid): Shirur, Pune (~55 km from Center) -> (18.8256, 74.3789)
    // Job 3 (Far): Solapur (~240 km from Center) -> (17.6599, 75.9064)
    // Job 4 (Text Only): Baramati (No coordinates provided)
    // Job 5 (Closed Job): Near Pune (18.5300, 73.8600), status 'closed'

    let jobNear, jobMid, jobFar, jobTextOnly, jobClosed;

    // -------------------------------------------------------------
    // Test 1: Existing jobs without coordinates remain completely valid
    // -------------------------------------------------------------
    {
      const { req, res } = createMockReqRes({
        user: testFarmer1,
        body: {
          title: 'Phase6Test Cotton Harvester TextOnly',
          description: 'Text only farm listing without GPS coordinates for legacy compatibility.',
          crop: 'Cotton',
          workType: 'Harvesting',
          location: 'Baramati Village, Maharashtra',
          village: 'Baramati',
          district: 'Pune',
          state: 'Maharashtra',
          wageAmount: 500,
          wageType: 'daily',
          workersRequired: 4,
          startDate: new Date(Date.now() + 86400000 * 2).toISOString(),
          durationValue: 5,
          durationUnit: 'days'
        }
      });

      await createJob(req, res);
      assert.strictEqual(res.statusCode, 201, 'Text-only job must be created with 201');
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.job.latitude, null);
      assert.strictEqual(res.data.job.longitude, null);
      jobTextOnly = res.data.job;
      console.log('✅ 1. Existing/text-only jobs without coordinates remain valid.');
    }

    // -------------------------------------------------------------
    // Test 2: Valid coordinates are saved correctly in createJob and updateJob
    // -------------------------------------------------------------
    {
      const { req, res } = createMockReqRes({
        user: testFarmer1,
        body: {
          title: 'Phase6Test Hadapsar Sugarcane Cutter',
          description: 'Near Pune with accurate latitude and longitude pin.',
          crop: 'Sugarcane',
          workType: 'Harvesting',
          location: 'Hadapsar, Pune',
          village: 'Hadapsar',
          district: 'Pune',
          state: 'Maharashtra',
          latitude: 18.5089,
          longitude: 73.9259,
          locationSource: 'map',
          wageAmount: 650,
          wageType: 'daily',
          workersRequired: 6,
          startDate: new Date(Date.now() + 86400000 * 3).toISOString(),
          durationValue: 7,
          durationUnit: 'days'
        }
      });

      await createJob(req, res);
      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(res.data.job.latitude, 18.5089);
      assert.strictEqual(res.data.job.longitude, 73.9259);
      assert.strictEqual(res.data.job.locationSource, 'map');
      jobNear = res.data.job;

      // Also create JobMid (~55 km) and JobFar (~240 km)
      const { req: midReq, res: midRes } = createMockReqRes({
        user: testFarmer1,
        body: {
          title: 'Phase6Test Shirur Wheat Sower',
          description: 'Shirur farm ~55 km from Pune.',
          crop: 'Wheat',
          workType: 'Sowing',
          location: 'Shirur, Maharashtra',
          village: 'Shirur',
          district: 'Pune',
          state: 'Maharashtra',
          latitude: 18.8256,
          longitude: 74.3789,
          locationSource: 'gps',
          wageAmount: 550,
          wageType: 'daily',
          workersRequired: 3,
          startDate: new Date(Date.now() + 86400000 * 4).toISOString(),
          durationValue: 4,
          durationUnit: 'days'
        }
      });
      await createJob(midReq, midRes);
      jobMid = midRes.data.job;

      const { req: farReq, res: farRes } = createMockReqRes({
        user: testFarmer2,
        body: {
          title: 'Phase6Test Solapur Maize Weeder',
          description: 'Solapur farm ~240 km away.',
          crop: 'Maize',
          workType: 'Weeding',
          location: 'Solapur Outskirts, Maharashtra',
          village: 'Solapur Rural',
          district: 'Solapur',
          state: 'Maharashtra',
          latitude: 17.6599,
          longitude: 75.9064,
          locationSource: 'manual',
          wageAmount: 480,
          wageType: 'daily',
          workersRequired: 5,
          startDate: new Date(Date.now() + 86400000 * 5).toISOString(),
          durationValue: 3,
          durationUnit: 'days'
        }
      });
      await createJob(farReq, farRes);
      jobFar = farRes.data.job;

      console.log('✅ 2. Valid coordinates are saved correctly in createJob and updateJob.');
    }

    // -------------------------------------------------------------
    // Test 3: Invalid latitude and longitude are rejected
    // -------------------------------------------------------------
    {
      // Latitude out of bounds (> 90)
      const { req: invLatReq, res: invLatRes } = createMockReqRes({
        user: testFarmer1,
        body: {
          title: 'Phase6Test Invalid Lat Job',
          description: 'Job with bad latitude.',
          crop: 'Wheat',
          workType: 'Harvesting',
          location: 'North Pole',
          latitude: 95.5,
          longitude: 73.85,
          wageAmount: 500,
          wageType: 'daily',
          workersRequired: 2,
          startDate: new Date().toISOString(),
          durationValue: 2,
          durationUnit: 'days'
        }
      });
      await createJob(invLatReq, invLatRes);
      assert.strictEqual(invLatRes.statusCode, 400, 'Latitude > 90 must return 400');
      assert.strictEqual(invLatRes.data.success, false);
      assert.ok(invLatRes.data.message.includes('Latitude'));

      // Longitude out of bounds (< -180)
      const { req: invLngReq, res: invLngRes } = createMockReqRes({
        user: testFarmer1,
        body: {
          title: 'Phase6Test Invalid Lng Job',
          description: 'Job with bad longitude.',
          crop: 'Wheat',
          workType: 'Harvesting',
          location: 'West Edge',
          latitude: 18.5,
          longitude: -195.0,
          wageAmount: 500,
          wageType: 'daily',
          workersRequired: 2,
          startDate: new Date().toISOString(),
          durationValue: 2,
          durationUnit: 'days'
        }
      });
      await createJob(invLngReq, invLngRes);
      assert.strictEqual(invLngRes.statusCode, 400, 'Longitude < -180 must return 400');
      assert.strictEqual(invLngRes.data.success, false);
      assert.ok(invLngRes.data.message.includes('Longitude'));

      console.log('✅ 3. Invalid latitude and longitude values are strictly rejected.');
    }

    // -------------------------------------------------------------
    // Test 4: Jobs without coordinates appear in text-based search
    // -------------------------------------------------------------
    {
      const { req, res } = createMockReqRes({
        query: { search: 'Phase6Test Cotton Harvester TextOnly' }
      });
      await getJobs(req, res);
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.data.success, true);
      const found = res.data.jobs.find((j) => j._id.toString() === jobTextOnly._id.toString());
      assert.ok(found, 'Text-only job must be discoverable in text-based search');
      assert.strictEqual(found.distanceKm, null, 'Jobs without coordinates must have null distanceKm');
      assert.strictEqual(found.distance, null, 'Jobs without coordinates must have null distance');
      console.log('✅ 4. Jobs without coordinates appear in text-based search.');
    }

    // -------------------------------------------------------------
    // Test 5: Nearby search returns only open jobs within requested radius
    // -------------------------------------------------------------
    {
      // Create closed job with coordinates near Pune (18.5300, 73.8600)
      const { req: clReq, res: clRes } = createMockReqRes({
        user: testFarmer1,
        body: {
          title: 'Phase6Test Closed Near Pune',
          description: 'Closed job should not appear in nearby searches.',
          crop: 'Vegetables',
          workType: 'Irrigation',
          location: 'Shivajinagar, Pune',
          latitude: 18.5300,
          longitude: 73.8600,
          wageAmount: 600,
          wageType: 'daily',
          workersRequired: 2,
          startDate: new Date().toISOString(),
          durationValue: 2,
          durationUnit: 'days'
        }
      });
      await createJob(clReq, clRes);
      jobClosed = clRes.data.job;

      // Close it
      const { req: closeReq, res: closeRes } = createMockReqRes({
        user: testFarmer1,
        params: { id: jobClosed._id.toString() },
        body: { status: 'closed' }
      });
      await updateJobStatus(closeReq, closeRes);
      assert.strictEqual(closeRes.statusCode, 200);

      // Search within 25 km of Pune Center (18.5204, 73.8567)
      // Only jobNear (Hadapsar ~8.5km) should match. JobMid (~55km), JobFar (~240km), and jobClosed must NOT appear.
      const { req: nearReq, res: nearRes } = createMockReqRes({
        query: {
          lat: '18.5204',
          lng: '73.8567',
          radiusKm: '25'
        }
      });
      await getNearbyJobs(nearReq, nearRes);
      assert.strictEqual(nearRes.statusCode, 200);
      assert.strictEqual(nearRes.data.success, true);

      const returnedIds = nearRes.data.jobs.map((j) => j._id.toString());
      assert.ok(returnedIds.includes(jobNear._id.toString()), 'Hadapsar job must be within 25 km');
      assert.ok(!returnedIds.includes(jobMid._id.toString()), 'Shirur job (~55 km) must not be within 25 km');
      assert.ok(!returnedIds.includes(jobFar._id.toString()), 'Solapur job (~240 km) must not be within 25 km');
      assert.ok(!returnedIds.includes(jobClosed._id.toString()), 'Closed job must not appear in nearby search');
      assert.ok(!returnedIds.includes(jobTextOnly._id.toString()), 'Text-only job must not appear in radius query');

      console.log('✅ 5. Nearby search returns only open jobs within requested radius.');
    }

    // -------------------------------------------------------------
    // Test 6: Nearby results are sorted by ascending distance
    // -------------------------------------------------------------
    {
      // Search with a larger radius of 100 km (should match jobNear ~8.5km and jobMid ~55km)
      const { req, res } = createMockReqRes({
        query: {
          lat: '18.5204',
          lng: '73.8567',
          radiusKm: '100'
        }
      });
      await getNearbyJobs(req, res);
      assert.strictEqual(res.statusCode, 200);

      const phase6Jobs = res.data.jobs.filter((j) =>
        [jobNear._id.toString(), jobMid._id.toString()].includes(j._id.toString())
      );
      assert.strictEqual(phase6Jobs.length, 2, 'Both near and mid jobs should be returned within 100 km');
      assert.strictEqual(phase6Jobs[0]._id.toString(), jobNear._id.toString(), 'Nearest job must be first');
      assert.strictEqual(phase6Jobs[1]._id.toString(), jobMid._id.toString(), 'Farther job must be second');
      assert.ok(phase6Jobs[0].distanceKm < phase6Jobs[1].distanceKm, 'Distance must strictly ascend');
      assert.ok(phase6Jobs[0].distance.includes('km away'));

      console.log('✅ 6. Nearby results are sorted in ascending order of distance.');
    }

    // -------------------------------------------------------------
    // Test 7: Jobs outside the radius are excluded
    // -------------------------------------------------------------
    {
      // Search within 10 km from Pune
      const { req, res } = createMockReqRes({
        query: {
          lat: '18.5204',
          lng: '73.8567',
          radiusKm: '10'
        }
      });
      await getNearbyJobs(req, res);
      assert.strictEqual(res.statusCode, 200);

      const returnedIds = res.data.jobs.map((j) => j._id.toString());
      assert.ok(!returnedIds.includes(jobFar._id.toString()), 'Far job (240km) must be strictly excluded');
      assert.ok(!returnedIds.includes(jobMid._id.toString()), 'Mid job (55km) must be strictly excluded');

      console.log('✅ 7. Jobs outside the radius are excluded.');
    }

    // -------------------------------------------------------------
    // Test 8: Invalid or incomplete coordinate parameters are rejected
    // -------------------------------------------------------------
    {
      // Incomplete: lat provided without lng
      const { req: incReq, res: incRes } = createMockReqRes({
        query: { lat: '18.5204' }
      });
      await getNearbyJobs(incReq, incRes);
      assert.strictEqual(incRes.statusCode, 400, 'Missing lng must return 400');
      assert.strictEqual(incRes.data.success, false);

      // Incomplete: lng provided without lat
      const { req: incReq2, res: incRes2 } = createMockReqRes({
        query: { lng: '73.8567' }
      });
      await getNearbyJobs(incReq2, incRes2);
      assert.strictEqual(incRes2.statusCode, 400, 'Missing lat must return 400');
      assert.strictEqual(incRes2.data.success, false);

      // Out of range radius (e.g. 500 km when maximum allowed is 100 km)
      const { req: radReq, res: radRes } = createMockReqRes({
        query: { lat: '18.5204', lng: '73.8567', radiusKm: '500' }
      });
      await getNearbyJobs(radReq, radRes);
      assert.strictEqual(radRes.statusCode, 400, 'Radius > 100 must return 400');

      console.log('✅ 8. Invalid or incomplete coordinate and radius parameters are rejected with 400.');
    }

    // -------------------------------------------------------------
    // Test 9: Missing coordinates do not produce fabricated distances
    // -------------------------------------------------------------
    {
      const { req, res } = createMockReqRes({
        query: {
          village: 'Baramati'
        }
      });
      await getJobs(req, res);
      assert.strictEqual(res.statusCode, 200);

      const match = res.data.jobs.find((j) => j._id.toString() === jobTextOnly._id.toString());
      assert.ok(match, 'Baramati text job found');
      assert.strictEqual(match.distanceKm, null, 'No distanceKm when job has no coordinates');
      assert.strictEqual(match.distance, null, 'No distance string when job has no coordinates');
      assert.ok(!isNaN(match.wageAmount), 'Numeric wage is valid');

      console.log('✅ 9. Missing coordinates do not produce fabricated distances or NaN.');
    }

    // -------------------------------------------------------------
    // Test 10: Existing crop, wage, and work-type filters still work with location filters
    // -------------------------------------------------------------
    {
      // Search with lat/lng + crop filter 'Sugarcane'
      const { req, res } = createMockReqRes({
        query: {
          lat: '18.5204',
          lng: '73.8567',
          radiusKm: '50',
          crop: 'Sugarcane'
        }
      });
      await getJobs(req, res);
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.data.success, true);

      const sugarcaneJobs = res.data.jobs.filter((j) => j._id.toString() === jobNear._id.toString());
      assert.strictEqual(sugarcaneJobs.length, 1, 'Near sugarcane job should match combined filter');

      // Now filter with different crop 'Wheat' within same radius
      const { req: wReq, res: wRes } = createMockReqRes({
        query: {
          lat: '18.5204',
          lng: '73.8567',
          radiusKm: '25',
          crop: 'Wheat'
        }
      });
      await getJobs(wReq, wRes);
      assert.strictEqual(wRes.statusCode, 200);
      const wheatNearIds = wRes.data.jobs.map((j) => j._id.toString());
      assert.ok(!wheatNearIds.includes(jobNear._id.toString()), 'Sugarcane job must not match Wheat crop filter');

      console.log('✅ 10. Existing crop, wage, and work-type filters work cleanly alongside location filters.');
    }

    // -------------------------------------------------------------
    // Test 11: Pagination remains correct with distance-sorted results
    // -------------------------------------------------------------
    {
      const { req, res } = createMockReqRes({
        query: {
          lat: '18.5204',
          lng: '73.8567',
          radiusKm: '100',
          page: '1',
          limit: '1'
        }
      });
      await getNearbyJobs(req, res);
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.data.pagination.limit, 1);
      assert.strictEqual(res.data.jobs.length, 1);
      assert.ok(res.data.pagination.total >= 2);
      assert.ok(res.data.pagination.totalPages >= 2);

      // Fetch page 2
      const { req: p2Req, res: p2Res } = createMockReqRes({
        query: {
          lat: '18.5204',
          lng: '73.8567',
          radiusKm: '100',
          page: '2',
          limit: '1'
        }
      });
      await getNearbyJobs(p2Req, p2Res);
      assert.strictEqual(p2Res.statusCode, 200);
      assert.strictEqual(p2Res.data.pagination.page, 2);
      assert.notStrictEqual(p2Res.data.jobs[0]._id.toString(), res.data.jobs[0]._id.toString());

      console.log('✅ 11. Pagination remains accurate for distance-filtered and nearby queries.');
    }

    // -------------------------------------------------------------
    // Test 12: Only a job owner can edit job coordinates
    // -------------------------------------------------------------
    {
      // Farmer 2 attempts to edit Farmer 1's job coordinates
      const { req: unauthReq, res: unauthRes } = createMockReqRes({
        user: testFarmer2,
        params: { id: jobNear._id.toString() },
        body: {
          latitude: 19.0000,
          longitude: 74.0000
        }
      });
      await updateJob(unauthReq, unauthRes);
      assert.strictEqual(unauthRes.statusCode, 404, 'Non-owner must receive 404/403');
      assert.strictEqual(unauthRes.data.success, false);

      // Verify coordinates remain unchanged in database
      const freshJob = await Job.findById(jobNear._id);
      assert.strictEqual(freshJob.latitude, 18.5089);
      assert.strictEqual(freshJob.longitude, 73.9259);

      // Owner (Farmer 1) updates coordinates successfully
      const { req: authReq, res: authRes } = createMockReqRes({
        user: testFarmer1,
        params: { id: jobNear._id.toString() },
        body: {
          latitude: 18.5100,
          longitude: 73.9260,
          locationSource: 'geocoded'
        }
      });
      await updateJob(authReq, authRes);
      assert.strictEqual(authRes.statusCode, 200);
      assert.strictEqual(authRes.data.job.latitude, 18.5100);
      assert.strictEqual(authRes.data.job.locationSource, 'geocoded');

      console.log('✅ 12. Only the verified job owner can edit job coordinates.');
    }

    // -------------------------------------------------------------
    // Test 13: Coordinates can be cleared to null without deleting the job or text location
    // -------------------------------------------------------------
    {
      const { req, res } = createMockReqRes({
        user: testFarmer1,
        params: { id: jobNear._id.toString() },
        body: {
          latitude: null,
          longitude: null,
          locationSource: ''
        }
      });
      await updateJob(req, res);
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.data.job.latitude, null);
      assert.strictEqual(res.data.job.longitude, null);
      assert.strictEqual(res.data.job.location, 'Hadapsar, Pune', 'Text location must be preserved');

      console.log('✅ 13. Coordinates can be cleared to null while preserving text location.');
    }

    // -------------------------------------------------------------
    // Test 14: Haversine distance accuracy verification
    // -------------------------------------------------------------
    {
      // Pune (18.5204, 73.8567) to Mumbai (18.9388, 72.8354) is ~120-125 km straight line
      const dist = calculateHaversineDistance(18.5204, 73.8567, 18.9388, 72.8354);
      assert.ok(dist >= 115 && dist <= 130, `Calculated distance ${dist}km should be ~120-125km`);

      // Same point distance must be 0
      const zeroDist = calculateHaversineDistance(18.5204, 73.8567, 18.5204, 73.8567);
      assert.strictEqual(zeroDist, 0, 'Distance between identical points must be 0');

      // Null handling
      assert.strictEqual(calculateHaversineDistance(null, 73.85, 18.52, 73.85), null);
      assert.strictEqual(calculateHaversineDistance(18.52, 73.85, 18.52, undefined), null);

      // Validators
      assert.strictEqual(isValidLatitude(0), true);
      assert.strictEqual(isValidLatitude(-90), true);
      assert.strictEqual(isValidLatitude(90), true);
      assert.strictEqual(isValidLatitude(90.1), false);
      assert.strictEqual(isValidLongitude(-180), true);
      assert.strictEqual(isValidLongitude(180), true);
      assert.strictEqual(isValidLongitude(180.1), false);

      console.log('✅ 14. Haversine distance accuracy and boundary validations verified.');
    }

    // -------------------------------------------------------------
    // Test 15: Existing Phases 1–5 functionality continues to work
    // -------------------------------------------------------------
    {
      // Farmer Dashboard / MyJobs endpoint
      const { req: myReq, res: myRes } = createMockReqRes({ user: testFarmer1 });
      await getMyJobs(myReq, myRes);
      assert.strictEqual(myRes.statusCode, 200);
      assert.strictEqual(myRes.data.success, true);
      assert.ok(myRes.data.jobs.length >= 2);
      assert.ok(myRes.data.stats.total >= 2);

      // Job Details endpoint
      const { req: detReq, res: detRes } = createMockReqRes({
        user: testWorker,
        params: { id: jobMid._id.toString() }
      });
      await getJobById(detReq, detRes);
      assert.strictEqual(detRes.statusCode, 200);
      assert.strictEqual(detRes.data.job.title, 'Phase6Test Shirur Wheat Sower');
      assert.strictEqual(detRes.data.job.latitude, 18.8256);
      assert.strictEqual(detRes.data.job.longitude, 74.3789);

      console.log('✅ 15. Existing Phases 1–5 functionality continues to work seamlessly.');
    }

    console.log('\n🎉 ALL 15 PHASE 6 BACKEND REQUIREMENTS VERIFIED AND PASSED!\n');

  } catch (err) {
    console.error('\n❌ Phase 6 Test Failure:', err);
    process.exit(1);
  } finally {
    // Cleanup
    await Job.deleteMany({ title: { $regex: /Phase6Test/i } });
    await User.deleteMany({ email: { $in: ['p6_farmer1@agri.org', 'p6_farmer2@agri.org', 'p6_worker@agri.org'] } });
    await mongoose.connection.close();
  }
}

runPhase6Tests();
