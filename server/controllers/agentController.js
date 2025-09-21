import agentService from '../services/agentService.js';
import agentAnalyticsService from '../services/agentAnalyticsService.js';
import Report from '../models/Report.js';
import User from '../models/User.js';
import { createAndEmitNotification } from '../services/notificationService.js';

/**
 * Agent Controller for handling AI-powered civic issue reporting
 * Provides endpoints for image analysis, voice processing, and intelligent report creation
 */
class AgentController {
  
  /**
   * Analyze image and extract issue information
   * POST /api/agent/analyze-image
   */
  async analyzeImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided'
        });
      }

      const { buffer, mimetype } = req.file;
      
      // Analyze image using AI service
      const analysis = await agentService.analyzeImage(buffer, mimetype);
      
      res.json({
        success: true,
        data: {
          title: analysis.title,
          description: analysis.description,
          category: analysis.category,
          confidence: analysis.confidence,
          severity: analysis.severity,
          suggestedPriority: analysis.suggestedPriority,
          processingMethod: 'agentic',
          analysisResult: analysis.originalAnalysis
        }
      });

    } catch (error) {
      console.error('Image analysis error:', error);
      res.status(500).json({
        success: false,
        message: 'Image analysis failed',
        error: error.message
      });
    }
  }

  /**
   * Process voice input and extract issue information
   * POST /api/agent/process-voice
   */
  async processVoice(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No audio file provided'
        });
      }

      const { buffer, mimetype } = req.file;
      
      // Process voice using AI service
      const result = await agentService.processVoiceInput(buffer, mimetype);
      
      res.json({
        success: true,
        data: {
          transcription: result.transcription,
          title: result.title,
          description: result.description,
          category: result.category,
          confidence: result.confidence,
          severity: result.severity,
          suggestedPriority: result.suggestedPriority,
          processingMethod: 'agentic',
          voiceTranscript: result.transcription
        }
      });

    } catch (error) {
      console.error('Voice processing error:', error);
      res.status(500).json({
        success: false,
        message: 'Voice processing failed',
        error: error.message
      });
    }
  }

  /**
   * Analyze text input and extract issue information
   * POST /api/agent/analyze-text
   */
  async analyzeText(req, res) {
    try {
      const { text } = req.body;
      
      if (!text || text.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Text input is required'
        });
      }

      // Analyze text using AI service
      const analysis = await agentService.analyzeText(text);
      
      res.json({
        success: true,
        data: {
          title: analysis.title,
          description: analysis.description,
          category: analysis.category,
          confidence: analysis.confidence,
          severity: analysis.severity,
          suggestedPriority: analysis.suggestedPriority,
          processingMethod: 'agentic'
        }
      });

    } catch (error) {
      console.error('Text analysis error:', error);
      res.status(500).json({
        success: false,
        message: 'Text analysis failed',
        error: error.message
      });
    }
  }

  /**
   * Create a report using agent workflow
   * POST /api/agent/create-report
   */
  async createReport(req, res) {
    try {
      const { 
        title, 
        description, 
        category, 
        coordinates, 
        processingMethod = 'agentic',
        analysisResult,
        voiceTranscript,
        confidence,
        severity,
        suggestedPriority
      } = req.body;

      // Validate required fields
      if (!title || !category || !coordinates) {
        return res.status(400).json({
          success: false,
          message: 'Title, category, and coordinates are required'
        });
      }

      // Parse coordinates
      let parsedCoordinates;
      try {
        parsedCoordinates = JSON.parse(coordinates);
        if (!Array.isArray(parsedCoordinates) || parsedCoordinates.length !== 2) {
          throw new Error('Invalid coordinates format');
        }
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: 'Invalid coordinates format. Expected [lng, lat]'
        });
      }

      // Handle file uploads
      let mediaUrls = [];
      if (req.files && req.files.length > 0) {
        const { uploadToCloudinary } = await import('../utils/uploadToCloudinary.js');
        
        const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer));
        const uploadResults = await Promise.all(uploadPromises);
        mediaUrls = uploadResults.map(result => result.secure_url);
      }

      // Create report with agent metadata
      const report = await Report.create({
        reporterId: req.user._id,
        title,
        description,
        category,
        location: { 
          type: "Point", 
          coordinates: parsedCoordinates 
        },
        mediaUrls,
        urgency: severity || 'medium',
        priority: suggestedPriority || 'medium',
        metadata: {
          confidence: confidence || 0.5,
          processingMethod,
          voiceTranscript,
          analysisResult,
          editHistory: [{
            field: 'initial_creation',
            oldValue: null,
            newValue: 'agent_workflow',
            editedAt: new Date()
          }]
        }
      });

      // Populate reporter information
      const reportToEmit = await Report.findById(report._id).populate("reporterId", "name email");

      // Emit real-time updates
      req.io.emit("newReport", reportToEmit);

      // Create notifications for admins
      const admins = await User.find({ role: 'admin' });
      const notificationTitle = "New Agent Report Submitted";
      const notificationBody = `An AI-assisted report "${report.title}" was submitted by ${req.user.name}.`;

      admins.forEach(admin => {
        createAndEmitNotification(req.io, admin._id, notificationTitle, notificationBody, report._id);
      });

      // Award points for agent submission (bonus points for using AI)
      await User.findByIdAndUpdate(req.user._id, { $inc: { points: 8 } }); // 8 points instead of 5

      res.status(201).json({
        success: true,
        message: 'Agent report created successfully',
        data: {
          reportId: report._id,
          title: report.title,
          category: report.category,
          status: report.status,
          pointsAwarded: 8,
          processingMethod: 'agentic'
        }
      });

    } catch (error) {
      console.error('Agent report creation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create agent report',
        error: error.message
      });
    }
  }

  /**
   * Get agent processing statistics
   * GET /api/agent/stats
   */
  async getStats(req, res) {
    try {
      const stats = agentService.getStats();
      
      // Get additional statistics from database
      const totalAgentReports = await Report.countDocuments({
        'metadata.processingMethod': 'agentic'
      });
      
      const recentAgentReports = await Report.find({
        'metadata.processingMethod': 'agentic',
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      }).countDocuments();

      res.json({
        success: true,
        data: {
          ...stats,
          database: {
            totalAgentReports,
            recentAgentReports
          }
        }
      });

    } catch (error) {
      console.error('Stats retrieval error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve agent statistics',
        error: error.message
      });
    }
  }

  /**
   * Get agent workflow analytics
   * GET /api/agent/analytics
   */
  async getAnalytics(req, res) {
    try {
      const { timeframe = '7d' } = req.query;
      
      const analytics = await agentAnalyticsService.getDashboardData(timeframe);
      
      res.json({
        success: true,
        data: analytics
      });

    } catch (error) {
      console.error('Analytics retrieval error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve agent analytics',
        error: error.message
      });
    }
  }

  /**
   * Validate agent input
   * POST /api/agent/validate
   */
  async validateInput(req, res) {
    try {
      const { inputType, data } = req.body;
      
      if (!inputType || !data) {
        return res.status(400).json({
          success: false,
          message: 'Input type and data are required'
        });
      }

      let validation = { isValid: true, errors: [] };

      switch (inputType) {
        case 'image':
          validation = this.validateImageInput(data);
          break;
        case 'voice':
          validation = this.validateVoiceInput(data);
          break;
        case 'text':
          validation = this.validateTextInput(data);
          break;
        default:
          validation = { isValid: false, errors: ['Invalid input type'] };
      }

      res.json({
        success: true,
        data: validation
      });

    } catch (error) {
      console.error('Input validation error:', error);
      res.status(500).json({
        success: false,
        message: 'Input validation failed',
        error: error.message
      });
    }
  }

  /**
   * Validate image input
   */
  validateImageInput(data) {
    const errors = [];
    
    if (!data.file) {
      errors.push('Image file is required');
    } else {
      if (data.file.size > 10 * 1024 * 1024) {
        errors.push('Image file too large (max 10MB)');
      }
      
      const supportedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!supportedTypes.includes(data.file.type)) {
        errors.push('Unsupported image format');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate voice input
   */
  validateVoiceInput(data) {
    const errors = [];
    
    if (!data.file) {
      errors.push('Audio file is required');
    } else {
      if (data.file.size > 10 * 1024 * 1024) {
        errors.push('Audio file too large (max 10MB)');
      }
      
      const supportedTypes = ['audio/wav', 'audio/mp3', 'audio/m4a', 'audio/webm'];
      if (!supportedTypes.includes(data.file.type)) {
        errors.push('Unsupported audio format');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate text input
   */
  validateTextInput(data) {
    const errors = [];
    
    if (!data.text || data.text.trim().length === 0) {
      errors.push('Text input is required');
    } else if (data.text.length > 2000) {
      errors.push('Text input too long (max 2000 characters)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default new AgentController();
