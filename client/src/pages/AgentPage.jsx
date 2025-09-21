import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import AgentReportFlow from '../components/AgentReportFlow';
import { agentAPI } from '../api/axios';
import './AgentPage.css';

const AgentPage = () => {
  const [showAgent, setShowAgent] = useState(false);
  const [agentStats, setAgentStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadAgentStats();
  }, []);

  const loadAgentStats = async () => {
    try {
      const response = await agentAPI.getStats();
      setAgentStats(response.data.data);
    } catch (error) {
      console.error('Failed to load agent stats:', error);
      setError('Failed to load agent services. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAgentComplete = (reportData) => {
    console.log('Agent workflow completed:', reportData);
    toast.success(`Report submitted successfully! +${reportData.pointsAwarded || 8} points`);
    setShowAgent(false);
    // Refresh stats
    loadAgentStats();
    // Navigate to reports page
    navigate('/myreports');
  };

  const handleAgentCancel = () => {
    setShowAgent(false);
  };

  const handleStartAgent = () => {
    setShowAgent(true);
  };

  if (loading) {
    return (
      <div className="agent-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading AI services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="agent-page">
        <div className="error-container">
          <h2>⚠️ Service Unavailable</h2>
          <p>{error}</p>
          <button onClick={loadAgentStats} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="agent-page">
      <div className="agent-header">
        <h1>🤖 AI-Powered Report Assistant</h1>
        <p>Let our intelligent agent help you report civic issues quickly and accurately.</p>
        
        {agentStats && (
          <div className="agent-stats">
            <div className="stat-card">
              <div className="stat-number">{agentStats.database?.totalAgentReports || 0}</div>
              <div className="stat-label">AI Reports</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{agentStats.database?.recentAgentReports || 0}</div>
              <div className="stat-label">Last 24h</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{agentStats.supportedImageTypes?.length || 0}</div>
              <div className="stat-label">Supported Formats</div>
            </div>
          </div>
        )}
      </div>

      <div className="agent-features">
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">📸</div>
            <h3>Smart Image Analysis</h3>
            <p>Upload a photo and let AI automatically detect the issue type, generate descriptions, and suggest categories.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🎤</div>
            <h3>Voice Recognition</h3>
            <p>Describe your issue using voice input with automatic transcription and intelligent analysis.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📍</div>
            <h3>Auto Location Detection</h3>
            <p>Your location is automatically detected and included in the report for accurate positioning.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">⏱️</div>
            <h3>Guided Process</h3>
            <p>Step-by-step guidance with auto-advance timers and pause/resume controls for convenience.</p>
          </div>
        </div>
      </div>

      <div className="agent-actions">
        <button 
          className="start-agent-btn"
          onClick={handleStartAgent}
        >
          🚀 Start AI Assistant
        </button>
        
        <div className="alternative-actions">
          <p>Or use the traditional form:</p>
          <button 
            className="traditional-btn"
            onClick={() => navigate('/dashboard')}
          >
            📝 Traditional Form
          </button>
        </div>
      </div>

      {showAgent && (
        <div className="agent-modal">
          <div className="agent-modal-content">
            <AgentReportFlow 
              onComplete={handleAgentComplete}
              onCancel={handleAgentCancel}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentPage;
