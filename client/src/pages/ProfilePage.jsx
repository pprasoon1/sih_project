import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MyReports from '../components/MyReports'; // Reuse the MyReports component

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
        const token = localStorage.getItem('token');
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
  }, []);

  if (loading) return <div>Loading Profile...</div>;
  if (!profile) return <div>Could not load profile.</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>{profile.name}</h1>
        <div className="profile-score-card">
          <h2>Civic Score</h2>
          <p>{profile.points}</p>
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