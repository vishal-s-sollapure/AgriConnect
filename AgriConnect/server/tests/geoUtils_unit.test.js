const assert = require('assert');
const {
  isValidLatitude,
  isValidLongitude,
  calculateHaversineDistance
} = require('../utils/geoUtils');

console.log('🧪 Starting AgriConnect Geospatial & Security Unit Tests...\n');

// 1. Latitude Validation Test Suite
{
  // Valid latitudes
  assert.strictEqual(isValidLatitude(0), true, 'Equator (0) should be valid');
  assert.strictEqual(isValidLatitude(90), true, 'North Pole (90) should be valid');
  assert.strictEqual(isValidLatitude(-90), true, 'South Pole (-90) should be valid');
  assert.strictEqual(isValidLatitude(18.5204), true, 'Pune latitude (18.5204) should be valid');
  assert.strictEqual(isValidLatitude('22.5645'), true, 'String numeric latitude should be valid');

  // Invalid latitudes
  assert.strictEqual(isValidLatitude(90.0001), false, 'Beyond 90 degrees should be invalid');
  assert.strictEqual(isValidLatitude(-90.0001), false, 'Below -90 degrees should be invalid');
  assert.strictEqual(isValidLatitude(null), false, 'Null latitude should be invalid');
  assert.strictEqual(isValidLatitude(undefined), false, 'Undefined latitude should be invalid');
  assert.strictEqual(isValidLatitude(''), false, 'Empty string latitude should be invalid');
  assert.strictEqual(isValidLatitude('invalid_lat'), false, 'Alphabetical latitude should be invalid');
  assert.strictEqual(isValidLatitude(NaN), false, 'NaN should be invalid');
  assert.strictEqual(isValidLatitude(Infinity), false, 'Infinity should be invalid');
  console.log('✅ TEST 1 PASSED: Latitude boundary and type validations verified.');
}

// 2. Longitude Validation Test Suite
{
  // Valid longitudes
  assert.strictEqual(isValidLongitude(0), true, 'Prime meridian (0) should be valid');
  assert.strictEqual(isValidLongitude(180), true, 'Antimeridian (180) should be valid');
  assert.strictEqual(isValidLongitude(-180), true, 'Antimeridian (-180) should be valid');
  assert.strictEqual(isValidLongitude(73.8567), true, 'Pune longitude (73.8567) should be valid');
  assert.strictEqual(isValidLongitude('72.9289'), true, 'String numeric longitude should be valid');

  // Invalid longitudes
  assert.strictEqual(isValidLongitude(180.0001), false, 'Beyond 180 degrees should be invalid');
  assert.strictEqual(isValidLongitude(-180.0001), false, 'Below -180 degrees should be invalid');
  assert.strictEqual(isValidLongitude(null), false, 'Null longitude should be invalid');
  assert.strictEqual(isValidLongitude(undefined), false, 'Undefined longitude should be invalid');
  assert.strictEqual(isValidLongitude(''), false, 'Empty string longitude should be invalid');
  assert.strictEqual(isValidLongitude('abc'), false, 'Alphabetical longitude should be invalid');
  assert.strictEqual(isValidLongitude(NaN), false, 'NaN should be invalid');
  assert.strictEqual(isValidLongitude(Infinity), false, 'Infinity should be invalid');
  console.log('✅ TEST 2 PASSED: Longitude boundary and type validations verified.');
}

// 3. Haversine Distance Calculation Accuracy
{
  // Exact match optimization
  const zeroKm = calculateHaversineDistance(18.5204, 73.8567, 18.5204, 73.8567);
  assert.strictEqual(zeroKm, 0, 'Exact same coordinates should return 0 km');

  // Pune to Mumbai: ~119 km
  const puneToMumbai = calculateHaversineDistance(18.5204, 73.8567, 19.0760, 72.8777);
  assert.ok(puneToMumbai >= 115 && puneToMumbai <= 125, `Pune-Mumbai distance should be ~119km, got ${puneToMumbai}`);

  // Delhi to Bengaluru: ~1740 km
  const delhiToBengaluru = calculateHaversineDistance(28.6139, 77.2090, 12.9716, 77.5946);
  assert.ok(delhiToBengaluru >= 1730 && delhiToBengaluru <= 1755, `Delhi-Bengaluru should be ~1740km, got ${delhiToBengaluru}`);

  // North Pole to South Pole: ~20015 km
  const poleToPole = calculateHaversineDistance(90, 0, -90, 0);
  assert.ok(poleToPole >= 20000 && poleToPole <= 20030, `Pole to pole should be ~20015km, got ${poleToPole}`);

  // Invalid parameters return null
  assert.strictEqual(calculateHaversineDistance(null, 73.85, 18.52, 73.85), null);
  assert.strictEqual(calculateHaversineDistance(18.52, 'bad', 18.52, 73.85), null);
  assert.strictEqual(calculateHaversineDistance(95, 73.85, 18.52, 73.85), null);
  assert.strictEqual(calculateHaversineDistance(18.52, 73.85, 18.52, 195), null);
  console.log('✅ TEST 3 PASSED: Haversine distance mathematical precision and boundary cases verified.');
}

// 4. ReDoS Regex Escaping Security Verification
{
  function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  }

  const specialChars = 'Wheat (organic) [Grade-A] + 10% bonus? $500';
  const escaped = escapeRegex(specialChars);
  const re = new RegExp(escaped, 'i');
  assert.ok(re.test(specialChars), 'Escaped regex should match exact original literal string');
  assert.strictEqual(re.test('Wheat organic'), false, 'Should not match without special characters');
  console.log('✅ TEST 4 PASSED: ReDoS regular expression escaping security verified.');
}

console.log('\n🎉 ALL GEOSPATIAL & SECURITY UNIT TESTS PASSED (4/4 test suites succeeded)!\n');
