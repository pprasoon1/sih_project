import React from 'react';
import AgentIntegrationExample from '../components/AgentIntegrationExample';
import './AgentTestPage.css';

/**
 * Test page demonstrating the Agent Report Flow integration
 * This page shows how to integrate the agent workflow into your existing application
 */
const AgentTestPage = () => {
  return (
    <div className="agent-test-page">
      <AgentIntegrationExample />
    </div>
  );
};

export default AgentTestPage;
