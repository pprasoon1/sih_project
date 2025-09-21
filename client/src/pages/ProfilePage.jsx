import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MyReports from '../components/MyReports';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view your profile');
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get('https://backend-sih-project-l67a.onrender.com/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data);
      } catch (error) {
        console.error("Failed to fetch profile", error);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="spinner mx-auto mb-4"></div>
              <p className="text-gray-600">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Profile</h3>
              <p className="text-gray-600 mb-4">{error || 'Profile not found'}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="btn btn-primary"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalForNextRank = profile.points + profile.pointsToNextRank;
  const progressPercentage = totalForNextRank > profile.points ? (profile.points / totalForNextRank) * 100 : 100;

  const getRankIcon = (rank) => {
    const icons = {
      'Citizen': '👤',
      'Contributor': '⭐',
      'Advocate': '🏆',
      'Champion': '👑',
      'Hero': '🦸'
    };
    return icons[rank] || '👤';
  };

  const getRankColor = (rank) => {
    const colors = {
      'Citizen': 'text-gray-600',
      'Contributor': 'text-blue-600',
      'Advocate': 'text-purple-600',
      'Champion': 'text-yellow-600',
      'Hero': 'text-red-600'
    };
    return colors[rank] || 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container">
        {/* Profile Header */}
        <div className="card mb-8">
          <div className="card-body">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{profile.name}</h1>
                <div className="flex items-center justify-center md:justify-start space-x-2 mb-4">
                  <span className="text-2xl">{getRankIcon(profile.rank)}</span>
                  <span className={`text-lg font-semibold ${getRankColor(profile.rank)}`}>
                    {profile.rank}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Progress to next rank</span>
                    <span>{profile.points} / {totalForNextRank} points</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {profile.pointsToNextRank > 0 
                      ? `${profile.pointsToNextRank} points to next rank` 
                      : "Max Rank Achieved! 🎉"
                    }
                  </p>
                </div>
              </div>

              {/* Civic Score */}
              <div className="flex-shrink-0">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white text-2xl font-bold">{profile.points}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Civic Score</h3>
                  <p className="text-sm text-gray-600">Total Points</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card text-center">
            <div className="card-body">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{profile.stats.reportsSubmitted}</h3>
              <p className="text-gray-600">Reports Submitted</p>
            </div>
          </div>

          <div className="card text-center">
            <div className="card-body">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{profile.stats.reportsResolved}</h3>
              <p className="text-gray-600">Reports Resolved</p>
            </div>
          </div>

          <div className="card text-center">
            <div className="card-body">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{profile.stats.upvotesReceived}</h3>
              <p className="text-gray-600">Upvotes Received</p>
            </div>
          </div>
        </div>

        {/* Achievements */}
        {profile.badges && profile.badges.length > 0 && (
          <div className="card mb-8">
            <div className="card-body">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Achievements</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {profile.badges.map(badge => (
                  <div key={badge.id} className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="text-3xl mb-2">{badge.icon}</div>
                    <p className="text-sm font-medium text-gray-900">{badge.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Your Reports Section */}
        <div className="card">
          <div className="card-body">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Contributions</h2>
            <MyReports />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;