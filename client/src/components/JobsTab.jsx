import { useEffect, useState } from 'react';
import api from '../utils/api';

const JobsTab = () => {
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('india');
  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      const response = await api.get('/api/jobs/saved');
      setSavedJobs(response.data.jobs || []);
    } catch (err) {
      setError('Unable to load saved jobs.');
    }
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    setError('');
    setJobs([]);
    setLoading(true);

    try {
      const response = await api.get('/api/jobs/search', {
        params: { role, location },
      });
      setJobs(response.data.jobs || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Job search failed.');
    } finally {
      setLoading(false);
    }
  };

  const saveJob = async (job) => {
    setError('');
    setSavingId(job.redirectUrl || job.title);

    try {
      await api.post('/api/jobs/save', {
        jobTitle: job.title,
        company: job.company,
        location: job.location,
        redirectUrl: job.redirectUrl,
      });
      fetchSavedJobs();
    } catch (err) {
      setError('Unable to save job.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-300/20">
        <h2 className="text-xl font-semibold text-slate-900">Job search</h2>
        <p className="mt-2 text-sm text-slate-500">Find roles and save listings to your profile.</p>

        <form className="mt-6 grid gap-4 md:grid-cols-[1fr_auto]" onSubmit={handleSearch}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Role</label>
              <input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="Frontend developer"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Location</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="india"
              />
            </div>
          </div>

          <button
            type="submit"
            className="h-fit rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Searching...
              </span>
            ) : (
              'Search jobs'
            )}
          </button>
        </form>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </div>

      <div className="grid gap-4">
        {jobs.length > 0 && (
          <div className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-300/20">
            <h3 className="text-lg font-semibold text-slate-900">Open roles</h3>
            <div className="mt-5 space-y-4">
              {jobs.map((job, index) => (
                <div key={`${job.title}-${index}`} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-base font-semibold text-slate-900">{job.title}</p>
                      <p className="text-sm text-slate-600">{job.company || 'Unknown company'}</p>
                      <p className="text-sm text-slate-500">{job.location || 'Location unavailable'}</p>
                    </div>
                    <div className="mt-4 flex items-center gap-3 sm:mt-0">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">{job.salary || 'Salary not listed'}</span>
                      <button
                        type="button"
                        onClick={() => saveJob(job)}
                        disabled={savingId === (job.redirectUrl || job.title)}
                        className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                      >
                        {savingId === (job.redirectUrl || job.title) ? 'Saving...' : 'Save Job'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-300/20">
          <h3 className="text-lg font-semibold text-slate-900">Saved jobs</h3>
          {savedJobs.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No saved jobs yet.</p>
          ) : (
            <div className="mt-5 space-y-4">
              {savedJobs.map((job) => (
                <div key={job._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-base font-semibold text-slate-900">{job.jobTitle}</p>
                  <p className="text-sm text-slate-600">{job.company || 'Unknown company'}</p>
                  <p className="text-sm text-slate-500">{job.location || 'Location unavailable'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobsTab;
