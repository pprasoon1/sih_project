# Agent Workflow Integration Guide

## Overview

This guide explains how to integrate the agentic workflow for civic issue reporting, connecting the frontend React components with the backend Node.js/Express API.

## Architecture Overview

```
Frontend (React)          Backend (Node.js/Express)
├── AgentReportFlow.jsx   ├── agentController.js
├── AgentReportDemo.jsx   ├── agentService.js
├── AgentIntegration.jsx  ├── agentRoutes.js
└── Components/           ├── agentMiddleware.js
    ├── VoiceInput.jsx    ├── agentAnalyticsService.js
    ├── ImageCapture.jsx  └── config/agentConfig.js
    └── ...
```

## Frontend Integration

### 1. Update API Configuration

First, update your API configuration to include the agent endpoints:

```javascript
// client/src/api/axios.jsx
import axios from "axios";

const API = axios.create({
  baseURL: "https://backend-sih-project-l67a.onrender.com/api",
});

// Add agent-specific methods
export const agentAPI = {
  // Image analysis
  analyzeImage: (formData) => API.post('/agent/analyze-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  // Voice processing
  processVoice: (formData) => API.post('/agent/process-voice', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  // Text analysis
  analyzeText: (text) => API.post('/agent/analyze-text', { text }),

  // Create agent report
  createReport: (reportData) => API.post('/agent/create-report', reportData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  // Get statistics
  getStats: () => API.get('/agent/stats'),

  // Get analytics
  getAnalytics: (timeframe = '7d') => API.get(`/agent/analytics?timeframe=${timeframe}`)
};

export default API;
```

### 2. Update AgentReportFlow Component

Update the `AgentReportFlow.jsx` to use the actual API endpoints:

```javascript
// client/src/components/AgentReportFlow.jsx
import { agentAPI } from '../api/axios';

// Replace the mock analyzeImage function with:
const analyzeImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  
  try {
    const response = await agentAPI.analyzeImage(formData);
    return response.data.data;
  } catch (error) {
    console.error('Image analysis error:', error);
    throw new Error('Failed to analyze image');
  }
};

// Replace the mock processVoiceInput function with:
const processVoiceInput = async (audioBuffer, mimeType) => {
  const formData = new FormData();
  formData.append('audio', new Blob([audioBuffer], { type: mimeType }));
  
  try {
    const response = await agentAPI.processVoice(formData);
    return response.data.data;
  } catch (error) {
    console.error('Voice processing error:', error);
    throw new Error('Failed to process voice input');
  }
};

// Replace the mock analyzeText function with:
const analyzeText = async (text) => {
  try {
    const response = await agentAPI.analyzeText(text);
    return response.data.data;
  } catch (error) {
    console.error('Text analysis error:', error);
    throw new Error('Failed to analyze text');
  }
};

// Update the handleSubmitReport function:
const handleSubmitReport = async () => {
  if (!reportData.title || !reportData.coordinates) {
    toast.error('Missing required information');
    return;
  }

  setIsProcessing(true);
  
  try {
    const formData = new FormData();
    formData.append('title', reportData.title);
    formData.append('description', reportData.description);
    formData.append('category', reportData.category);
    formData.append('coordinates', JSON.stringify(reportData.coordinates));
    formData.append('processingMethod', 'agentic');
    
    // Add confidence and other metadata if available
    if (reportData.confidence) {
      formData.append('confidence', reportData.confidence);
    }
    if (reportData.severity) {
      formData.append('severity', reportData.severity);
    }
    if (reportData.suggestedPriority) {
      formData.append('suggestedPriority', reportData.suggestedPriority);
    }
    
    // Add media files
    reportData.mediaFiles.forEach((file) => {
      formData.append('media', file);
    });

    const response = await agentAPI.createReport(formData);
    
    toast.success('Report submitted successfully!');
    setCurrentStep(7);
    setCountdown(0);
    
    if (onComplete) {
      setTimeout(() => onComplete(response.data.data), 2000);
    }
  } catch (error) {
    console.error('Error submitting report:', error);
    toast.error('Failed to submit report. Please try again.');
  } finally {
    setIsProcessing(false);
  }
};
```

