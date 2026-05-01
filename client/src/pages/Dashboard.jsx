import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RoadmapTab from '../components/RoadmapTab';
import JobsTab from '../components/JobsTab';
import InterviewTab from '../components/InterviewTab';
import ProfileTab from '../components/ProfileTab';

const tabs = ['Roadmap', 'Jobs', 'Interview Prep', 'Profile'];

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Roadmap');

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/');
    }
  }, [navigate]);

  const renderTab = () => {
    switch (activeTab) {
      case 'Jobs':
        return <JobsTab />;
      case 'Interview Prep':
        return <InterviewTab />;
      case 'Profile':
        return <ProfileTab />;
      default:
        return <RoadmapTab />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <div className="rounded-3xl bg-white p-8 shadow-lg shadow-slate-300/20">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">Career Dashboard</h1>
              <p className="mt-2 text-sm text-slate-500">Manage your roadmap, job search, interview prep, and profile in one place.</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  activeTab === tab
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div>{renderTab()}</div>
      </div>
    </div>
  );
};

export default Dashboard;
