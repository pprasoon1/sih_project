import React from 'react';
import './StatCards.css'; // We'll create this file next

const StatCards = ({ stats }) => {
  if (!stats) {
    // Show a loading or placeholder state
    return (
        <div className="stat-cards-container loading">
            <div className="stat-card"><h3>Loading...</h3><p>--</p></div>
            <div className="stat-card"><h3>Loading...</h3><p>--</p></div>
            <div className="stat-card"><h3>Loading...</h3><p>--</p></div>
            <div className="stat-card"><h3>Loading...</h3><p>--</p></div>
        </div>
    );
  }
  
  return (
    <div className="stat-cards-container">
      <div className="stat-card">
        <h3>Total Reports</h3>
        <p className="stat-value">{stats.totalReports || 0}</p>
      </div>
      <div className="stat-card resolved">
        <h3>Resolved</h3>
        <p className="stat-value">{stats.resolvedReports || 0}</p>
      </div>
      <div className="stat-card new">
        <h3>New Reports</h3>
        <p className="stat-value">{stats.statusCounts?.new || 0}</p>
      </div>
      <div className="stat-card in-progress">
        <h3>In Progress</h3>
        <p className="stat-value">{stats.statusCounts?.in_progress || 0}</p>
      </div>
    </div>
  );
};

export default StatCards;