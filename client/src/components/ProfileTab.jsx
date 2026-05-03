import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const ProfileTab = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await api.get('/api/auth/me');
        setProfile(response.data);
      } catch (err) {
        setError('Unable to load profile information.');
      }
    };

    loadProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="space-y-6 rounded-3xl bg-white p-6 shadow-lg shadow-slate-300/20">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Profile</h2>
        <p className="mt-2 text-sm text-slate-500">View your account details and logout when you are done.</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {!profile ? (
        <p className="text-sm text-slate-500">Loading profile...</p>
      ) : (
        <div className="space-y-4">
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Name</p>
            <p className="mt-1 text-base font-semibold text-slate-900">{profile.name}</p>
          </div>

          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Email</p>
            <p className="mt-1 text-base font-semibold text-slate-900">{profile.email}</p>
          </div>

          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Target role</p>
            <p className="mt-1 text-base font-semibold text-slate-900">{profile.targetRole || 'Not set'}</p>
          </div>

          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Skills</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {profile.skills?.length > 0 ? (
                profile.skills.map((skill, index) => (
                  <span key={`${skill}-${index}`} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-500">No skills added yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleLogout}
        className="mt-4 rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
      >
        Logout
      </button>
    </div>
  );
};

export default ProfileTab;
