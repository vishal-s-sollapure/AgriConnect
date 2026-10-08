const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/recommendations', aiController.getRecommendations);
router.post('/voice-assistant', aiController.processVoice);

module.exports = router;
