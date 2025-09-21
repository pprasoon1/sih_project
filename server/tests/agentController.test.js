/**
 * Agent Controller Tests
 * Comprehensive test suite for agent workflow functionality
 */

import request from 'supertest';
import express from 'express';
import multer from 'multer';
import agentRoutes from '../routes/agentRoutes.js';
import agentService from '../services/agentService.js';
import Report from '../models/Report.js';
import User from '../models/User.js';

// Mock dependencies
jest.mock('../services/agentService.js');
jest.mock('../models/Report.js');
jest.mock('../models/User.js');

const app = express();
app.use(express.json());
app.use('/api/agent', agentRoutes);

describe('Agent Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/agent/analyze-image', () => {
    it('should analyze image successfully', async () => {
      const mockAnalysis = {
        title: 'Pothole Detected',
        description: 'Large pothole in the road surface',
        category: 'pothole',
        confidence: 0.9,
        severity: 'high',
        suggestedPriority: 'high'
      };

      agentService.analyzeImage.mockResolvedValue(mockAnalysis);

      const response = await request(app)
        .post('/api/agent/analyze-image')
        .attach('image', Buffer.from('fake-image-data'), 'test.jpg')
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Pothole Detected');
      expect(agentService.analyzeImage).toHaveBeenCalled();
    });

    it('should handle image analysis errors', async () => {
      agentService.analyzeImage.mockRejectedValue(new Error('Analysis failed'));

      const response = await request(app)
        .post('/api/agent/analyze-image')
        .attach('image', Buffer.from('fake-image-data'), 'test.jpg')
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });

    it('should reject unsupported file types', async () => {
      const response = await request(app)
        .post('/api/agent/analyze-image')
        .attach('image', Buffer.from('fake-data'), 'test.txt')
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/agent/process-voice', () => {
    it('should process voice successfully', async () => {
      const mockResult = {
        transcription: 'There is a large pothole on Main Street',
        title: 'Pothole on Main Street',
        description: 'There is a large pothole on Main Street',
        category: 'pothole',
        confidence: 0.8,
        severity: 'medium',
        suggestedPriority: 'medium'
      };

      agentService.processVoiceInput.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/agent/process-voice')
        .attach('audio', Buffer.from('fake-audio-data'), 'test.wav')
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.transcription).toBe('There is a large pothole on Main Street');
    });

    it('should handle voice processing errors', async () => {
      agentService.processVoiceInput.mockRejectedValue(new Error('Voice processing failed'));

      const response = await request(app)
        .post('/api/agent/process-voice')
        .attach('audio', Buffer.from('fake-audio-data'), 'test.wav')
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/agent/analyze-text', () => {
    it('should analyze text successfully', async () => {
      const mockAnalysis = {
        title: 'Streetlight Outage',
        description: 'Streetlight is not working on Oak Avenue',
        category: 'streetlight',
        confidence: 0.7,
        severity: 'medium',
        suggestedPriority: 'medium'
      };

      agentService.analyzeText.mockResolvedValue(mockAnalysis);

      const response = await request(app)
        .post('/api/agent/analyze-text')
        .send({ text: 'The streetlight on Oak Avenue is not working' })
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Streetlight Outage');
    });

    it('should reject empty text', async () => {
      const response = await request(app)
        .post('/api/agent/analyze-text')
        .send({ text: '' })
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/agent/create-report', () => {
    it('should create agent report successfully', async () => {
      const mockReport = {
        _id: 'report123',
        title: 'AI Generated Report',
        description: 'Generated by AI',
        category: 'pothole',
        status: 'new',
        metadata: {
          processingMethod: 'agentic',
          confidence: 0.8
        }
      };

      Report.create.mockResolvedValue(mockReport);
      Report.findById.mockResolvedValue(mockReport);
      User.find.mockResolvedValue([]);
      User.findByIdAndUpdate.mockResolvedValue({});

      const response = await request(app)
        .post('/api/agent/create-report')
        .send({
          title: 'AI Generated Report',
          description: 'Generated by AI',
          category: 'pothole',
          coordinates: '[0, 0]',
          processingMethod: 'agentic',
          confidence: 0.8
        })
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.pointsAwarded).toBe(8);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/agent/create-report')
        .send({
          description: 'Missing title and category'
        })
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate coordinates format', async () => {
      const response = await request(app)
        .post('/api/agent/create-report')
        .send({
          title: 'Test Report',
          category: 'pothole',
          coordinates: 'invalid-coordinates'
        })
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/agent/stats', () => {
    it('should return agent statistics', async () => {
      const mockStats = {
        supportedImageTypes: ['image/jpeg', 'image/png'],
        supportedAudioTypes: ['audio/wav', 'audio/mp3'],
        maxFileSize: 10485760,
        services: {
          imageAnalysis: 'Google Gemini 1.5 Flash',
          voiceProcessing: 'Google Cloud Speech-to-Text',
          textAnalysis: 'Google Gemini 1.5 Flash'
        }
      };

      agentService.getStats.mockResolvedValue(mockStats);
      Report.countDocuments.mockResolvedValue(10);

      const response = await request(app)
        .get('/api/agent/stats')
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.supportedImageTypes).toBeDefined();
    });
  });

  describe('GET /api/agent/analytics', () => {
    it('should return analytics data', async () => {
      const mockAnalytics = {
        timeframe: '7d',
        overall: {
          totalReports: 100,
          agentReports: 30,
          manualReports: 70,
          agentUsageRate: 30
        },
        trends: [],
        categories: [],
        confidence: {},
        adoption: {},
        effectiveness: {}
      };

      // Mock the analytics service
      const agentAnalyticsService = require('../services/agentAnalyticsService.js');
      agentAnalyticsService.getDashboardData.mockResolvedValue(mockAnalytics);

      const response = await request(app)
        .get('/api/agent/analytics?timeframe=7d')
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.timeframe).toBe('7d');
    });
  });

  describe('POST /api/agent/validate', () => {
    it('should validate image input', async () => {
      const response = await request(app)
        .post('/api/agent/validate')
        .send({
          inputType: 'image',
          data: {
            file: {
              type: 'image/jpeg',
              size: 1024
            }
          }
        })
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isValid).toBe(true);
    });

    it('should validate voice input', async () => {
      const response = await request(app)
        .post('/api/agent/validate')
        .send({
          inputType: 'voice',
          data: {
            file: {
              type: 'audio/wav',
              size: 2048
            }
          }
        })
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isValid).toBe(true);
    });

    it('should validate text input', async () => {
      const response = await request(app)
        .post('/api/agent/validate')
        .send({
          inputType: 'text',
          data: {
            text: 'This is a valid text input for testing'
          }
        })
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isValid).toBe(true);
    });

    it('should reject invalid input type', async () => {
      const response = await request(app)
        .post('/api/agent/validate')
        .send({
          inputType: 'invalid',
          data: {}
        })
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isValid).toBe(false);
    });
  });

  describe('GET /api/agent/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/agent/health');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Agent services are running');
      expect(response.body.services).toBeDefined();
    });
  });
});

export default app;
