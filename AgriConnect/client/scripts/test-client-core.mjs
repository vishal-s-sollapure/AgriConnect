import assert from 'node:assert/strict';
import {
  REGIONAL_WAGE_BENCHMARKS,
  getWageParityAnalysis,
  calculateClientJobMatchScore
} from '../src/utils/aiMatching.js';
import {
  calculateHaversineDistance,
  resolveJobCoordinates
} from '../src/utils/geolocation.js';
import { formatNumber } from '../src/i18n/formatters.js';

console.log('🧪 Starting AgriConnect Client Core Logic Unit Tests...\n');

// 1. REGIONAL_WAGE_BENCHMARKS Table Verification
{
  assert.ok(REGIONAL_WAGE_BENCHMARKS.wheat, 'Wheat benchmarks must exist');
  assert.ok(REGIONAL_WAGE_BENCHMARKS.paddy, 'Paddy benchmarks must exist');
  assert.ok(REGIONAL_WAGE_BENCHMARKS.cotton, 'Cotton benchmarks must exist');
  assert.ok(REGIONAL_WAGE_BENCHMARKS.sugarcane, 'Sugarcane benchmarks must exist');
  assert.ok(REGIONAL_WAGE_BENCHMARKS.default, 'Default benchmarks must exist');
  assert.equal(typeof REGIONAL_WAGE_BENCHMARKS.wheat.harvesting, 'number');
  console.log('✅ TEST 1 PASSED: Regional wage benchmarks structure verified.');
}

// 2. getWageParityAnalysis - Fair, High, Below, and Non-Daily
{
  // Fair rate: wheat harvesting @ 650 (benchmark 650)
  const fairResult = getWageParityAnalysis('Wheat', 'Harvesting', 650, 'daily');
  assert.equal(fairResult.status, 'Fair');
  assert.equal(fairResult.diff, 0);

  // Competitive rate: wheat harvesting @ 750 (diff +100 >= 50)
  const compResult = getWageParityAnalysis('Wheat', 'Harvesting', 750, 'daily');
  assert.equal(compResult.status, 'Competitive');
  assert.equal(compResult.diff, 100);
  assert.ok(compResult.badgeText.includes('+₹100'));

  // Below average rate: wheat harvesting @ 500 (diff -150)
  const belowResult = getWageParityAnalysis('Wheat', 'Harvesting', 500, 'daily');
  assert.equal(belowResult.status, 'BelowAverage');
  assert.equal(belowResult.diff, -150);

  // Hourly / non-daily wage type returns Standard
  const hourlyResult = getWageParityAnalysis('Wheat', 'Harvesting', 100, 'hourly');
  assert.equal(hourlyResult.status, 'Standard');
  assert.equal(hourlyResult.badgeText, 'Market Rate');

  // Rice alias normalization
  const riceResult = getWageParityAnalysis('Rice', 'Harvesting', 680, 'daily');
  assert.equal(riceResult.status, 'Fair');
  console.log('✅ TEST 2 PASSED: Wage parity analysis handles market, high, below, and non-daily rates.');
}

// 3. calculateClientJobMatchScore - Skill & Proximity Scoring
{
  const dummyJob = {
    title: 'Wheat Sowing & Tilling',
    crop: 'Wheat',
    workType: 'Sowing',
    wageAmount: 600
  };

  const skilledWorker = {
    skills: 'Experienced in Wheat sowing and harvesting'
  };

  // Close proximity: <= 5 km
  const highResult = calculateClientJobMatchScore(dummyJob, skilledWorker, 3.2);
  const highMatch = highResult.matchScore;
  assert.ok(highMatch >= 90, `High match score should be >= 90, got ${highMatch}`);
  assert.ok(highMatch <= 99, `High match score capped at 99, got ${highMatch}`);
  assert.equal(highResult.matchPercentage, `${highMatch}%`);
  assert.ok(highResult.reasoning, 'Reasoning text must be present');

  // Medium proximity: 20 km
  const medResult = calculateClientJobMatchScore(dummyJob, skilledWorker, 20);
  const medMatch = medResult.matchScore;
  assert.ok(medMatch < highMatch, 'Closer proximity must yield higher match score');

  // Unskilled worker (generic agriculture)
  const genericWorker = { skills: 'General Farm Labor' };
  const genericResult = calculateClientJobMatchScore(dummyJob, genericWorker, 20);
  const genericMatch = genericResult.matchScore;
  assert.ok(genericMatch < medMatch, 'Skilled worker must score higher than generic worker');
  console.log('✅ TEST 3 PASSED: Client AI match score algorithm rewards crop skills and proximity.');
}

// 4. calculateHaversineDistance - Boundary & Mathematical Tests
{
  // Same coordinates -> 0 km
  const zeroDist = calculateHaversineDistance(18.5204, 73.8567, 18.5204, 73.8567);
  assert.equal(zeroDist, 0);

  // Pune to Mumbai: ~119 km
  const puneMumbai = calculateHaversineDistance(18.5204, 73.8567, 19.0760, 72.8777);
  assert.ok(puneMumbai >= 115 && puneMumbai <= 125, `Expected Pune-Mumbai ~119km, got ${puneMumbai}`);

  // Out of range latitude (> 90) -> returns null
  assert.equal(calculateHaversineDistance(95, 73, 18, 73), null);

  // Out of range longitude (> 180) -> returns null
  assert.equal(calculateHaversineDistance(18, 185, 18, 73), null);

  // NaN or non-numeric inputs -> returns null
  assert.equal(calculateHaversineDistance(NaN, 73, 18, 73), null);
  assert.equal(calculateHaversineDistance(null, 73, 18, 73), null);
  console.log('✅ TEST 4 PASSED: Client Haversine distance handles valid and boundary conditions.');
}

// 5. resolveJobCoordinates - Explicit & Named Fallback Resolution
{
  // Explicit valid coordinates
  const explicitJob = { latitude: 18.8284, longitude: 74.3789, location: 'Shirur, Pune' };
  const explicitCoords = resolveJobCoordinates(explicitJob);
  assert.equal(explicitCoords.lat, 18.8284);
  assert.equal(explicitCoords.lng, 74.3789);
  assert.equal(explicitCoords.approximate, false);

  // Fallback to regional coordinates dictionary
  const fallbackJob = { location: 'Anand, Gujarat' };
  const fallbackCoords = resolveJobCoordinates(fallbackJob);
  assert.ok(fallbackCoords, 'Expected fallback coordinates for Anand');
  assert.equal(fallbackCoords.approximate, true);
  assert.equal(fallbackCoords.lat, 22.5645);

  // Unknown location without coordinates -> null
  const unknownJob = { location: 'Unknown Fantasy Village 99' };
  assert.equal(resolveJobCoordinates(unknownJob), null);
  console.log('✅ TEST 5 PASSED: resolveJobCoordinates resolves GPS pins and text fallbacks.');
}

// 6. formatNumber - Localization Formatter
{
  assert.equal(formatNumber(1250, 'en'), '1,250');
  assert.equal(formatNumber(0, 'en'), '0');
  console.log('✅ TEST 6 PASSED: Localization number formatter verified.');
}

console.log('\n🎉 ALL CLIENT CORE LOGIC TESTS PASSED (6/6 test groups succeeded)!\n');
