import axios from "axios";

const DEPLOYED_BASE = "https://backend-sih-project-l67a.onrender.com/api";
const LOCAL_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || "http://localhost:5001/api";

let API = axios.create({ baseURL: DEPLOYED_BASE });

// Try to prefer local API if reachable; fall back to deployed (non-blocking).
(async () => {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 800);
    const res = await fetch(`${LOCAL_BASE.replace(/\/$/,'')}/auth/health`, { signal: ctrl.signal });
    clearTimeout(t);
    if (res.ok) {
      API = axios.create({ baseURL: LOCAL_BASE });
      console.info("Using local API base:", LOCAL_BASE);
    }
  } catch {
    // remain on DEPLOYED_BASE
  }
})();

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