### 3. Add Error Handling

Enhance error handling throughout the component:

```javascript
// Add to AgentReportFlow.jsx
const [error, setError] = useState(null);

const handleError = (error, context) => {
  console.error(`${context} error:`, error);
  setError(error.message);
  toast.error(`${context} failed: ${error.message}`);
};

// Update each processing function to use handleError
const analyzeImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    const response = await agentAPI.analyzeImage(formData);
    return response.data.data;
  } catch (error) {
    handleError(error, 'Image analysis');
    throw error;
  }
};
```

## Backend Integration

### 1. Environment Variables

Add the required environment variables to your `.env` file:

```bash
# Required for agent services
GOOGLE_API_KEY=your_google_api_key_here

# Optional agent configuration
AGENT_MAX_FILE_SIZE=10485760
AGENT_CONFIDENCE_THRESHOLD=0.5
AGENT_RATE_LIMIT_PER_MINUTE=10
```

### 2. Database Migration

The Report model already includes agent metadata fields. No migration is needed, but ensure your database is up to date:

```bash
# If using MongoDB, ensure indexes are created
db.reports.createIndex({ "metadata.processingMethod": 1 })
db.reports.createIndex({ "metadata.confidence": 1 })
```

### 3. API Testing

Test the agent endpoints using curl or Postman:

```bash
# Test image analysis
curl -X POST http://localhost:5001/api/agent/analyze-image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@test-image.jpg"

# Test voice processing
curl -X POST http://localhost:5001/api/agent/process-voice \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "audio=@test-audio.wav"

# Test text analysis
curl -X POST http://localhost:5001/api/agent/analyze-text \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text": "There is a large pothole on Main Street"}'
```

## Complete Integration Example

### 1. Create a Complete Agent Page

```javascript
// client/src/pages/AgentPage.jsx
import React, { useState, useEffect } from 'react';
import AgentReportFlow from '../components/AgentReportFlow';
import { agentAPI } from '../api/axios';
import './AgentPage.css';

const AgentPage = () => {
  const [showAgent, setShowAgent] = useState(false);
  const [agentStats, setAgentStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAgentStats();
  }, []);

  const loadAgentStats = async () => {
    try {
      const response = await agentAPI.getStats();
      setAgentStats(response.data.data);
    } catch (error) {
      console.error('Failed to load agent stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAgentComplete = (reportData) => {
    console.log('Agent workflow completed:', reportData);
    setShowAgent(false);
    // Refresh stats
    loadAgentStats();
  };

  const handleAgentCancel = () => {
    setShowAgent(false);
  };

  if (loading) {
    return <div className="loading">Loading agent services...</div>;
  }

  return (
    <div className="agent-page">
      <div className="agent-header">
        <h1>🤖 AI-Powered Report Assistant</h1>
        <p>Let our intelligent agent help you report civic issues quickly and accurately.</p>
        
        {agentStats && (
          <div className="agent-stats">
            <div className="stat">
              <span className="stat-number">{agentStats.database?.totalAgentReports || 0}</span>
              <span className="stat-label">AI Reports</span>
            </div>
            <div className="stat">
              <span className="stat-number">{agentStats.database?.recentAgentReports || 0}</span>
              <span className="stat-label">Last 24h</span>
            </div>
          </div>
        )}
      </div>

      <div className="agent-actions">
        <button 
          className="start-agent-btn"
          onClick={() => setShowAgent(true)}
        >
          🚀 Start AI Assistant
        </button>
      </div>

      {showAgent && (
        <div className="agent-modal">
          <AgentReportFlow 
            onComplete={handleAgentComplete}
            onCancel={handleAgentCancel}
          />
        </div>
      )}
    </div>
  );
};

export default AgentPage;
```

### 2. Add Agent Page to Routing

```javascript
// client/src/App.jsx
import AgentPage from './pages/AgentPage';

// Add route
<Route path="/agent" element={<AgentPage />} />
```

### 3. Update Navigation

Add agent workflow to your navigation:

```javascript
// client/src/components/Navbar.jsx
const Navbar = () => {
  return (
    <nav className="navbar">
      {/* ... existing nav items ... */}
      <Link to="/agent" className="nav-link">
        🤖 AI Assistant
      </Link>
    </nav>
  );
};
```

