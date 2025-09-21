import axios from "axios";

const API = axios.create({
  baseURL: "https://backend-sih-project-l67a.onrender.com/api", // backend base url
});

// Attach token automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Agent-specific API methods
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
  getAnalytics: (timeframe = '7d') => API.get(`/agent/analytics?timeframe=${timeframe}`),

  // Validate input
  validateInput: (inputType, data) => API.post('/agent/validate', { inputType, data }),

  // Health check
  healthCheck: () => API.get('/agent/health')
};

export default API;
