const aiService = require('../services/aiService');

// @desc    Get AI Job Recommendations for worker
// @route   POST /api/ai/recommendations
// @access  Public / Private
exports.getRecommendations = async (req, res) => {
  try {
    const { workerProfile, jobs } = req.body;
    const recommendations = await aiService.getAIRecommendationsForWorker(
      workerProfile || { skills: 'Harvesting', location: 'Gujarat' },
      jobs || []
    );
    res.json({ success: true, count: recommendations.length, data: recommendations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Process Voice / Language input
// @route   POST /api/ai/voice-assistant
// @access  Public / Private
exports.processVoice = async (req, res) => {
  try {
    const { transcript, language } = req.body;
    const result = await aiService.processVoiceInput(transcript || '', language || 'hi-IN');
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
