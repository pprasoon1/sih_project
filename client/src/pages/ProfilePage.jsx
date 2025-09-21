import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Assuming this component exists and is styled separately
import MyReports from '../components/MyReports';
import { FaChartBar, FaCheckCircle, FaStar, FaPlus, FaListAlt } from 'react-icons/fa';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // State for the new tabs in the contributions section
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view your profile.');
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get('https://backend-sih-project-l67a.onrender.com/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to fetch profile", err);
        setError('Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-slate-100">
        <div className="text-center">
          <svg className="mx-auto h-10 w-10 animate-spin text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 font-semibold text-slate-600">Loading Profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-slate-100 p-4">
        <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-md border border-slate-200">
          <h3 className="text-xl font-bold text-slate-800">An Error Occurred</h3>
          <p className="mt-2 text-sm text-slate-600">{error || 'Could not find profile information.'}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-6 rounded-md bg-slate-800 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const totalForNextRank = profile.points + profile.pointsToNextRank;
  const progressPercentage = totalForNextRank > 0 ? (profile.points / totalForNextRank) * 100 : 100;

  const getRankInfo = (rank) => {
    const ranks = {
      'Citizen': { icon: '👤', color: 'text-slate-600', bg: 'bg-slate-100' },
      'Contributor': { icon: '⭐', color: 'text-sky-700', bg: 'bg-sky-100' },
      'Advocate': { icon: '🏆', color: 'text-violet-700', bg: 'bg-violet-100' },
      'Champion': { icon: '👑', color: 'text-amber-700', bg: 'bg-amber-100' },
      'Hero': { icon: '🦸', color: 'text-red-700', bg: 'bg-red-100' }
    };
    return ranks[rank] || ranks['Citizen'];
  };

  const rankInfo = getRankInfo(profile.rank);

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* ## Profile Header Card ## */}
        <header className="rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
          <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-3">
            {/* User Info Section */}
            <div className="flex items-center gap-5 md:col-span-1">
              <div className="mx-auto flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 text-3xl font-bold text-white">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{profile.name}</h1>
                <div className={`mt-1 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${rankInfo.bg} ${rankInfo.color}`}>
                  <span>{rankInfo.icon}</span>
                  {profile.rank}
                </div>
              </div>
            </div>
            
            {/* Stats & Progress Section */}
            <div className="md:col-span-2 md:border-l md:border-slate-200 md:pl-6">
              <div className="grid grid-cols-2 items-center gap-6 sm:grid-cols-4">
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-sm font-medium text-slate-500">Civic Score</p>
                  <p className="text-4xl font-bold text-emerald-500">{profile.points}</p>
                </div>
                <StatItem icon={<FaChartBar />} title="Submitted" value={profile.stats.reportsSubmitted} />
                <StatItem icon={<FaCheckCircle />} title="Resolved" value={profile.stats.reportsResolved} />
                <StatItem icon={<FaStar />} title="Upvoted" value={profile.stats.upvotesReceived} />
              </div>
              <div className="mt-5">
                <div className="flex justify-between text-xs font-medium text-slate-500">
                  <span>Progress to next rank</span>
                  <span>{profile.pointsToNextRank > 0 ? `${profile.pointsToNextRank} points remaining` : "Max Rank!"}</span>
                </div>
                <div className="mt-1 h-2 w-full rounded-full bg-slate-100">
                  <div 
                    className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ## Main Content Grid ## */}
        <main className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Achievements Section */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
              <h2 className="text-lg font-bold text-slate-800">Achievements</h2>
              {profile.badges && profile.badges.length > 0 ? (
                <div className="mt-4 grid grid-cols-4 gap-4 sm:grid-cols-5 lg:grid-cols-4">
                  {profile.badges.map(badge => (
                    <div key={badge.id} title={badge.name} className="flex flex-col items-center text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 text-3xl transition hover:bg-slate-200">
                          {badge.icon}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500">No achievements unlocked yet.</p>
              )}
            </div>
          </div>
          
          {/* ## Contributions Section - REDESIGNED ## */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-slate-200 bg-white shadow-lg">
              {/* Card Header with Title and Action Button */}
              <div className="flex items-center justify-between border-b border-slate-200 p-4 sm:p-6">
                <div className="flex items-center gap-3">
                  <FaListAlt className="h-5 w-5 text-slate-400" />
                  <h2 className="text-lg font-bold text-slate-800">Your Contributions</h2>
                </div>
                <button className="flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 sm:px-4">
                  <FaPlus className="h-3 w-3" />
                  <span className="hidden sm:inline">New Report</span>
                </button>
              </div>

              {/* Tab Navigation */}
              <div className="px-4 sm:px-6">
                <div className="border-b border-slate-200">
                  <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <TabButton name="All" tab="all" activeTab={activeTab} onClick={setActiveTab} />
                    <TabButton name="Resolved" tab="resolved" activeTab={activeTab} onClick={setActiveTab} />
                    <TabButton name="Pending" tab="pending" activeTab={activeTab} onClick={setActiveTab} />
                  </nav>
                </div>
              </div>

              {/* Tab Content Area */}
              <div className="p-4 sm:p-6">
                {/* The MyReports component would ideally use the 'filter' prop to show the correct data */}
                <MyReports filter={activeTab} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// A lightweight component for individual stats in the header
const StatItem = ({ icon, title, value }) => (
  <div className="flex items-center gap-3">
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500">
      {React.cloneElement(icon, { className: 'h-4 w-4' })}
    </div>
    <div>
      <p className="text-lg font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-500">{title}</p>
    </div>
  </div>
);

// A reusable component for the tabs
const TabButton = ({ name, tab, activeTab, onClick }) => {
  const isActive = activeTab === tab;
  return (
    <button
      onClick={() => onClick(tab)}
      className={`whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium transition-colors
        ${isActive
          ? 'border-blue-500 text-blue-600'
          : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
        }`
      }
    >
      {name}
    </button>
  );
};

export default ProfilePage;