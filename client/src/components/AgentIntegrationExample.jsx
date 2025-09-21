import React, { useState } from 'react';
import AgentReportFlow from './AgentReportFlow';
import './AgentIntegrationExample.css';

/**
 * Example component showing how to integrate AgentReportFlow into existing pages
 * This demonstrates how to add the agent workflow alongside existing report forms
 */
const AgentIntegrationExample = () => {
  const [showAgent, setShowAgent] = useState(false);
  const [showTraditionalForm, setShowTraditionalForm] = useState(false);

  const handleAgentComplete = (reportData) => {
    console.log('Agent workflow completed:', reportData);
    // Handle successful report submission
    setShowAgent(false);
    // You could show a success message, redirect, or update UI here
  };

  const handleAgentCancel = () => {
    setShowAgent(false);
  };

  return (
    <div className="integration-example">
      <div className="example-header">
        <h1>Civic Issue Reporting</h1>
        <p>Choose your preferred reporting method</p>
      </div>

      <div className="reporting-options">
        {/* Agent Workflow Option */}
        <div className="option-card agent-option">
          <div className="option-icon">🤖</div>
          <h2>AI-Powered Agent</h2>
          <p>
            Let our intelligent agent guide you through the reporting process.
            Simply take a photo, speak, or type your description.
          </p>
          <ul className="feature-list">
            <li>📸 Smart image analysis</li>
            <li>🎤 Voice recognition</li>
            <li>📍 Auto location detection</li>
            <li>⏱️ Guided step-by-step process</li>
          </ul>
          <button 
            className="option-btn agent-btn"
            onClick={() => setShowAgent(true)}
          >
            Start with Agent
          </button>
        </div>

        {/* Traditional Form Option */}
        <div className="option-card traditional-option">
          <div className="option-icon">📝</div>
          <h2>Traditional Form</h2>
          <p>
            Use the standard form to manually enter all details
            and upload files for your civic issue report.
          </p>
          <ul className="feature-list">
            <li>✏️ Manual data entry</li>
            <li>📁 File upload</li>
            <li>📍 Manual location entry</li>
            <li>🔧 Full control over all fields</li>
          </ul>
          <button 
            className="option-btn traditional-btn"
            onClick={() => setShowTraditionalForm(true)}
          >
            Use Traditional Form
          </button>
        </div>
      </div>

      {/* Agent Workflow Modal */}
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

      {/* Traditional Form Modal */}
      {showTraditionalForm && (
        <div className="form-modal">
          <div className="form-modal-content">
            <div className="form-header">
              <h2>Traditional Report Form</h2>
              <button 
                className="close-btn"
                onClick={() => setShowTraditionalForm(false)}
              >
                ✕
              </button>
            </div>
            <div className="form-body">
              <p>This would be your existing CitizenDashboard component or form.</p>
              <p>Replace this with your actual form component:</p>
              <code>
                {`<CitizenDashboard />`}
              </code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentIntegrationExample;
