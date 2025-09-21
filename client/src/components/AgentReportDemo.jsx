import React, { useState } from 'react';
import AgentReportFlow from './AgentReportFlow';
import './AgentReportDemo.css';

const AgentReportDemo = () => {
  const [showAgent, setShowAgent] = useState(false);
  const [completedReports, setCompletedReports] = useState([]);

  const handleAgentComplete = (reportData) => {
    console.log('Report completed:', reportData);
    setCompletedReports(prev => [...prev, {
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      ...reportData
    }]);
    setShowAgent(false);
  };

  const handleAgentCancel = () => {
    setShowAgent(false);
  };

  return (
    <div className="agent-demo-container">
      <div className="demo-header">
        <h1>🤖 Agentic Civic Report System</h1>
        <p>Experience the future of civic issue reporting with AI-powered assistance</p>
      </div>

      {!showAgent ? (
        <div className="demo-content">
          <div className="demo-card">
            <h2>🚀 Try the Agent Workflow</h2>
            <p>
              The agent workflow provides a guided, automated experience for reporting civic issues.
              Simply choose your preferred input method and let the AI assist you through the process.
            </p>
            
            <div className="features-list">
              <div className="feature">
                <span className="feature-icon">📸</span>
                <div>
                  <h3>Smart Image Analysis</h3>
                  <p>Upload a photo and let AI automatically detect the issue type and generate descriptions</p>
                </div>
              </div>
              
              <div className="feature">
                <span className="feature-icon">🎤</span>
                <div>
                  <h3>Voice Recognition</h3>
                  <p>Describe your issue using voice input with automatic transcription</p>
                </div>
              </div>
              
              <div className="feature">
                <span className="feature-icon">📍</span>
                <div>
                  <h3>Auto Location Detection</h3>
                  <p>Your location is automatically detected and included in the report</p>
                </div>
              </div>
              
              <div className="feature">
                <span className="feature-icon">⏱️</span>
                <div>
                  <h3>Guided Process</h3>
                  <p>Step-by-step guidance with auto-advance timers and pause/resume controls</p>
                </div>
              </div>
            </div>

            <button 
              className="start-agent-btn"
              onClick={() => setShowAgent(true)}
            >
              🤖 Start Agent Workflow
            </button>
          </div>

          {completedReports.length > 0 && (
            <div className="completed-reports">
              <h3>📋 Recently Completed Reports</h3>
              <div className="reports-list">
                {completedReports.map(report => (
                  <div key={report.id} className="report-item">
                    <div className="report-header">
                      <h4>{report.title}</h4>
                      <span className="report-time">{report.timestamp}</span>
                    </div>
                    <p className="report-description">{report.description}</p>
                    <div className="report-meta">
                      <span className="report-category">{report.category}</span>
                      <span className="report-files">{report.mediaFiles?.length || 0} files</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="agent-container">
          <AgentReportFlow 
            onComplete={handleAgentComplete}
            onCancel={handleAgentCancel}
          />
        </div>
      )}
    </div>
  );
};

export default AgentReportDemo;
