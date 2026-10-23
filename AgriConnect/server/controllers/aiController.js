const aiService = require('../services/aiService');
const Job = require('../models/Job');

// Helper to check if MongoDB is connected and ready
const isDbConnected = () => {
  const mongoose = require('mongoose');
  return mongoose.connection && mongoose.connection.readyState === 1;
};

// @desc    Get AI Job Recommendations for worker with Geolocation & Compatibility Scoring
// @route   POST /api/ai/recommendations
// @access  Public / Private
exports.getRecommendations = async (req, res) => {
  try {
    const { workerProfile, jobs, workerCoords } = req.body;

    let candidateJobs = jobs;
    if (!candidateJobs || !candidateJobs.length) {
      if (isDbConnected()) {
        try {
          candidateJobs = await Job.find({ status: 'open' }).limit(30).lean();
        } catch (dbErr) {
          console.warn('[AI Recommendations] DB query failed, using empty list:', dbErr.message);
          candidateJobs = [];
        }
      } else {
        candidateJobs = [];
      }
    }

    const defaultProfile = {
      skills: 'Harvesting, Sowing, General Agriculture',
      location: 'Karnataka, India',
      experience: '3+ Years'
    };

    const recommendations = await aiService.getAIRecommendationsForWorker(
      workerProfile || defaultProfile,
      candidateJobs || [],
      workerCoords || null
    );

    res.json({
      success: true,
      count: recommendations.length,
      data: recommendations
    });
  } catch (error) {
    console.error('getRecommendations Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Process Voice / Language input with Actionable Intent Recognition
// @route   POST /api/ai/voice-assistant
// @access  Public / Private
exports.processVoice = async (req, res) => {
  try {
    const { transcript, language } = req.body;
    const result = await aiService.processVoiceInput(transcript || '', language || 'en-US');
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('processVoice Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Smart Agricultural Wage Prediction & Market Benchmark
// @route   POST /api/ai/wage-prediction
// @access  Public / Private
exports.getWagePrediction = async (req, res) => {
  try {
    const { crop, workType, location, durationUnit } = req.body;
    const prediction = await aiService.getWagePrediction({
      crop: crop || 'Wheat',
      workType: workType || 'Harvesting',
      location: location || '',
      durationUnit: durationUnit || 'days'
    });
    res.json({ success: true, data: prediction });
  } catch (error) {
    console.error('getWagePrediction Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Seasonal Agricultural Labor Demand Forecasting
// @route   GET /api/ai/demand-forecast
// @access  Public / Private
exports.getDemandForecast = async (req, res) => {
  try {
    const { region } = req.query;
    const forecast = await aiService.getDemandForecast(region || 'India');
    res.json({ success: true, data: forecast });
  } catch (error) {
    console.error('getDemandForecast Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
