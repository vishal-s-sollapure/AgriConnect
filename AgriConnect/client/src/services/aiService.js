import apiRequest from './api';

export const aiService = {
  // Get AI recommendations with compatibility & geolocation scoring
  getRecommendations: (workerProfile, jobs, workerCoords) =>
    apiRequest('/ai/recommendations', {
      method: 'POST',
      body: JSON.stringify({ workerProfile, jobs, workerCoords })
    }),

  // Process voice/NLP transcript with intent detection
  processVoice: (transcript, language) =>
    apiRequest('/ai/voice-assistant', {
      method: 'POST',
      body: JSON.stringify({ transcript, language })
    }),

  // Get AI wage prediction & benchmark for job creation
  getWagePrediction: (params) =>
    apiRequest('/ai/wage-prediction', {
      method: 'POST',
      body: JSON.stringify(params)
    }),

  // Get seasonal labor demand forecast
  getDemandForecast: (region = 'India') =>
    apiRequest(`/ai/demand-forecast?region=${encodeURIComponent(region)}`, {
      method: 'GET'
    })
};

export default aiService;
