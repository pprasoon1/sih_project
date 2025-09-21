import React, { useState, useEffect } from 'react';
import { agentAPI } from '../api/axios';
import './AgentAnalytics.css';

const AgentAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const response = await agentAPI.getAnalytics('7d');
      setAnalytics(response.data.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="agent-analytics">
        <div className="loading">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="agent-analytics">
        <div className="error">Failed to load analytics</div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="agent-analytics">
      <h3>🤖 AI Assistant Analytics</h3>
      
      <div className="analytics-grid">
        <div className="metric-card">
          <div className="metric-value">{analytics.overall?.agentReports || 0}</div>
          <div className="metric-label">AI Reports</div>
        </div>
        
        <div className="metric-card">
          <div className="metric-value">{analytics.overall?.agentUsageRate || 0}%</div>
          <div className="metric-label">AI Usage Rate</div>
        </div>
        
        <div className="metric-card">
          <div className="metric-value">
            {analytics.confidence?.overall?.avgConfidence 
              ? Math.round(analytics.confidence.overall.avgConfidence * 100) 
              : 0}%
          </div>
          <div className="metric-label">Avg Confidence</div>
        </div>
      </div>

      {analytics.categories && analytics.categories.length > 0 && (
        <div className="category-breakdown">
          <h4>Top Categories (AI vs Manual)</h4>
          <div className="category-list">
            {analytics.categories.slice(0, 5).map((category, index) => (
              <div key={index} className="category-item">
                <div className="category-name">{category.category}</div>
                <div className="category-stats">
                  <div className="stat">
                    <span className="stat-label">AI:</span>
                    <span className="stat-value">{category.agentCount}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Manual:</span>
                    <span className="stat-value">{category.manualCount}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">AI%:</span>
                    <span className="stat-value">{category.agentPercentage}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentAnalytics;
