import express from 'express';
import multer from 'multer';
import {
  initializeAgenticReport,
  uploadInputs,
  editReportData,
  submitAgenticReport,
  getSessionStatus
} from '../controllers/agenticController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Configure multer for single file upload
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Initialize agentic report session
router.post('/initialize', protect, initializeAgenticReport);

// Upload inputs (image + voice)
router.post('/upload-inputs', protect, upload.single('image'), uploadInputs);

// Edit report data during timer window
router.post('/edit', protect, editReportData);

// Submit the final report
router.post('/submit', protect, submitAgenticReport);

// Get session status
router.get('/session/:sessionId', protect, getSessionStatus);

export default router;
