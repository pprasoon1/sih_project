# Agent Backend Implementation

## Overview

This document describes the backend implementation for the agentic civic issue reporting workflow. The agent backend provides AI-powered analysis of images, voice input, and text descriptions to automatically extract issue information and create intelligent reports.

## Architecture

### Core Components

1. **Agent Service** (`services/agentService.js`) - Core AI processing logic
2. **Agent Controller** (`controllers/agentController.js`) - API endpoints and request handling
3. **Agent Routes** (`routes/agentRoutes.js`) - Route definitions and middleware
4. **Agent Middleware** (`middleware/agentMiddleware.js`) - Validation and processing middleware
5. **Agent Analytics** (`services/agentAnalyticsService.js`) - Analytics and reporting
6. **Agent Config** (`config/agentConfig.js`) - Configuration management

### AI Services Integration

- **Google Gemini 1.5 Flash** - Image analysis and text processing
- **Google Cloud Speech-to-Text** - Voice transcription
- **Cloudinary** - Image and media storage

## API Endpoints

### Image Analysis
```
POST /api/agent/analyze-image
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body:
- image: File (JPEG, PNG, WebP, GIF)

Response:
{
  "success": true,
  "data": {
    "title": "Pothole Detected",
    "description": "Large pothole in road surface",
    "category": "pothole",
    "confidence": 0.9,
    "severity": "high",
    "suggestedPriority": "high",
    "processingMethod": "agentic",
    "analysisResult": {...}
  }
}
```

### Voice Processing
```
POST /api/agent/process-voice
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body:
- audio: File (WAV, MP3, M4A, WebM)

Response:
{
  "success": true,
  "data": {
    "transcription": "There is a large pothole on Main Street",
    "title": "Pothole on Main Street",
    "description": "There is a large pothole on Main Street",
    "category": "pothole",
    "confidence": 0.8,
    "severity": "medium",
    "suggestedPriority": "medium",
    "processingMethod": "agentic",
    "voiceTranscript": "There is a large pothole on Main Street"
  }
}
```

### Text Analysis
```
POST /api/agent/analyze-text
Content-Type: application/json
Authorization: Bearer <token>

Body:
{
  "text": "The streetlight on Oak Avenue is not working"
}

Response:
{
  "success": true,
  "data": {
    "title": "Streetlight Outage",
    "description": "The streetlight on Oak Avenue is not working",
    "category": "streetlight",
    "confidence": 0.7,
    "severity": "medium",
    "suggestedPriority": "medium",
    "processingMethod": "agentic"
  }
}
```

### Create Agent Report
```
POST /api/agent/create-report
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body:
- title: string
- description: string
- category: string
- coordinates: string (JSON array [lng, lat])
- processingMethod: string (optional, default: "agentic")
- analysisResult: object (optional)
- voiceTranscript: string (optional)
- confidence: number (optional)
- severity: string (optional)
- suggestedPriority: string (optional)
- media: File[] (optional, max 5 files)

Response:
{
  "success": true,
  "message": "Agent report created successfully",
  "data": {
    "reportId": "report123",
    "title": "AI Generated Report",
    "category": "pothole",
    "status": "new",
    "pointsAwarded": 8,
    "processingMethod": "agentic"
  }
}
```

### Get Statistics
```
GET /api/agent/stats
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "supportedImageTypes": ["image/jpeg", "image/png", ...],
    "supportedAudioTypes": ["audio/wav", "audio/mp3", ...],
    "maxFileSize": 10485760,
    "services": {
      "imageAnalysis": "Google Gemini 1.5 Flash",
      "voiceProcessing": "Google Cloud Speech-to-Text",
      "textAnalysis": "Google Gemini 1.5 Flash"
    },
    "database": {
      "totalAgentReports": 150,
      "recentAgentReports": 25
    }
  }
}
```

### Get Analytics
```
GET /api/agent/analytics?timeframe=7d
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "timeframe": "7d",
    "generatedAt": "2024-01-15T10:30:00.000Z",
    "overall": {
      "totalReports": 1000,
      "agentReports": 300,
      "manualReports": 700,
      "agentUsageRate": 30
    },
    "trends": [...],
    "categories": [...],
    "confidence": {...},
    "adoption": {...},
    "effectiveness": {...}
  }
}
```

### Validate Input
```
POST /api/agent/validate
Content-Type: application/json
Authorization: Bearer <token>

Body:
{
  "inputType": "image|voice|text",
  "data": {
    "file": {...} // for image/voice
    "text": "..." // for text
  }
}

Response:
{
  "success": true,
  "data": {
    "isValid": true,
    "errors": []
  }
}
```

### Health Check
```
GET /api/agent/health

Response:
{
  "success": true,
  "message": "Agent services are running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "services": {
    "imageAnalysis": "Google Gemini 1.5 Flash",
    "voiceProcessing": "Google Cloud Speech-to-Text",
    "textAnalysis": "Google Gemini 1.5 Flash"
  }
}
```

## Database Schema

### Enhanced Report Model

The Report model has been enhanced with agent-specific metadata:

```javascript
{
  // ... existing fields ...
  metadata: {
    confidence: Number, // 0-1, AI confidence score
    processingMethod: String, // 'manual' or 'agentic'
    voiceTranscript: String, // Original voice transcription
    analysisResult: Object, // Raw AI analysis result
    editHistory: [{
      field: String,
      oldValue: Mixed,
      newValue: Mixed,
      editedAt: Date
    }]
  }
}
```

