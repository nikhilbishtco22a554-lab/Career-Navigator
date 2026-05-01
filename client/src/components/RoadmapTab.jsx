import { useState } from 'react';
import api from '../utils/api';

const RoadmapTab = () => {
  const [targetRole, setTargetRole] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (!skills.includes(trimmed)) {
      setSkills((current) => [...current, trimmed]);
    }
    setSkillInput('');
  };

  const removeSkill = (index) => {
    setSkills((current) => current.filter((_, idx) => idx !== index));
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addSkill();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setResult(null);

    if (!targetRole.trim() || skills.length === 0) {
      setError('Please enter a target role and at least one skill.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/api/roadmap/generate', {
        currentSkills: skills,
        targetRole: targetRole.trim(),
      });

      setResult(response.data.roadmap);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to generate roadmap.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-300/20">
        <h2 className="text-xl font-semibold text-slate-900">Generate your roadmap</h2>
        <p className="mt-2 text-sm text-slate-500">Use your current skills and target role to create a personalized learning plan.</p>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700">Target role</label>
            <input
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Frontend Engineer"
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Current skills</label>
            <div className="mt-2 flex gap-2">
              <input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a skill and press Enter"
                className="flex-1 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
              <button
                type="button"
                onClick={addSkill}
                className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Add
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <button
                  key={`${skill}-${index}`}
                  type="button"
                  onClick={() => removeSkill(index)}
                  className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700 transition hover:bg-slate-200"
                >
                  {skill} ×
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Generating...
              </span>
            ) : (
              'Generate roadmap'
            )}
          </button>
        </form>
      </div>

      {result && (
        <div className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-300/20">
          <h3 className="text-lg font-semibold text-slate-900">Roadmap results</h3>

          <div className="mt-5 grid gap-5">
            <div>
              <p className="text-sm font-medium text-slate-700">Skill gaps</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {result.skillGaps?.map((gap, index) => (
                  <span key={`${gap}-${index}`} className="rounded-full bg-red-100 px-3 py-1 text-sm text-red-700">
                    {gap}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-700">Roadmap</p>
              <ol className="mt-3 space-y-3 list-decimal list-inside text-slate-700">
                {result.roadmap?.map((item) => (
                  <li key={item.week} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900">Week {item.week}: {item.topic}</p>
                    <p className="mt-2 text-sm text-slate-700">Resource: {item.resource}</p>
                    <p className="text-sm text-slate-500">Provider: {item.provider}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-700">Interview questions</p>
              <ol className="mt-3 space-y-3 list-decimal list-inside text-slate-700">
                {result.interviewQuestions?.map((question, index) => (
                  <li key={`${question}-${index}`} className="rounded-2xl bg-slate-50 p-4">
                    {question}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoadmapTab;
