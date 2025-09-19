import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get('/api/users/leaderboard');
        setLeaderboard(res.data);
      } catch (error) {
        console.error("Failed to fetch leaderboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) return <div>Loading Leaderboard...</div>;

  return (
    <div className="leaderboard-container">
      <h1>Top Citizen Reporters</h1>
      <ol className="leaderboard-list">
        {leaderboard.map((user, index) => (
          <li key={user._id} className="leaderboard-item">
            <span className="rank">{index + 1}</span>
            <span className="name">{user.name}</span>
            <span className="points">{user.points} points</span>
          </li>
        ))}
      </ol>
    </div>
  );
};
export default LeaderboardPage;