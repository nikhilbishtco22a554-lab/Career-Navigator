const express = require('express');
const { searchJobs, saveJob, getSavedJobs } = require('../controllers/jobController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/search', searchJobs);
router.post('/save', authMiddleware, saveJob);
router.get('/saved', authMiddleware, getSavedJobs);

module.exports = router;
