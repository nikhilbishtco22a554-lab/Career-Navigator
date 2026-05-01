import { useEffect, useState } from 'react';
import api from '../utils/api';

const InterviewTab = () => {
  const [questions, setQuestions] = useState([]);
  const [targetRole, setTargetRole] = useState('');
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState({});
  const [loadingIds, setLoadingIds] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setError('');

      try {
        const roadmapRes = await api.get('/api/roadmap/my');
        setQuestions(roadmapRes.data.roadmap?.interviewQuestions || []);

        const profileRes = await api.get('/api/auth/me');
        setTargetRole(profileRes.data.user?.targetRole || '');
      } catch (err) {
        setError('Unable to load interview prep data.');
      }
    };

    loadData();
  }, []);

  const handleAnswerChange = (index, value) => {
    setAnswers((current) => ({ ...current, [index]: value }));
  };

  const handleSubmit = async (index) => {
    const question = questions[index];
    const answer = answers[index]?.trim();

    if (!answer) {
      setError('Please enter an answer before submitting.');
      return;
    }

    setError('');
    setLoadingIds((current) => ({ ...current, [index]: true }));

    try {
      const response = await api.post('/api/roadmap/grade-answer', {
        question,
        answer,
        targetRole,
      });

      setFeedback((current) => ({ ...current, [index]: response.data.feedback || 'No feedback returned.' }));
    } catch (err) {
      setError('Unable to grade your answer.');
    } finally {
      setLoadingIds((current) => ({ ...current, [index]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-300/20">
        <h2 className="text-xl font-semibold text-slate-900">Interview prep</h2>
        <p className="mt-2 text-sm text-slate-500">Practice answers to the latest generated interview questions.</p>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        {questions.length === 0 ? (
          <p className="mt-6 text-sm text-slate-500">No interview questions available. Generate a roadmap first.</p>
        ) : (
          <div className="mt-6 space-y-6">
            {questions.map((question, index) => (
              <div key={`${question}-${index}`} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="font-semibold text-slate-900">{question}</p>

                <textarea
                  value={answers[index] || ''}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  rows={4}
                  className="mt-4 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  placeholder="Type your answer here"
                />

                <button
                  type="button"
                  onClick={() => handleSubmit(index)}
                  disabled={loadingIds[index]}
                  className="mt-4 inline-flex items-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {loadingIds[index] ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Checking...
                    </span>
                  ) : (
                    'Submit answer'
                  )}
                </button>

                {feedback[index] && (
                  <div className="mt-4 rounded-2xl bg-white p-4 text-sm text-slate-700 shadow-sm shadow-slate-200">
                    <p className="font-semibold text-slate-900">AI feedback</p>
                    <p className="mt-2 whitespace-pre-line">{feedback[index]}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewTab;
