/**
 * Agent Configuration
 * Centralized configuration for AI services and agent workflow
 */

export const agentConfig = {
  // AI Service Configuration
  ai: {
    google: {
      apiKey: process.env.GOOGLE_API_KEY,
      model: 'gemini-1.5-flash',
      maxTokens: 1000,
      temperature: 0.7
    },
    speech: {
      languageCode: 'en-US',
      sampleRateHertz: 16000,
      encoding: 'LINEAR16',
      model: 'latest_long'
    }
  },

  // File Upload Configuration
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
    supportedImageTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif'
    ],
    supportedAudioTypes: [
      'audio/wav',
      'audio/mp3',
      'audio/m4a',
      'audio/webm'
    ]
  },

  // Processing Configuration
  processing: {
    confidenceThreshold: 0.5,
    maxRetries: 3,
    timeout: 30000, // 30 seconds
    batchSize: 10
  },

  // Analytics Configuration
  analytics: {
    retentionDays: 90,
    aggregationIntervals: ['24h', '7d', '30d', '90d'],
    confidenceBuckets: [0, 0.3, 0.5, 0.7, 0.9, 1.0]
  },

  // Rate Limiting Configuration
  rateLimit: {
    requestsPerMinute: 10,
    requestsPerHour: 100,
    requestsPerDay: 1000
  },

  // Notification Configuration
  notifications: {
    agentReportTitle: 'New AI-Assisted Report Submitted',
    agentReportBody: 'An AI-assisted report "{title}" was submitted by {userName}.',
    confidenceThreshold: 0.8
  },

  // Badge Configuration
  badges: {
    aiEarlyAdopter: {
      name: 'AI Early Adopter',
      description: 'First AI-assisted report',
      threshold: 1
    },
    aiPowerUser: {
      name: 'AI Power User',
      description: '10+ AI-assisted reports',
      threshold: 10
    },
    aiExpert: {
      name: 'AI Expert',
      description: '50+ AI-assisted reports',
      threshold: 50
    }
  },

  // Points Configuration
  points: {
    agentReport: 8,
    manualReport: 5,
    highConfidenceBonus: 2,
    firstReport: 5
  },

  // Error Messages
  errors: {
    missingApiKey: 'AI services unavailable: Missing API key',
    fileTooLarge: 'File too large. Maximum size is 10MB.',
    unsupportedFileType: 'Unsupported file type',
    processingTimeout: 'Processing timeout. Please try again.',
    analysisFailed: 'Analysis failed. Please try again.',
    validationFailed: 'Input validation failed'
  },

  // Success Messages
  success: {
    imageAnalyzed: 'Image analyzed successfully',
    voiceProcessed: 'Voice processed successfully',
    textAnalyzed: 'Text analyzed successfully',
    reportCreated: 'Agent report created successfully'
  }
};

/**
 * Validate agent configuration
 */
export const validateAgentConfig = () => {
  const errors = [];

  if (!agentConfig.ai.google.apiKey) {
    errors.push('GOOGLE_API_KEY environment variable is required');
  }

  if (agentConfig.upload.maxFileSize <= 0) {
    errors.push('Invalid maxFileSize configuration');
  }

  if (agentConfig.processing.confidenceThreshold < 0 || agentConfig.processing.confidenceThreshold > 1) {
    errors.push('Invalid confidenceThreshold configuration');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Get configuration for specific service
 */
export const getServiceConfig = (service) => {
  switch (service) {
    case 'ai':
      return agentConfig.ai;
    case 'upload':
      return agentConfig.upload;
    case 'processing':
      return agentConfig.processing;
    case 'analytics':
      return agentConfig.analytics;
    case 'rateLimit':
      return agentConfig.rateLimit;
    case 'notifications':
      return agentConfig.notifications;
    case 'badges':
      return agentConfig.badges;
    case 'points':
      return agentConfig.points;
    default:
      return agentConfig;
  }
};

export default agentConfig;
