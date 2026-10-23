const assert = require('assert');
const aiService = require('../services/aiService');

async function run() {
  const distance = aiService.calculateHaversineDistance(0, 0, 0, 1);
  assert(Math.abs(distance - 111.2) < 0.2, 'Haversine distance should be measured in kilometers');
  assert.strictEqual(aiService.calculateHaversineDistance(91, 0, 0, 0), null, 'Invalid coordinates should not produce a distance');

  const job = {
    crop: 'Wheat',
    workType: 'Harvesting',
    wageAmount: 700,
    wageType: 'daily',
    latitude: 0,
    longitude: 0
  };
  const colocatedMatch = aiService.calculateJobMatchScore(job, { skills: 'Wheat harvesting' }, { lat: 0, lng: 0 });
  assert.strictEqual(colocatedMatch.distanceKm, 0, 'Equator and prime-meridian coordinates should be supported');
  assert(colocatedMatch.matchScore >= 90, 'Relevant skills, fair wages, and proximity should raise the match score');

  const recommendations = await aiService.getAIRecommendationsForWorker(
    { skills: 'Wheat harvesting', experience: '5 years' },
    [job, { ...job, _id: 'far-job', latitude: 30, longitude: 30 }],
    { lat: 0, lng: 0 }
  );
  assert(recommendations[0].aiMatchScore >= recommendations[1].aiMatchScore, 'Recommendations should be ranked by match score');

  const wage = await aiService.getWagePrediction({ crop: 'Wheat', workType: 'Harvesting' });
  assert(wage.recommendedWage >= wage.minWage && wage.recommendedWage <= wage.maxWage, 'Recommended wages should be inside the estimate range');
  assert(!wage.advice.includes('guarantees'), 'Wage guidance must not promise a hiring outcome');
  assert.strictEqual(aiService.getWageParityAnalysis('Paddy / Rice', 'Harvesting', 680).benchmark, 680);

  const forecast = await aiService.getDemandForecast('Karnataka, India');
  assert.strictEqual(forecast.region, 'Karnataka, India');
  assert.strictEqual(forecast.peakDemandCrops.length, 4);
  assert(forecast.peakDemandCrops.every((item) => item.demandIndex >= 0 && item.demandIndex <= 100));
  assert(forecast.forecastNotes.includes('not live job-market data'), 'Forecast should disclose that values are seasonal estimates');

  const voiceQueries = [
    ['Show nearby wheat harvesting jobs', 'en-US'],
    ['गेहूं की कटाई का काम दिखाओ', 'hi-IN'],
    ['મારી નજીકનું કપાસનું કામ', 'gu-IN'],
    ['ನನ್ನ ಅರ್ಜಿ ಸ್ಥಿತಿ', 'kn-IN'],
    ['என் விண்ணப்பம்', 'ta-IN'],
    ['నా దరఖాస్తు', 'te-IN']
  ];
  for (const [transcript, language] of voiceQueries) {
    const response = await aiService.processVoiceInput(transcript, language);
    assert(response.targetUrl, `Voice intent should return a navigation target for ${language}`);
    assert(response.spokenResponse, `Voice intent should return localized text for ${language}`);
  }

  console.log('Phase 6–7 AI checks passed (19 assertions).');
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
