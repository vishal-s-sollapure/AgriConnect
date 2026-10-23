const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// Phase 6 & Phase 7 AI Routes
router.post('/recommendations', aiController.getRecommendations);
router.post('/voice-assistant', aiController.processVoice);
router.post('/wage-prediction', aiController.getWagePrediction);
router.get('/demand-forecast', aiController.getDemandForecast);

module.exports = router;