## Configuration

### Environment Variables

```bash
# Required
GOOGLE_API_KEY=your_google_api_key

# Optional
AGENT_MAX_FILE_SIZE=10485760
AGENT_CONFIDENCE_THRESHOLD=0.5
AGENT_RATE_LIMIT_PER_MINUTE=10
```

### Agent Configuration

The agent configuration is centralized in `config/agentConfig.js`:

```javascript
export const agentConfig = {
  ai: {
    google: {
      apiKey: process.env.GOOGLE_API_KEY,
      model: 'gemini-1.5-flash',
      maxTokens: 1000,
      temperature: 0.7
    }
  },
  upload: {
    maxFileSize: 10 * 1024 * 1024,
    maxFiles: 5,
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    supportedAudioTypes: ['audio/wav', 'audio/mp3', 'audio/m4a', 'audio/webm']
  },
  // ... more configuration
};
```

## Error Handling

### Common Error Responses

```javascript
// Validation Error
{
  "success": false,
  "message": "Input validation failed",
  "errors": ["File too large", "Unsupported file type"]
}

// Processing Error
{
  "success": false,
  "message": "Image analysis failed",
  "error": "AI service unavailable"
}

// Rate Limit Error
{
  "success": false,
  "message": "Too many agent requests. Please try again later.",
  "retryAfter": 60
}
```

### Error Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `413` - Payload Too Large (file too big)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error (processing errors)
- `503` - Service Unavailable (AI services down)

## Rate Limiting

The agent endpoints implement rate limiting:

- **Per minute**: 10 requests
- **Per hour**: 100 requests
- **Per day**: 1000 requests

Rate limits are applied per user and reset based on the time window.

## Security

### Input Validation

- File type validation for uploads
- File size limits (10MB max)
- Text length limits (2000 characters max)
- Coordinate validation (valid lat/lng ranges)

### Authentication

All agent endpoints require authentication via JWT token in the Authorization header.

### Data Sanitization

- HTML tag removal from text inputs
- File type verification
- Coordinate range validation
- Confidence score bounds checking

## Monitoring and Analytics

### Metrics Tracked

1. **Usage Metrics**
   - Total agent reports
   - Agent vs manual report ratio
   - Processing method distribution
   - Category breakdown

2. **Performance Metrics**
   - Average processing time
   - Success/failure rates
   - Confidence score distribution
   - Error rates by endpoint

3. **User Adoption**
   - Users who have used agent workflow
   - Power users (10+ agent reports)
   - Adoption rate over time

### Analytics Endpoints

- `GET /api/agent/analytics` - Comprehensive analytics dashboard
- `GET /api/agent/stats` - Basic statistics
- Real-time metrics via Socket.IO

## Testing

### Unit Tests

```bash
npm test -- --grep "Agent Controller"
```

### Integration Tests

```bash
npm run test:integration -- --grep "Agent"
```

### Test Coverage

- Controller endpoints
- Service methods
- Middleware functions
- Error scenarios
- Edge cases

## Deployment

### Prerequisites

1. Google Cloud Platform account
2. Google API key for Gemini
3. Google Cloud Speech-to-Text enabled
4. Cloudinary account for media storage

### Environment Setup

```bash
# Install dependencies
npm install

# Set environment variables
export GOOGLE_API_KEY=your_api_key
export CLOUDINARY_CLOUD_NAME=your_cloud_name
export CLOUDINARY_API_KEY=your_api_key
export CLOUDINARY_API_SECRET=your_api_secret

# Start server
npm start
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5001
CMD ["npm", "start"]
```

## Performance Optimization

### Caching

- AI analysis results cached for 1 hour
- User statistics cached for 5 minutes
- Analytics data cached for 15 minutes

### Database Optimization

- Indexes on frequently queried fields
- Aggregation pipelines for analytics
- Connection pooling

### File Handling

- Stream processing for large files
- Temporary file cleanup
- Memory-efficient buffer handling

## Troubleshooting

### Common Issues

1. **AI Service Errors**
   - Check API key configuration
   - Verify service quotas
   - Check network connectivity

2. **File Upload Issues**
   - Verify file size limits
   - Check supported file types
   - Ensure proper multipart encoding

3. **Database Errors**
   - Check MongoDB connection
   - Verify schema compatibility
   - Check disk space

### Debug Mode

Enable debug logging:

```bash
DEBUG=agent:* npm start
```

### Health Checks

Monitor service health:

```bash
curl http://localhost:5001/api/agent/health
```

## Future Enhancements

### Planned Features

1. **Multi-language Support**
   - Support for multiple languages
   - Language detection
   - Localized responses

2. **Advanced AI Models**
   - Custom trained models
   - Specialized issue detection
   - Improved accuracy

3. **Real-time Processing**
   - WebSocket-based updates
   - Live progress indicators
   - Streaming responses

4. **Batch Processing**
   - Multiple file processing
   - Bulk operations
   - Queue-based processing

### API Versioning

Future API versions will be available at:
- `/api/v2/agent/...`
- `/api/v3/agent/...`

## Support

For issues or questions:

1. Check the troubleshooting section
2. Review error logs
3. Test with sample data
4. Contact development team

## License

This implementation is part of the SIH Project and follows the same licensing terms.
