const axios = require('axios');
const SavedJob = require('../models/SavedJob');

const getSalaryLabel = (job) => {
  if (job.salary_min && job.salary_max) {
    return `${job.salary_min} - ${job.salary_max}`;
  }
  if (job.salary_min) {
    return `${job.salary_min}`;
  }
  if (job.salary_max) {
    return `${job.salary_max}`;
  }
  return job.salary || null;
};

exports.searchJobs = async (req, res) => {
  try {
    const role = String(req.query.role || '').trim();
    const location = String(req.query.location || 'india').trim();
    const results = Number(req.query.results || 10);

    if (!role) {
      return res.status(400).json({ error: true, message: 'Role query parameter is required.' });
    }

    const response = await axios.get('https://api.adzuna.com/v1/api/jobs/in/search/1', {
      params: {
        app_id: process.env.ADZUNA_APP_ID,
        app_key: process.env.ADZUNA_API_KEY,
        what: role,
        where: location,
        results_per_page: results,
      },
    });

    const jobs = (response.data.results || []).map((job) => ({
      title: job.title || null,
      company: job.company?.display_name || null,
      location: job.location?.display_name || null,
      salary: getSalaryLabel(job),
      redirectUrl: job.redirect_url || job.redirectUrl || null,
    }));

    return res.json({ jobs });
  } catch (error) {
    return res.status(503).json({ error: true, message: 'Job search unavailable' });
  }
};

exports.saveJob = async (req, res) => {
  try {
    const { jobTitle, company, location, redirectUrl } = req.body;

    if (!jobTitle) {
      return res.status(400).json({ error: true, message: 'Job title is required to save a job.' });
    }

    const savedJob = await SavedJob.create({
      userId: req.userId,
      jobTitle,
      company,
      location,
      redirectUrl,
    });

    return res.status(201).json({ savedJob });
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message || 'Unable to save job.' });
  }
};

exports.getSavedJobs = async (req, res) => {
  try {
    const jobs = await SavedJob.find({ userId: req.userId }).sort({ savedAt: -1 });
    return res.json({ jobs });
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message || 'Unable to fetch saved jobs.' });
  }
};
