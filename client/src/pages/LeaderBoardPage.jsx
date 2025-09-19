import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './LeaderboardPage.css'; // 👈 Import the CSS file we will create

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // 👇 Use the full, absolute URL to your deployed backend
        const res = await axios.get('https://backend-sih-project-l67a.onrender.com/api/users/leaderboard');
        setLeaderboard(res.data);
      } catch (error) {
        console.error("Failed to fetch leaderboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const getRankClass = (index) => {
    if (index === 0) return 'rank-gold';
    if (index === 1) return 'rank-silver';
    if (index === 2) return 'rank-bronze';
    return '';
  };

  if (loading) return <div className="leaderboard-container"><h1>Loading Leaderboard...</h1></div>;

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h1>🏆 Top Citizen Reporters</h1>
        <p>Ranking the most active members of our community.</p>
      </div>
      <ol className="leaderboard-list">
        {leaderboard.map((user, index) => (
          // Use index as the key since the public leaderboard is a simple, sorted list
          <li key={index} className={`leaderboard-item ${getRankClass(index)}`}>
            <span className={`rank ${getRankClass(index)}`}>{index + 1}</span>
            <span className="name">{user.name}</span>
            <span className="points">{user.points} points</span>
          </li>
        ))}
      </ol>
    </div>
  );
};
export default LeaderboardPage;