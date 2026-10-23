/**
 * Client-Side Agricultural AI Matching & Wage Parity Helpers (Phase 6)
 */

export const REGIONAL_WAGE_BENCHMARKS = {
  wheat: { harvesting: 650, sowing: 550, tilling: 600, default: 600 },
  paddy: { transplanting: 650, harvesting: 680, weeding: 520, default: 600 },
  rice: { transplanting: 650, harvesting: 680, weeding: 520, default: 600 },
  cotton: { picking: 620, spraying: 580, harvesting: 620, default: 580 },
  sugarcane: { cutting: 700, loading: 750, harvesting: 700, default: 650 },
  vegetables: { picking: 550, packaging: 520, weeding: 500, default: 520 },
  mustard: { harvesting: 600, sowing: 530, default: 550 },
  default: { harvesting: 600, sowing: 550, default: 550 }
};

export function getWageParityAnalysis(crop = '', workType = '', wageAmount = 0, wageType = 'daily') {
  const cropName = (crop || '').toLowerCase().trim();
  const normCrop = cropName.includes('paddy') || cropName.includes('rice') ? 'paddy' : cropName;
  const normWork = (workType || '').toLowerCase().trim();
  const cropTable = REGIONAL_WAGE_BENCHMARKS[normCrop] || REGIONAL_WAGE_BENCHMARKS.default;
  const benchmark = cropTable[normWork] || cropTable.default || 550;

  const numericWage = parseFloat(wageAmount) || 0;
  if (wageType !== 'daily' || numericWage <= 0) {
    return { benchmark, diff: 0, status: 'Standard', badgeText: 'Market Rate' };
  }

  const diff = Math.round(numericWage - benchmark);
  if (diff >= 50) {
    return { benchmark, diff, status: 'Competitive', badgeText: `High Wage (+₹${diff}/day)` };
  } else if (diff >= 0) {
    return { benchmark, diff, status: 'Fair', badgeText: 'Fair Market Rate' };
  } else {
    return { benchmark, diff, status: 'BelowAverage', badgeText: `Below Market (₹${Math.abs(diff)} less)` };
  }
}

export function calculateClientJobMatchScore(job, workerProfile = {}, distanceKm = null) {
  let score = 58;

  const workerSkills = (workerProfile?.skills || 'General Agriculture').toLowerCase();
  const jobCrop = (job?.crop || '').toLowerCase();
  const jobWorkType = (job?.workType || '').toLowerCase();

  // Crop Affinity (+18 pts)
  const cropAliases = jobCrop.includes('paddy') || jobCrop.includes('rice') ? ['paddy', 'rice'] : [jobCrop];
  if (jobCrop && cropAliases.some((cropAlias) => workerSkills.includes(cropAlias))) {
    score += 18;
  } else if (workerSkills.includes('general') || workerSkills.includes('agriculture') || workerSkills.includes('farming')) {
    score += 8;
  }

  // Work Type Affinity (+14 pts)
  if (jobWorkType && workerSkills.includes(jobWorkType)) {
    score += 14;
  }

  // Proximity (+18 pts)
  if (distanceKm !== null && !isNaN(distanceKm)) {
    if (distanceKm <= 5) {
      score += 18;
    } else if (distanceKm <= 15) {
      score += 12;
    } else if (distanceKm <= 35) {
      score += 6;
    }
  }

  // Wage Parity (+10 pts)
  const wageParity = getWageParityAnalysis(job.crop, job.workType, job.wageAmount || job.wage, job.wageType);
  if (wageParity.status === 'Competitive') {
    score += 10;
  } else if (wageParity.status === 'Fair') {
    score += 6;
  }

  // Experience (+5 pts)
  const exp = (workerProfile?.experience || '').toLowerCase();
  if (exp.includes('3+') || exp.includes('5') || exp.includes('senior')) {
    score += 5;
  }

  const matchScore = Math.max(65, Math.min(score, 99));

  let reasoning = `Good match for ${job.crop || 'crop'} operations.`;
  if (matchScore >= 90) {
    reasoning = `Top Match! Strong ${job.crop || 'crop'} experience + fair daily wage.`;
  } else if (matchScore >= 80) {
    reasoning = `Great fit for your skills in ${job.workType || 'agricultural work'}.`;
  }

  return {
    matchScore,
    matchPercentage: `${matchScore}%`,
    reasoning,
    wageParity
  };
}
