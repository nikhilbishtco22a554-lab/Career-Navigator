const axios = require('axios');
const SavedJob = require('../models/SavedJob');

const ADZUNA_API_URL = 'https://api.adzuna.com/v1/api/jobs/in/search/1';

exports.searchJobs = async (req, res) => {
  try {
    const { role, location = 'india', results = 10 } = req.query;

    const response = await axios.get(ADZUNA_API_URL, {
      params: {
        app_id: process.env.ADZUNA_APP_ID,
        app_key: process.env.ADZUNA_API_KEY,
        what: role,
        where: location,
        results_per_page: results,
      },
    });

    const jobs = response.data.results.map((job) => ({
      title: job.title,
      company: job.company.display_name,
      location: job.location.display_name,
      salary: job.salary_min ? `${job.salary_min} - ${job.salary_max}` : 'Not specified',
      redirectUrl: job.redirect_url,
    }));

    res.status(200).json(jobs);
  } catch (err) {
    res.status(503).json({ error: true, message: 'Failed to fetch jobs from Adzuna' });
  }
};

exports.saveJob = async (req, res) => {
  try {
    const { jobTitle, company, location, salary, redirectUrl } = req.body;

    const savedJob = await SavedJob.create({
      userId: req.userId,
      jobTitle,
      company,
      location,
      salary,
      redirectUrl,
    });

    res.status(201).json(savedJob);
  } catch (err) {
    res.status(500).json({ error: true, message: 'Failed to save job' });
  }
};

exports.getSavedJobs = async (req, res) => {
  try {
    const savedJobs = await SavedJob.find({ userId: req.userId });
    res.status(200).json(savedJobs);
  } catch (err) {
    res.status(500).json({ error: true, message: 'Failed to fetch saved jobs' });
  }
};
