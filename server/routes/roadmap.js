const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { generateRoadmap, getMyRoadmap, gradeAnswer } = require('../controllers/roadmapController');

router.post('/generate', auth, generateRoadmap);
router.get('/my', auth, getMyRoadmap);
router.post('/grade-answer', auth, gradeAnswer);

module.exports = router;
