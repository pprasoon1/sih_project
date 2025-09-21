import agentService from '../services/agentService.js';

/**
 * Agent-specific middleware for validation and processing
 */

/**
 * Validate agent input based on type
 */
export const validateAgentInput = (inputType) => {
  return (req, res, next) => {
    try {
      let validation = { isValid: true, errors: [] };

      switch (inputType) {
        case 'image':
          validation = validateImageInput(req);
          break;
        case 'voice':
          validation = validateVoiceInput(req);
          break;
        case 'text':
          validation = validateTextInput(req);
          break;
        default:
          validation = { isValid: false, errors: ['Invalid input type'] };
      }

      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Input validation failed',
          errors: validation.errors
        });
      }

      next();
    } catch (error) {
      console.error('Agent input validation error:', error);
      res.status(500).json({
        success: false,
        message: 'Input validation error',
        error: error.message
      });
    }
  };
};

/**
 * Validate image input
 */
const validateImageInput = (req) => {
  const errors = [];
  
  if (!req.file) {
    errors.push('Image file is required');
  } else {
    // Check file size
    if (req.file.size > 10 * 1024 * 1024) {
      errors.push('Image file too large (max 10MB)');
    }
    
    // Check file type
    const supportedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!supportedTypes.includes(req.file.mimetype)) {
      errors.push('Unsupported image format. Supported: JPEG, PNG, WebP, GIF');
    }
    
    // Check file buffer
    if (!req.file.buffer || req.file.buffer.length === 0) {
      errors.push('Image file is empty or corrupted');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate voice input
 */
const validateVoiceInput = (req) => {
  const errors = [];
  
  if (!req.file) {
    errors.push('Audio file is required');
  } else {
    // Check file size
    if (req.file.size > 10 * 1024 * 1024) {
      errors.push('Audio file too large (max 10MB)');
    }
    
    // Check file type
    const supportedTypes = ['audio/wav', 'audio/mp3', 'audio/m4a', 'audio/webm'];
    if (!supportedTypes.includes(req.file.mimetype)) {
      errors.push('Unsupported audio format. Supported: WAV, MP3, M4A, WebM');
    }
    
    // Check file buffer
    if (!req.file.buffer || req.file.buffer.length === 0) {
      errors.push('Audio file is empty or corrupted');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate text input
 */
const validateTextInput = (req) => {
  const errors = [];
  const { text } = req.body;
  
  if (!text || text.trim().length === 0) {
    errors.push('Text input is required');
  } else if (text.length > 2000) {
    errors.push('Text input too long (max 2000 characters)');
  } else if (text.length < 10) {
    errors.push('Text input too short (min 10 characters)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Rate limiting for agent endpoints
 */
export const agentRateLimit = (maxRequests = 10, windowMs = 60000) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const userId = req.user?._id?.toString();
    const now = Date.now();
    
    if (!userId) {
      return next();
    }
    
    // Clean old entries
    for (const [key, value] of requests.entries()) {
      if (now - value.timestamp > windowMs) {
        requests.delete(key);
      }
    }
    
    const key = `${userId}-${Math.floor(now / windowMs)}`;
    const userRequests = requests.get(key) || { count: 0, timestamp: now };
    
    if (userRequests.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many agent requests. Please try again later.',
        retryAfter: Math.ceil((windowMs - (now - userRequests.timestamp)) / 1000)
      });
    }
    
    userRequests.count++;
    requests.set(key, userRequests);
    
    next();
  };
};

/**
 * Validate agent report data
 */
export const validateAgentReport = (req, res, next) => {
  try {
    const { 
      title, 
      description, 
      category, 
      coordinates, 
      processingMethod,
      confidence,
      severity,
      suggestedPriority
    } = req.body;

    const errors = [];

    // Validate required fields
    if (!title || title.trim().length === 0) {
      errors.push('Title is required');
    } else if (title.length > 100) {
      errors.push('Title too long (max 100 characters)');
    }

    if (!category) {
      errors.push('Category is required');
    } else {
      const validCategories = ['pothole', 'streetlight', 'garbage', 'water', 'tree', 'other'];
      if (!validCategories.includes(category)) {
        errors.push('Invalid category');
      }
    }

    if (!coordinates) {
      errors.push('Coordinates are required');
    } else {
      try {
        const parsed = JSON.parse(coordinates);
        if (!Array.isArray(parsed) || parsed.length !== 2) {
          errors.push('Invalid coordinates format');
        } else if (typeof parsed[0] !== 'number' || typeof parsed[1] !== 'number') {
          errors.push('Coordinates must be numbers');
        } else if (parsed[0] < -180 || parsed[0] > 180 || parsed[1] < -90 || parsed[1] > 90) {
          errors.push('Invalid coordinate values');
        }
      } catch (e) {
        errors.push('Invalid coordinates format');
      }
    }

    // Validate optional fields
    if (description && description.length > 1000) {
      errors.push('Description too long (max 1000 characters)');
    }

    if (processingMethod && !['agentic', 'manual'].includes(processingMethod)) {
      errors.push('Invalid processing method');
    }

    if (confidence !== undefined) {
      const conf = parseFloat(confidence);
      if (isNaN(conf) || conf < 0 || conf > 1) {
        errors.push('Confidence must be between 0 and 1');
      }
    }

    if (severity && !['low', 'medium', 'high', 'critical'].includes(severity)) {
      errors.push('Invalid severity level');
    }

    if (suggestedPriority && !['low', 'medium', 'high'].includes(suggestedPriority)) {
      errors.push('Invalid priority level');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Agent report validation failed',
        errors
      });
    }

    next();
  } catch (error) {
    console.error('Agent report validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Validation error',
      error: error.message
    });
  }
};

/**
 * Log agent activity
 */
export const logAgentActivity = (activity) => {
  return (req, res, next) => {
    const startTime = Date.now();
    
    // Log the request
    console.log(`🤖 Agent Activity: ${activity}`, {
      userId: req.user?._id,
      userEmail: req.user?.email,
      timestamp: new Date().toISOString(),
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
    
    // Override res.json to log response time
    const originalJson = res.json;
    res.json = function(data) {
      const duration = Date.now() - startTime;
      console.log(`🤖 Agent Response: ${activity}`, {
        duration: `${duration}ms`,
        success: data.success,
        statusCode: res.statusCode
      });
      return originalJson.call(this, data);
    };
    
    next();
  };
};

/**
 * Check agent service health
 */
export const checkAgentHealth = async (req, res, next) => {
  try {
    // Check if required environment variables are set
    if (!process.env.GOOGLE_API_KEY) {
      return res.status(503).json({
        success: false,
        message: 'Agent services unavailable: Missing API key',
        service: 'agent'
      });
    }

    // You could add more health checks here
    // e.g., ping external services, check database connectivity, etc.
    
    next();
  } catch (error) {
    console.error('Agent health check error:', error);
    res.status(503).json({
      success: false,
      message: 'Agent services unavailable',
      error: error.message
    });
  }
};

export default {
  validateAgentInput,
  agentRateLimit,
  validateAgentReport,
  logAgentActivity,
  checkAgentHealth
};
