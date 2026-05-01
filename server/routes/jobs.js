const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { searchJobs, saveJob, getSavedJobs } = require('../controllers/jobController');

router.get('/search', searchJobs);
router.post('/save', auth, saveJob);
router.get('/saved', auth, getSavedJobs);

module.exports = router;
