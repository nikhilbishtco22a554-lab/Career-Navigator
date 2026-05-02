const express = require('express');
const { generateRoadmap, gradeAnswer, getMyRoadmap } = require('../controllers/roadmapController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/generate', authMiddleware, generateRoadmap);
router.post('/grade-answer', authMiddleware, gradeAnswer);
router.get('/my', authMiddleware, getMyRoadmap);

module.exports = router;
