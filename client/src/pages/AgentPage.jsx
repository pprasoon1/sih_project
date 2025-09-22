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
    // ... loading and error logic remains the same ...
    setLoading(true);
    setError(null);
    try {
      const response = await agentAPI.getStats();
      setAgentStats(response.data.data);
    } catch (error) {
      console.error('Failed to load agent stats:', error);
      if (error.response?.status === 404) {
        setAgentStats({
          database: { totalAgentReports: 0, recentAgentReports: 0 },
          supportedImageTypes: ['jpg', 'png', 'webp']
        });
      } else {
        setError('Failed to connect to AI services.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAgentComplete = (reportData) => {
    toast.success(`AI Report submitted! +${reportData.pointsAwarded || 8} points`);
    setShowAgent(false);
    loadAgentStats();
    navigate('/myreports');
  };

  const handleAgentCancel = () => {
    setShowAgent(false);
  };

  if (loading) {
    return (
      <div className="agent-page-container">
        <div className="state-container">
          <div className="spinner"></div>
          <p>Connecting to AI Services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="agent-page-container">
        <div className="state-container error">
          <h2>⚠️ Service Unavailable</h2>
          <p>{error}</p>
          <button onClick={loadAgentStats} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="agent-page-container">
        <div className="agent-hero-background"></div>
        <main className="agent-main-content">
          
          {/* --- Header Card --- */}
          <section className="content-card header-card">
            <div className="header-badge">Intelligent Assistant</div>
            <h1>The Future of Civic Reporting</h1>
            <p>Use our advanced AI to analyze photos, transcribe your voice, and file detailed civic issue reports in seconds.</p>
            {agentStats && (
              <div className="header-stats-wrapper">
                <StatCard number={agentStats.database?.totalAgentReports || 0} label="AI Reports Filed" />
                <StatCard number={agentStats.database?.recentAgentReports || 0} label="In Last 24h" />
                <StatCard number={agentStats.supportedImageTypes?.length || 0} label="Formats Supported" />
              </div>
            )}
          </section>

            {/* --- CTA Card --- */}
          <section className="content-card cta-card">
              <h3>Start Your AI-Powered Report</h3>
              <p>Launch the intelligent assistant to get started. It's the fastest way to make a difference.</p>
              <button className="start-agent-btn" onClick={() => setShowAgent(true)}>
                <span>🚀</span> Launch AI Assistant
              </button>
              <button className="traditional-btn" onClick={() => navigate('/dashboard')}>
                or use the Manual Form
              </button>
          </section>
          {/* --- Features Card --- */}
          <section className="content-card features-card">
            <h2 className="section-title">A Smarter Way to Report</h2>
            <div className="agent-features-grid">
              <FeatureCard icon="📸" title="Smart Image Analysis" description="Upload a photo to automatically detect the issue and generate descriptions." />
              <FeatureCard icon="🎤" title="Voice Recognition" description="Describe the issue with your voice for automatic transcription and analysis." />
              <FeatureCard icon="📍" title="Auto-Location" description="Your location is automatically detected for accurate positioning." />
            </div>
          </section>

        </main>
      </div>

      {showAgent && (
        <div className="agent-modal-overlay">
          <div className="agent-modal-content">
            <AgentReportFlow 
              onComplete={handleAgentComplete}
              onCancel={handleAgentCancel}
            />
          </div>
        </div>
      )}
    </>
  );
};

// Helper components for a cleaner structure
const StatCard = ({ number, label }) => (
  <div className="stat-card">
    <div className="stat-number">{number}</div>
    <div className="stat-label">{label}</div>
  </div>
);

const FeatureCard = ({ icon, title, description }) => (
  <div className="feature-card">
    <div className="feature-icon">{icon}</div>
    <div className="feature-text">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  </div>
);

export default AgentPage;