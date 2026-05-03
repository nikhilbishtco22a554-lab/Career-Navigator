const express = require('express');
const router = express.Router();
const roadmapController = require('../controllers/roadmapController');
const auth = require('../middleware/auth');

router.post('/generate', auth, roadmapController.generateRoadmap);
router.post('/grade-answer', auth, roadmapController.gradeAnswer);
router.get('/my', auth, roadmapController.getMyRoadmap);

module.exports = router;
