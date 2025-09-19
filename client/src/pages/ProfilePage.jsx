import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MyReports from '../components/MyReports';
import './ProfilePage.css'; // We'll create this new CSS file

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // MOCK DATA - In a real app, this would come from your API
  const mockProfileData = {
    name: "Prasoon",
    points: 85,
    rank: "Senior Reporter",
    pointsToNextRank: 115,
    stats: {
      reportsSubmitted: 12,
      reportsResolved: 7,
      upvotesReceived: 43
    },
    badges: [
      { id: "first_report", name: "First Report", icon: "📝" },
      { id: "problem_solver", name: "Problem Solver", icon: "✅" },
      { id: "community_voice", name: "Community Voice", icon: "🗣️" }
    ]
  };
  // END MOCK DATA

  useEffect(() => {
    // In the future, you would replace the mock data with a real API call
    // For now, we'll simulate a fetch
    setTimeout(() => {
      setProfile(mockProfileData);
      setLoading(false);
    }, 1000); // Simulate network delay
  }, []);

  if (loading) return <div>Loading Profile...</div>;
  if (!profile) return <div>Could not load profile.</div>;

  const progressPercentage = (profile.points / (profile.points + profile.pointsToNextRank)) * 100;

  return (
    <div className="profile-container">
      {/* --- Profile Header --- */}
      <div className="profile-header-card">
        <div className="profile-avatar">{profile.name.charAt(0)}</div>
        <div className="profile-info">
          <h1>{profile.name}</h1>
          <p className="profile-rank">{profile.rank}</p>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
          </div>
          <p className="progress-text">{profile.pointsToNextRank} points to next rank</p>
        </div>
        <div className="profile-score-card">
          <h2>Civic Score</h2>
          <p>{profile.points}</p>
        </div>
      </div>

      {/* --- Stats Grid --- */}
      <div className="profile-stats-grid">
        <div className="stat-item">
          <h3>{profile.stats.reportsSubmitted}</h3>
          <p>Reports Submitted</p>
        </div>
        <div className="stat-item">
          <h3>{profile.stats.reportsResolved}</h3>
          <p>Reports Resolved</p>
        </div>
        <div className="stat-item">
          <h3>{profile.stats.upvotesReceived}</h3>
          <p>Upvotes on your Reports</p>
        </div>
      </div>

      {/* --- Achievements Section --- */}
      <div className="profile-achievements">
        <h2>Achievements</h2>
        <div className="badges-container">
          {profile.badges.map(badge => (
            <div key={badge.id} className="badge">
              <span className="badge-icon">{badge.icon}</span>
              <span className="badge-name">{badge.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* --- Contributions Section --- */}
      <div className="profile-reports-section">
        <h2>Your Contributions</h2>
        <MyReports />
      </div>
    </div>
  );
};
export default ProfilePage;