## Testing the Integration

### 1. Frontend Testing

```javascript
// client/src/tests/AgentReportFlow.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AgentReportFlow from '../components/AgentReportFlow';
import { agentAPI } from '../api/axios';

// Mock the API
jest.mock('../api/axios', () => ({
  agentAPI: {
    analyzeImage: jest.fn(),
    processVoice: jest.fn(),
    analyzeText: jest.fn(),
    createReport: jest.fn()
  }
}));

test('should analyze image successfully', async () => {
  const mockAnalysis = {
    title: 'Pothole Detected',
    description: 'Large pothole in road',
    category: 'pothole',
    confidence: 0.9
  };

  agentAPI.analyzeImage.mockResolvedValue({
    data: { data: mockAnalysis }
  });

  render(<AgentReportFlow />);
  
  // Test image analysis flow
  // ... test implementation
});
```

### 2. Backend Testing

```bash
# Run agent controller tests
npm test -- --grep "Agent Controller"

# Run integration tests
npm run test:integration -- --grep "Agent"
```

## Deployment

### 1. Frontend Deployment

Ensure your frontend build includes the agent components:

```bash
npm run build
# Deploy the build folder
```

### 2. Backend Deployment

Deploy with environment variables:

```bash
# Set environment variables
export GOOGLE_API_KEY=your_key
export NODE_ENV=production

# Start server
npm start
```

### 3. Health Checks

Monitor agent services:

```bash
# Check agent health
curl http://your-domain.com/api/agent/health

# Check agent stats
curl -H "Authorization: Bearer TOKEN" http://your-domain.com/api/agent/stats
```

## Monitoring and Analytics

### 1. Real-time Monitoring

Monitor agent usage in real-time:

```javascript
// client/src/components/AgentAnalytics.jsx
import { useEffect, useState } from 'react';
import { agentAPI } from '../api/axios';

const AgentAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const response = await agentAPI.getAnalytics('7d');
        setAnalytics(response.data.data);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      }
    };

    loadAnalytics();
    const interval = setInterval(loadAnalytics, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="agent-analytics">
      {/* Display analytics data */}
    </div>
  );
};
```

### 2. Error Tracking

Implement error tracking for agent workflows:

```javascript
// client/src/utils/errorTracking.js
export const trackAgentError = (error, context, metadata = {}) => {
  console.error('Agent Error:', {
    error: error.message,
    context,
    metadata,
    timestamp: new Date().toISOString()
  });
  
  // Send to error tracking service
  // e.g., Sentry, LogRocket, etc.
};
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend CORS is configured for frontend domain
   - Check preflight requests

2. **Authentication Errors**
   - Verify JWT token is valid
   - Check token expiration

3. **File Upload Errors**
   - Verify file size limits
   - Check supported file types
   - Ensure proper multipart encoding

4. **AI Service Errors**
   - Check Google API key
   - Verify service quotas
   - Check network connectivity

### Debug Mode

Enable debug logging:

```javascript
// Frontend
localStorage.setItem('debug', 'agent:*');

// Backend
DEBUG=agent:* npm start
```

## Performance Optimization

### 1. Frontend Optimization

- Lazy load agent components
- Implement request caching
- Use React.memo for expensive components
- Optimize image compression

### 2. Backend Optimization

- Implement response caching
- Use connection pooling
- Optimize database queries
- Implement rate limiting

## Security Considerations

### 1. Input Validation

- Validate all file uploads
- Sanitize text inputs
- Check file types and sizes
- Validate coordinates

### 2. Authentication

- Require authentication for all agent endpoints
- Implement rate limiting
- Log all agent activities
- Monitor for abuse

### 3. Data Privacy

- Don't log sensitive data
- Implement data retention policies
- Encrypt sensitive data
- Follow GDPR guidelines

## Conclusion

The agent workflow integration provides a powerful, AI-assisted reporting system that enhances user experience while maintaining compatibility with existing systems. The modular design allows for easy maintenance and future enhancements.

For additional support or questions, refer to the individual component documentation or contact the development team.
