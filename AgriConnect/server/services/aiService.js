/**
 * AgriConnect AI Service (Phase 6 & Phase 7)
 * Implements:
 * 1. Geolocation & Haversine Distance Calculation (Phase 6)
 * 2. Multi-parameter AI Worker-Job Match Scoring & Reasoning (Phase 6)
 * 3. Smart Agricultural Wage Parity & Predictive Pricing (Phase 6/7)
 * 4. Regional Seasonal Labor Demand Forecasting (Phase 7)
 * 5. Multilingual Natural Language Voice Intent Parser & TTS Generation (Phase 7)
 */

// Haversine formula to compute great-circle distance in kilometers between two GPS coordinates
exports.calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const numLat1 = parseFloat(lat1);
  const numLon1 = parseFloat(lon1);
  const numLat2 = parseFloat(lat2);
  const numLon2 = parseFloat(lon2);
  if (isNaN(numLat1) || isNaN(numLon1) || isNaN(numLat2) || isNaN(numLon2)) return null;
  if (
    Math.abs(numLat1) > 90 ||
    Math.abs(numLat2) > 90 ||
    Math.abs(numLon1) > 180 ||
    Math.abs(numLon2) > 180
  ) {
    return null;
  }

  const R = 6371; // Earth's mean radius in km
  const dLat = ((numLat2 - numLat1) * Math.PI) / 180;
  const dLon = ((numLon2 - numLon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((numLat1 * Math.PI) / 180) *
      Math.cos((numLat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

// Benchmark daily wage rates in INR for major Indian agricultural operations
const REGIONAL_WAGE_BENCHMARKS = {
  wheat: { harvesting: 650, sowing: 550, tilling: 600, default: 600 },
  paddy: { transplanting: 650, harvesting: 680, weeding: 520, default: 600 },
  rice: { transplanting: 650, harvesting: 680, weeding: 520, default: 600 },
  cotton: { picking: 620, spraying: 580, harvesting: 620, default: 580 },
  sugarcane: { cutting: 700, loading: 750, harvesting: 700, default: 650 },
  vegetables: { picking: 550, packaging: 520, weeding: 500, default: 520 },
  mustard: { harvesting: 600, sowing: 530, default: 550 },
  default: { harvesting: 600, sowing: 550, default: 550 }
};

function normalizeCropName(crop = '') {
  const normalized = crop.toLowerCase().trim();
  if (normalized.includes('paddy') || normalized.includes('rice')) return 'paddy';
  return normalized;
}

// Get wage parity analysis for a job listing
exports.getWageParityAnalysis = (crop = '', workType = '', wageAmount = 0, wageType = 'daily') => {
  const normalizedCrop = normalizeCropName(crop);
  const normalizedWork = (workType || '').toLowerCase().trim();
  const cropTable = REGIONAL_WAGE_BENCHMARKS[normalizedCrop] || REGIONAL_WAGE_BENCHMARKS.default;
  const benchmark = cropTable[normalizedWork] || cropTable.default || 550;

  const numericWage = parseFloat(wageAmount) || 0;
  if (wageType !== 'daily' || numericWage <= 0) {
    return { benchmark, diff: 0, status: 'Standard', badgeText: 'Market Rate' };
  }

  const diff = Math.round(numericWage - benchmark);
  if (diff >= 50) {
    return { benchmark, diff, status: 'Competitive', badgeText: `High Wage (+₹${diff}/day)` };
  } else if (diff >= 0) {
    return { benchmark, diff, status: 'Fair', badgeText: 'Fair Market Wage' };
  } else {
    return { benchmark, diff, status: 'BelowAverage', badgeText: `Below Average (₹${Math.abs(diff)} less)` };
  }
};

// Multi-parameter AI Match Scoring Engine
exports.calculateJobMatchScore = (job, workerProfile = {}, workerCoords = null) => {
  let score = 55; // Base baseline score
  const breakdown = [];

  const workerSkills = (workerProfile.skills || 'General Agriculture').toLowerCase();
  const jobCrop = (job.crop || '').toLowerCase();
  const cropAliases = jobCrop.includes('paddy') || jobCrop.includes('rice') ? ['paddy', 'rice'] : [jobCrop];
  const jobWorkType = (job.workType || '').toLowerCase();

  // 1. Crop Skill Affinity (+18 pts)
  if (jobCrop && cropAliases.some((cropAlias) => workerSkills.includes(cropAlias))) {
    score += 18;
    breakdown.push({ factor: 'Crop Experience', points: 18, desc: `Experience with ${job.crop}` });
  } else if (workerSkills.includes('general') || workerSkills.includes('agriculture') || workerSkills.includes('farming')) {
    score += 8;
    breakdown.push({ factor: 'General Skills', points: 8, desc: 'Agricultural experience aligns' });
  }

  // 2. Work Task Affinity (+14 pts)
  if (jobWorkType && workerSkills.includes(jobWorkType)) {
    score += 14;
    breakdown.push({ factor: 'Task Expertise', points: 14, desc: `Expert in ${job.workType}` });
  }

  // 3. Geolocation & Proximity (+18 pts)
  let distanceKm = null;
  if (
    workerCoords &&
    Number.isFinite(Number(workerCoords.lat)) &&
    Number.isFinite(Number(workerCoords.lng)) &&
    job.latitude != null &&
    job.longitude != null
  ) {
    distanceKm = exports.calculateHaversineDistance(
      workerCoords.lat,
      workerCoords.lng,
      job.latitude,
      job.longitude
    );
  } else if (job.distanceKm != null || job.distance != null) {
    distanceKm = parseFloat(job.distanceKm ?? job.distance);
  }

  if (distanceKm !== null && !isNaN(distanceKm)) {
    if (distanceKm <= 5) {
      score += 18;
      breakdown.push({ factor: 'Proximity', points: 18, desc: `Within 5 km (${distanceKm} km away)` });
    } else if (distanceKm <= 15) {
      score += 12;
      breakdown.push({ factor: 'Proximity', points: 12, desc: `Nearby commute (${distanceKm} km away)` });
    } else if (distanceKm <= 35) {
      score += 6;
      breakdown.push({ factor: 'Proximity', points: 6, desc: `Moderate commute (${distanceKm} km)` });
    }
  } else {
    // If worker location matches job district/state string
    const workerLoc = (workerProfile.location || '').toLowerCase();
    const jobLoc = (job.location || '').toLowerCase();
    if (workerLoc && jobLoc && (workerLoc.includes(jobLoc) || jobLoc.includes(workerLoc))) {
      score += 10;
      breakdown.push({ factor: 'Location Match', points: 10, desc: 'Same district / district match' });
    }
  }

  // 4. Wage Parity & Competitiveness (+10 pts)
  const wageParity = exports.getWageParityAnalysis(job.crop, job.workType, job.wageAmount || job.wage, job.wageType);
  if (wageParity.status === 'Competitive') {
    score += 10;
    breakdown.push({ factor: 'Fair Wage', points: 10, desc: `Competitive daily rate (+₹${wageParity.diff})` });
  } else if (wageParity.status === 'Fair') {
    score += 6;
    breakdown.push({ factor: 'Fair Wage', points: 6, desc: 'Matches standard regional benchmark' });
  }

  // 5. Worker Availability / Experience Bonus (+5 pts)
  const exp = (workerProfile.experience || '').toLowerCase();
  if (exp.includes('3+') || exp.includes('5') || exp.includes('4') || exp.includes('senior')) {
    score += 5;
    breakdown.push({ factor: 'Experience Bonus', points: 5, desc: 'Experienced agricultural hand' });
  }

  // Normalize final match score between 60 and 99
  const matchScore = Math.max(60, Math.min(score, 99));

  let reasoning = `Good match for ${job.crop || 'crop'} operations.`;
  if (matchScore >= 90) {
    reasoning = `Top Match! Strong ${job.crop || 'crop'} affinity, competitive wage, and convenient location.`;
  } else if (matchScore >= 80) {
    reasoning = `Great fit: Your skills match the required ${job.workType || 'agricultural'} task.`;
  } else if (matchScore >= 70) {
    reasoning = `Recommended based on your agricultural experience and local availability.`;
  }

  return {
    matchScore,
    matchPercentage: `${matchScore}%`,
    reasoning,
    distanceKm,
    wageParity,
    breakdown
  };
};

// Generate ranked AI recommendations for a worker
exports.getAIRecommendationsForWorker = async (workerProfile = {}, availableJobs = [], workerCoords = null) => {
  return availableJobs
    .map((job) => {
      const matchResult = exports.calculateJobMatchScore(job, workerProfile, workerCoords);
      return {
        ...job,
        aiMatchScore: matchResult.matchScore,
        aiMatchPercentage: matchResult.matchPercentage,
        aiReasoning: matchResult.reasoning,
        aiBreakdown: matchResult.breakdown,
        distanceKm: matchResult.distanceKm,
        wageParity: matchResult.wageParity
      };
    })
    .sort((a, b) => b.aiMatchScore - a.aiMatchScore);
};

// Smart Wage Benchmark & Recommendation Calculator
exports.getWagePrediction = async ({ crop = 'Wheat', workType = 'Harvesting', location = '', durationUnit = 'days' }) => {
  const normCrop = normalizeCropName(crop);
  const normWork = (workType || '').toLowerCase().trim();
  const cropTable = REGIONAL_WAGE_BENCHMARKS[normCrop] || REGIONAL_WAGE_BENCHMARKS.default;
  const benchmark = cropTable[normWork] || cropTable.default || 600;

  const minWage = benchmark - 50;
  const maxWage = benchmark + 120;
  const recommendedWage = benchmark + 30;

  let advice = `Use ₹${recommendedWage}/day as a seasonal planning estimate for ${crop} ${workType}; confirm current rates with workers in your area.`;
  let laborIntensity = 'High';

  if (normWork.includes('harvest') || normWork.includes('cut') || normWork.includes('till')) {
    laborIntensity = 'Heavy Physical';
    advice = `Harvest work is physically demanding. This estimate is slightly above the reference benchmark; confirm local rates and worker requirements before posting.`;
  } else if (normWork.includes('weed') || normWork.includes('spray') || normWork.includes('pack')) {
    laborIntensity = 'Moderate';
    advice = `The reference range is ₹${benchmark}–₹${recommendedWage}/day. Confirm current rates with workers in your area before posting.`;
  }

  return {
    crop,
    workType,
    location: location || 'Regional Hub',
    recommendedWage,
    minWage,
    maxWage,
    benchmarkWage: benchmark,
    wageType: 'daily',
    laborIntensity,
    marketDemand: 'Seasonal estimate',
    advice,
    currency: 'INR'
  };
};

// Calendar-based estimates are illustrative; they are not live market measurements.
exports.getDemandForecast = async (region = 'India') => {
  const month = new Date().getMonth();
  const season = month <= 1
    ? 'Rabi growing season'
    : month <= 3
      ? 'Rabi harvest'
      : month === 4
        ? 'Summer / lean season'
        : month <= 6
          ? 'Kharif sowing'
          : month <= 8
            ? 'Kharif growing season'
            : month <= 10
              ? 'Kharif harvest and Rabi sowing'
              : 'Rabi sowing';
  const cropCalendars = [
    {
      crop: 'Wheat',
      demand: [50, 70, 95, 90, 45, 30, 25, 25, 30, 45, 55, 55],
      peakWindow: 'March - April',
      typicalWage: '₹650 - ₹750/day',
      topDistricts: ['Anand (Gujarat)', 'Belagavi (Karnataka)', 'Karnal (Haryana)', 'Ludhiana (Punjab)']
    },
    {
      crop: 'Cotton',
      demand: [30, 25, 20, 20, 25, 35, 45, 60, 75, 90, 95, 75],
      peakWindow: 'October - February',
      typicalWage: '₹600 - ₹700/day',
      topDistricts: ['Raichur (Karnataka)', 'Rajkot (Gujarat)', 'Nagpur (Maharashtra)']
    },
    {
      crop: 'Paddy / Rice',
      demand: [25, 25, 25, 30, 45, 85, 90, 75, 55, 60, 85, 90],
      peakWindow: 'June - July and November - December',
      typicalWage: '₹650 - ₹720/day',
      topDistricts: ['Mandya (Karnataka)', 'Krishna (Andhra Pradesh)', 'Thanjavur (Tamil Nadu)']
    },
    {
      crop: 'Sugarcane',
      demand: [60, 65, 55, 45, 35, 30, 30, 30, 45, 70, 90, 85],
      peakWindow: 'November - April',
      typicalWage: '₹700 - ₹800/day',
      topDistricts: ['Kolhapur (Maharashtra)', 'Belagavi (Karnataka)', 'Muzaffarnagar (Uttar Pradesh)']
    }
  ];
  const peakDemandCrops = cropCalendars
    .map((cropData) => {
      const demandIndex = cropData.demand[month];
      const nextMonthIndex = cropData.demand[(month + 1) % 12];
      return {
        crop: cropData.crop,
        demandIndex,
        trend: nextMonthIndex > demandIndex + 5 ? 'Rising' : nextMonthIndex < demandIndex - 5 ? 'Falling' : 'Steady',
        peakWindow: cropData.peakWindow,
        typicalWage: cropData.typicalWage,
        topDistricts: cropData.topDistricts
      };
    })
    .sort((a, b) => b.demandIndex - a.demandIndex);
  const laborDemandIndex = Math.round(
    peakDemandCrops.reduce((total, cropData) => total + cropData.demandIndex, 0) / peakDemandCrops.length
  );

  return {
    region,
    currentSeason: season,
    currentMonth: new Date().toLocaleString('en-US', { month: 'long' }),
    peakDemandCrops,
    workerAvailabilityScore: 100 - laborDemandIndex,
    laborDemandIndex,
    forecastNotes: 'Seasonal calendar estimates for major Indian crops, not live job-market data and not localized by region. Check local listings for current wages and openings.',
    source: 'Seasonal crop-calendar estimate',
    generatedAt: new Date().toISOString()
  };
};

// Multilingual NLP Voice Intent Parser & Voice Response Generator (Phase 7)
exports.processVoiceInput = async (transcript = '', language = 'en-US') => {
  const text = (transcript || '').toLowerCase().trim();
  const lang = (language || 'en-US').toLowerCase();

  // Intent 1: Search Harvest / Crop Jobs
  if (
    text.includes('harvest') ||
    text.includes('wheat') ||
    text.includes('paddy') ||
    text.includes('cotton') ||
    text.includes('कटाई') ||
    text.includes('गेहूं') ||
    text.includes('धान') ||
    text.includes('कपास') ||
    text.includes('ಕೊಯ್ಲು') ||
    text.includes('ಗೋಧಿ') ||
    text.includes('ಭತ್ತ') ||
    text.includes('ಹತ್ತಿ') ||
    text.includes('લણણી') ||
    text.includes('ઘઉં') ||
    text.includes('કપાસ') ||
    text.includes('કાપણી') ||
    text.includes('कापणी') ||
    text.includes('गहू') ||
    text.includes('அறுவடை') ||
    text.includes('కోత')
  ) {
    let cropName = 'Wheat';
    if (text.includes('cotton') || text.includes('कपास') || text.includes('ಹತ್ತಿ') || text.includes('કપાસ') || text.includes('કાપસ')) {
      cropName = 'Cotton';
    } else if (text.includes('paddy') || text.includes('rice') || text.includes('धान') || text.includes('ಭತ್ತ') || text.includes('ચોખા')) {
      cropName = 'Paddy / Rice';
    }

    const responses = {
      'kn-in': `ಖಂಡಿತ, ನಿಮ್ಮ ಬಳಿಯಿರುವ ${cropName} ಕೃಷಿ ಕೆಲಸಗಳನ್ನು ತೋರಿಸುತ್ತಿದ್ದೇನೆ.`,
      'hi-in': `ज़रूर, आपके नज़दीಕ ${cropName} की कटाई और कृषि कार्य खोजे जा रहे हैं।`,
      'gu-in': `ચોક્કસ, તમારી નજીકના ${cropName} ખેતીના કામ બતાવી રહ્યા છીએ.`,
      'mr-in': `होय, आपल्या जवळची ${cropName} शेती कामे शोधत आहोत.`,
      'ta-in': `நிச்சயமாக, உங்கள் அருகிலுள்ள ${cropName} விவசாய வேலைகள் காட்டப்படுகின்றன.`,
      'te-in': `ఖచ్చితంగా, మీ సమీపంలో ఉన్న ${cropName} వ్యవసాయ పనులను చూపిస్తున్నాము.`,
      'en-us': `Showing nearby ${cropName} agricultural jobs that match your preferences.`
    };

    return {
      intent: 'SEARCH_JOBS',
      crop: cropName,
      suggestedFilters: { crop: cropName },
      targetUrl: `/jobs?crop=${encodeURIComponent(cropName)}`,
      action: 'NAVIGATE',
      spokenResponse: responses[lang] || responses['en-us'],
      displayText: responses[lang] || responses['en-us']
    };
  }

  // Intent 2: Post a Farm Job (Farmer)
  if (
    text.includes('post') ||
    text.includes('create job') ||
    text.includes('need worker') ||
    text.includes('hire') ||
    text.includes('मजदूर चाहिए') ||
    text.includes('काम पोस्ट') ||
    text.includes('ಕಾರ್ಮಿಕರು ಬೇಕು') ||
    text.includes('ಕೆಲಸ ಹಾಕಿ') ||
    text.includes('કામ આપો') ||
    text.includes('मजूर हवे') ||
    text.includes('ஆட்கள் வேண்டும்') ||
    text.includes('కూలీలు కావాలి')
  ) {
    const responses = {
      'kn-in': 'ರೈತರಿಗಾಗಿ ಹೊಸ ಕೃಷಿ ಕೆಲಸ ಪೋಸ್ಟ್ ಮಾಡುವ ಪುಟವನ್ನು ತೆರೆಯಲಾಗುತ್ತಿದೆ.',
      'hi-in': 'किसानों के लिए नया कार्य पोस्ट करने का फॉर्म खोला जा रहा है।',
      'gu-in': 'ખેડૂતો માટે નવું કામ પોસ્ટ કરવાનું ફોર્મ ખોલી રહ્યા છીએ.',
      'mr-in': 'शेतकऱ्यांसाठी नवीन शेतकाम पोस्ट करण्याचे फॉर्म उघडत आहोत.',
      'ta-in': 'விவசாயிகளுக்கான புதிய வேலை இடுகையிடும் படிவம் திறக்கப்படுகிறது.',
      'te-in': 'రైతుల కోసం కొత్త వ్యవసాయ పనిని పోస్ట్ చేసే ఫారమ్‌ను తెరుస్తున్నాము.',
      'en-us': 'Opening the farmer job creation portal for you.'
    };

    return {
      intent: 'POST_JOB',
      targetUrl: '/farmer/jobs/new',
      action: 'NAVIGATE',
      spokenResponse: responses[lang] || responses['en-us'],
      displayText: responses[lang] || responses['en-us']
    };
  }

  // Intent 3: View My Applications (Worker)
  if (
    text.includes('application') ||
    text.includes('my status') ||
    text.includes('मेरा आवेदन') ||
    text.includes('ಸ್ಟೇಟಸ್') ||
    text.includes('ನನ್ನ ಅರ್ಜಿ') ||
    text.includes('મારી અરજી') ||
    text.includes('माझे अर्ज') ||
    text.includes('என் விண்ணப்பம்') ||
    text.includes('నా దరఖాస్తు')
  ) {
    const responses = {
      'kn-in': 'ನಿಮ್ಮ ಎಲ್ಲಾ ಕೃಷಿ ಕೆಲಸದ ಅರ್ಜಿಗಳು ಮತ್ತು ಪ್ರಸ್ತುತ ಸ್ಥಿತಿಯನ್ನು ತೆರೆಯಲಾಗುತ್ತಿದೆ.',
      'hi-in': 'आपके सभी आवेदनों की स्थिति खोली जा रही है।',
      'gu-in': 'તમારી બધી અરજીઓની સ્થિતિ દર્શાવી રહ્યા છીએ.',
      'mr-in': 'आपल्या सर्व अर्जांची स्थिती उघडत आहोत.',
      'ta-in': 'உங்கள் அனைத்து விண்ணப்பங்களின் நிலையை திறக்கிறோம்.',
      'te-in': 'మీ అన్ని దరఖాస్తుల స్థితిని తెరుస్తున్నాము.',
      'en-us': 'Navigating to your worker applications dashboard.'
    };

    return {
      intent: 'VIEW_APPLICATIONS',
      targetUrl: '/worker/applications',
      action: 'NAVIGATE',
      spokenResponse: responses[lang] || responses['en-us'],
      displayText: responses[lang] || responses['en-us']
    };
  }

  // Intent 4: Find Jobs Near Me / Geolocation
  if (
    text.includes('near') ||
    text.includes('nearby') ||
    text.includes('location') ||
    text.includes('हस्तिर') ||
    text.includes('ಹತ್ತಿರ') ||
    text.includes('नज़दीक') ||
    text.includes('પાસે') ||
    text.includes('जवळ') ||
    text.includes('அருகில்') ||
    text.includes('దగ్గర')
  ) {
    const responses = {
      'kn-in': 'ಜಿಪಿಎಸ್ ಮೂಲಕ ನಿಮ್ಮ ಹತ್ತಿರದ ಎಲ್ಲಾ ಕೃಷಿ ಕೆಲಸಗಳನ್ನು ಹುಡುಕಲಾಗುತ್ತಿದೆ.',
      'hi-in': 'जीपीएस के माध्यम से आपके नज़दीकी सभी कृषि कार्य खोजे जा रहे हैं।',
      'gu-in': 'જીપીએસ દ્વારા તમારી નજીકના બધા ખેતીના કામ શોધી રહ્યા છીએ.',
      'mr-in': 'जीपीएस द्वारे आपल्या जवळची सर्व शेतकामे शोधत आहोत.',
      'ta-in': 'ஜிபிஎஸ் மூலம் உங்கள் அருகிலுள்ள அனைத்து விவசாய வேலைகளும் கண்டறியப்படுகின்றன.',
      'te-in': 'జిపిఎస్ ద్వారా మీ సమీపంలోని అన్ని వ్యవసాయ పనులను శోధిస్తున్నాము.',
      'en-us': 'Searching nearby farm jobs within your GPS radius.'
    };

    return {
      intent: 'NEARBY_JOBS',
      targetUrl: '/jobs?nearMe=true&radius=15',
      action: 'NAVIGATE',
      spokenResponse: responses[lang] || responses['en-us'],
      displayText: responses[lang] || responses['en-us']
    };
  }

  // Default General Assistant Query
  const defaultResponses = {
    'kn-in': `ನಮಸ್ಕಾರ! ನಿಮ್ಮ ಧ್ವನಿ ಪ್ರಶ್ನೆ: "${transcript}". ಕೃಷಿ ಕೆಲಸಗಳು, ಕೂಲಿ ಮಾಹಿತಿ ಮತ್ತು ರೈತರ ಸಂಪರ್ಕಕ್ಕೆ ನಾನು ಸಿದ್ಧನಿದ್ದೇನೆ.`,
    'hi-in': `नमस्ते! आपका प्रश्न: "${transcript}". मैं कृषि कार्य खोजने, उचित मजदूरी और किसानों से जुड़ने में आपकी सहायता कर सकता हूँ।`,
    'gu-in': `નમસ્તે! તમારો પ્રશ્ન: "${transcript}". નજીકના ખેત કામ અને મજૂરી દર શોધવામાં હું તમારી મદદ કરી શકું છું.`,
    'mr-in': `नमस्कार! आपला प्रश्न: "${transcript}". शेती कामे आणि योग्य मजुरी दर शोधण्यात मी आपली मदत करू शकतो.`,
    'ta-in': `வணக்கம்! உங்கள் கேள்வி: "${transcript}". விவசாய வேலைகள் மற்றும் தினசரி கூலி விவரங்களை அறிய நான் உதவ முடியும்.`,
    'te-in': `నమస్కారం! మీ ప్రశ్న: "${transcript}". వ్యవసాయ పనులు మరియు రోజువారీ కూలి వివరాలను తెలుసుకోవడానికి నేను సిద్ధంగా ఉన్నాను.`,
    'en-us': `Hello! I heard: "${transcript}". I can help you discover high-matching farm jobs, calculate fair wages, or connect with local farmers.`
  };

  return {
    intent: 'GENERAL_ASSISTANCE',
    spokenResponse: defaultResponses[lang] || defaultResponses['en-us'],
    displayText: defaultResponses[lang] || defaultResponses['en-us'],
    suggestions: [
      'Show nearby Wheat harvesting jobs',
      'Post a farm job for 5 workers',
      'Check fair daily wage in Karnataka',
      'View my applications status'
    ]
  };
};
