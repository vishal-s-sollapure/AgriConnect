/**
 * AgriConnect AI Service
 * Handles AI-powered job matching recommendations, wage estimation, and voice/multilingual text translation.
 */

// Calculate AI match score between a worker profile and a job listing
exports.calculateJobMatchScore = (job, workerProfile) => {
  let score = 70; // Base score

  // Crop match
  if (workerProfile.skills && workerProfile.skills.toLowerCase().includes(job.crop.toLowerCase())) {
    score += 15;
  }

  // Proximity bonus
  if (job.distance && parseFloat(job.distance) < 5) {
    score += 10;
  }

  // Fair wage bonus
  if (job.wage >= 600) {
    score += 5;
  }

  return Math.min(score, 99);
};

// Generate AI Job Recommendations for a Worker
exports.getAIRecommendationsForWorker = async (workerProfile, availableJobs) => {
  return availableJobs.map(job => {
    const matchScore = exports.calculateJobMatchScore(job, workerProfile);
    let reasoning = `High match based on ${job.crop} experience`;
    
    if (matchScore > 90) {
      reasoning = `Top Match! Located close by (${job.distance}) with competitive daily wage of ₹${job.wage}.`;
    } else if (matchScore > 80) {
      reasoning = `Great fit for your skills in ${job.crop} farming.`;
    }

    return {
      ...job,
      aiMatchScore: matchScore,
      aiReasoning: reasoning
    };
  }).sort((a, b) => b.aiMatchScore - a.aiMatchScore);
};

// Process Voice Query / Language Assistance
exports.processVoiceInput = async (transcript, language = 'hi-IN') => {
  const text = transcript.toLowerCase();
  
  // Intelligent Intent Recognition
  if (text.includes('harvest') || text.includes('कटाई') || text.includes('लणणी') || text.includes('લણણી')) {
    return {
      intent: 'SEARCH_HARVEST_JOBS',
      translatedText: 'Searching for harvesting jobs nearby...',
      suggestedFilters: { crop: 'Wheat' }
    };
  }

  if (text.includes('post') || text.includes('काम देना') || text.includes('મજૂર')) {
    return {
      intent: 'OPEN_POST_JOB_MODAL',
      translatedText: 'Opening job posting form for farmer...',
      action: 'open_post_job'
    };
  }

  return {
    intent: 'GENERAL_QUERY',
    translatedText: `Understanding your query in ${language}: "${transcript}"`,
    suggestions: ['Wheat Harvesting in Anand', 'Cotton Picking ₹600/day']
  };
};
