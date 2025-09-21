import express from "express";
import multer from "multer";
import agentController from "../controllers/agentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    // Allow images and audio files
    const allowedTypes = [
      'image/jpeg',
      'image/png', 
      'image/webp',
      'image/gif',
      'audio/wav',
      'audio/mp3',
      'audio/m4a',
      'audio/webm'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and audio files are allowed.'), false);
    }
  }
});

/**
 * Agent Routes for AI-powered civic issue reporting
 * All routes require authentication
 */

// Image analysis endpoint
router.post(
  "/analyze-image", 
  protect, 
  upload.single('image'),
  agentController.analyzeImage
);

// Voice processing endpoint
router.post(
  "/process-voice", 
  protect, 
  upload.single('audio'),
  agentController.processVoice
);

// Text analysis endpoint
router.post(
  "/analyze-text", 
  protect, 
  agentController.analyzeText
);

// Create report using agent workflow
router.post(
  "/create-report", 
  protect, 
  upload.array('media', 5),
  agentController.createReport
);

// Get agent processing statistics
router.get(
  "/stats", 
  protect, 
  agentController.getStats
);

// Get agent workflow analytics
router.get(
  "/analytics", 
  protect, 
  agentController.getAnalytics
);

// Validate agent input
router.post(
  "/validate", 
  protect, 
  agentController.validateInput
);

// Health check for agent services
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Agent services are running",
    timestamp: new Date().toISOString(),
    services: {
      imageAnalysis: "Google Gemini 1.5 Flash",
      voiceProcessing: "Google Cloud Speech-to-Text",
      textAnalysis: "Google Gemini 1.5 Flash"
    }
  });
});

export default router;
