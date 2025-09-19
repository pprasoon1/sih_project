import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MyReports from '../components/MyReports';
import './ProfilePage.css';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This function now makes a real API call to your backend
    const fetchProfile = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const res = await axios.get('/api/users/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(res.data);
        } catch (error) {
            console.error("Failed to fetch profile", error);
        } finally {
            setLoading(false);
        }
    };
    fetchProfile();
  }, []); // Empty dependency array ensures this runs once on mount

  if (loading) return <div>Loading Profile...</div>;
  if (!profile) return <div>Could not load profile.</div>;

  // A more robust calculation for the progress bar
  const totalForNextRank = profile.points + profile.pointsToNextRank;
  const progressPercentage = totalForNextRank > profile.points ? (profile.points / totalForNextRank) * 100 : 100;

  return (
    <div className="profile-container">
      <div className="profile-header-card">
        <div className="profile-avatar">{profile.name.charAt(0)}</div>
        <div className="profile-info">
          <h1>{profile.name}</h1>
          <p className="profile-rank">{profile.rank}</p>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
          </div>
          <p className="progress-text">
            {profile.pointsToNextRank > 0 ? `${profile.pointsToNextRank} points to next rank` : "Max Rank Achieved!"}
          </p>
        </div>
        <div className="profile-score-card">
          <h2>Civic Score</h2>
          <p>{profile.points}</p>
        </div>
      </div>

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

      <div className="profile-reports-section">
        <h2>Your Contributions</h2>
        <MyReports />
      </div>
    </div>
  );
};
export default ProfilePage;